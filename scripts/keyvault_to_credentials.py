#!/usr/bin/env python3
"""
Script to download secrets from Azure Key Vault and generate credentials.yml
for the EU automated testing framework.
"""

import os
import sys
import yaml
import argparse
from typing import Dict, List, Optional, Tuple
from azure.identity import DefaultAzureCredential
from azure.keyvault.secrets import SecretClient


def parse_secret_name(secret_name: str) -> Tuple[str, str, Optional[str]]:
    """
    Parse secret name to extract opco, testCategory, and testName.
    
    Args:
        secret_name: Secret name in format 'opco-testCategory-testName' or 'opco-testCategory'
    
    Returns:
        Tuple of (opco, testCategory, testName)
    """
    parts = secret_name.split('-')
    if len(parts) < 2:
        raise ValueError(f"Invalid secret name format: {secret_name}")
    
    opco = parts[0]
    test_category = parts[1]
    test_name = '-'.join(parts[2:]) if len(parts) > 2 else None
    
    return opco, test_category, test_name


def download_secrets_from_keyvault(key_vault_url: str) -> List[Dict]:
    """
    Download all secrets from Azure Key Vault and convert to credentials format.
    
    Args:
        key_vault_url: Azure Key Vault URL
    
    Returns:
        List of credential dictionaries
    """
    try:
        # Use DefaultAzureCredential for authentication
        credential = DefaultAzureCredential()
        client = SecretClient(vault_url=key_vault_url, credential=credential)
        
        credentials = []
        
        # List all secrets
        for secret_properties in client.list_properties_of_secrets():
            try:
                # Get the secret value and properties
                secret = client.get_secret(secret_properties.name)
                
                # Parse the secret name
                opco, test_category, test_name = parse_secret_name(secret.name)
                
                # Get username from tags
                username = None
                if secret.properties.tags:
                    username = secret.properties.tags.get("Username")
                
                # Create credential entry
                cred_entry = {
                    "opco": opco,
                    "environment": "stage",  # This will be determined by the Key Vault itself
                    "testCategory": test_category,
                    "credentials": {
                        "username": username or f"user_{opco}_{test_category}",
                        "password": secret.value
                    }
                }
                
                # Add testName if present
                if test_name and test_name != "default":
                    cred_entry["testName"] = test_name
                
                credentials.append(cred_entry)
                
            except Exception as e:
                print(f"Warning: Could not process secret '{secret_properties.name}': {e}")
                continue
        
        return credentials
        
    except Exception as e:
        print(f"Error accessing Key Vault {key_vault_url}: {e}")
        sys.exit(1)


def generate_credentials_file(credentials: List[Dict], output_file: str = "config/credentials.yml"):
    """
    Generate credentials.yml file from the downloaded secrets.
    
    Args:
        credentials: List of credential dictionaries
        output_file: Output file path
    """
    try:
        # Ensure output directory exists
        os.makedirs(os.path.dirname(output_file), exist_ok=True)
        
        # Write credentials to YAML file
        with open(output_file, 'w') as f:
            yaml.dump(credentials, f, default_flow_style=False, sort_keys=False)
        
        print(f"Successfully generated {output_file} with {len(credentials)} credential entries")
        
    except Exception as e:
        print(f"Error writing credentials file: {e}")
        sys.exit(1)


def main():
    """Main function."""
    parser = argparse.ArgumentParser(description='Download secrets from Azure Key Vault and generate credentials.yml')
    parser.add_argument('--keyvault-url', 
                       default=os.environ.get('KEYVAULT_URL'),
                       help='Azure Key Vault URL (or set KEYVAULT_URL environment variable)')
    parser.add_argument('--output-file', 
                       default='config/credentials.yml',
                       help='Output file path (default: config/credentials.yml)')
    
    args = parser.parse_args()
    
    if not args.keyvault_url:
        print("Error: Key Vault URL is required. Set KEYVAULT_URL environment variable or use --keyvault-url")
        sys.exit(1)
    
    print(f"Downloading secrets from Key Vault: {args.keyvault_url}")
    
    # Download secrets from Key Vault
    credentials = download_secrets_from_keyvault(args.keyvault_url)
    
    if not credentials:
        print("Warning: No credentials found in Key Vault")
        return
    
    # Generate credentials file
    generate_credentials_file(credentials, args.output_file)
    
    # Print summary
    print(f"\nSummary:")
    print(f"- Downloaded {len(credentials)} credential entries")
    print(f"- Generated {args.output_file}")
    
    # Group by opco for summary
    opcos = {}
    for cred in credentials:
        opco = cred['opco']
        if opco not in opcos:
            opcos[opco] = []
        opcos[opco].append(cred['testCategory'])
    
    print(f"\nCredentials by Opco:")
    for opco, categories in opcos.items():
        print(f"  {opco}: {', '.join(set(categories))}")


if __name__ == "__main__":
    main() 