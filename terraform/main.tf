terraform {
  required_version = ">= 1.0"
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
}

# Configure the Azure Provider
provider "azurerm" {
  	features {}
	skip_provider_registration = true
}


# Data source for existing resource group
data "azurerm_resource_group" "existing" {
  name = var.resource_group_name
}

# Create Key Vault
resource "azurerm_key_vault" "test_credentials" {
  name                        = var.key_vault_name
  location                    = data.azurerm_resource_group.existing.location
  resource_group_name         = data.azurerm_resource_group.existing.name
  enabled_for_disk_encryption = true
  tenant_id                   = data.azurerm_client_config.current.tenant_id
  soft_delete_retention_days  = 7
  purge_protection_enabled    = false

  sku_name = "standard"

  # Access policy for current user
  access_policy {
    tenant_id = data.azurerm_client_config.current.tenant_id
    object_id = data.azurerm_client_config.current.object_id

    key_permissions = [
      "Get", "List", "Create", "Delete", "Update", "Import", "Backup", "Restore", "Recover"
    ]

    secret_permissions = [
      "Get", "List", "Set", "Delete", "Backup", "Restore", "Recover"
    ]

    certificate_permissions = [
      "Get", "List", "Create", "Delete", "Update", "Import", "Backup", "Restore", "Recover"
    ]
  }

  tags = {
    Environment = var.environment
    Project     = "eu-automated-tests"
    Purpose     = "test-credentials"
  }
}

# Get current Azure client configuration
data "azurerm_client_config" "current" {} 