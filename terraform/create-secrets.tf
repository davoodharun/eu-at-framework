# Read the credentials YAML file
locals {
  credentials_file = file("${path.module}/../config/credentials.yml")
  credentials_data = yamldecode(local.credentials_file)
}

# Create secret names for each credential entry
locals {
  secret_names = [
    for cred in local.credentials_data : {
      name = "${cred.opco}-${cred.testCategory}${try(cred.testName, null) != null ? "-${cred.testName}" : "-default"}"
      opco = cred.opco
      testCategory = cred.testCategory
      testName = try(cred.testName, null)
      username = cred.credentials.username
      password = cred.credentials.password
    }
  ]
}

# Create secret structures in Key Vault
# Note: Secret values are not set here - they will be entered manually in the portal
resource "azurerm_key_vault_secret" "test_credentials" {
  for_each = { for idx, secret in local.secret_names : secret.name => secret }

  name         = each.value.name
  key_vault_id = azurerm_key_vault.test_credentials.id
  
  # Set a placeholder value - actual values will be entered manually
  value = "PLACEHOLDER_VALUE_ENTER_MANUALLY_IN_PORTAL"
  
  # Add tags for better organization
  tags = {
    Opco         = each.value.opco
    TestCategory = each.value.testCategory
    TestName     = each.value.testName != null ? each.value.testName : "default"
    Username     = each.value.username
    Purpose      = "test-credentials"
    Project      = "eu-automated-tests"
  }
}

# Output the secret names for reference
output "created_secret_names" {
  description = "Names of all created secrets"
  value       = [for secret in azurerm_key_vault_secret.test_credentials : secret.name]
}

output "secret_details" {
  description = "Details of all created secrets"
  value = [
    for secret in azurerm_key_vault_secret.test_credentials : {
      name = secret.name
      tags = secret.tags
    }
  ]
} 