variable "aws_region" {
  type    = string
  default = "eu-central-1"
}

variable "repo_url" {
  type        = string
  default     = "https://github.com/ik-wsb/air-quality-monitor.git"
  description = "HTTPS clone URL of the GitHub repo to deploy (e.g., https://github.com/youruser/air-quality-monitor.git)."
}

variable "container_image" {
  type        = string
  default     = ""
  description = "Full image reference to pull on EC2 (e.g., ghcr.io/owner/air-quality-backend:latest). If empty, EC2 will build image from repo_url."
}

variable "db_password" {
  type        = string
  description = "PostgreSQL password"
  sensitive   = true
}