output "key_vault_name" {
  description = "Name of the created Key Vault"
  value       = azurerm_key_vault.test_credentials.name
}

output "key_vault_id" {
  description = "ID of the created Key Vault"
  value       = azurerm_key_vault.test_credentials.id
}

output "key_vault_uri" {
  description = "URI of the created Key Vault"
  value       = azurerm_key_vault.test_credentials.vault_uri
}

output "resource_group_name" {
  description = "Name of the resource group containing the Key Vault"
  value       = azurerm_key_vault.test_credentials.resource_group_name
}

output "location" {
  description = "Location of the created Key Vault"
  value       = azurerm_key_vault.test_credentials.location
} 