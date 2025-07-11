variable "resource_group_name" {
  description = "Name of the existing resource group where the Key Vault will be created"
  type        = string
  default = "XZE-E-N-UCDINT-S-RGP-10"
}

variable "key_vault_name" {
  description = "Name of the Key Vault to be created"
  type        = string
  default     = "S-E-KVT-UCDATD-ALL-10"
}

variable "environment" {
  description = "Environment name (e.g., dev, stage, prod)"
  type        = string
  default     = "stage"
}

variable "location" {
  description = "Azure region for the Key Vault (will use resource group location if not specified)"
  type        = string
  default     = null
} 