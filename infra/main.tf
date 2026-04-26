terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket = "air-quality-monitor-terraform-state"
    key    = "terraform.tfstate"
    region = "eu-central-1"
  }
}

provider "aws" {
  region = "eu-central-1"
}

data "aws_availability_zones" "available" {
  state = "available"
}

resource "aws_vpc" "main_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true
  tags                 = { Name = "AirQuality-VPC" }
}

resource "aws_subnet" "subnet_a" {
  vpc_id                  = aws_vpc.main_vpc.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = data.aws_availability_zones.available.names[0]
  map_public_ip_on_launch = true
  tags                    = { Name = "AirQuality-Subnet-A" }
}

resource "aws_subnet" "subnet_b" {
  vpc_id                  = aws_vpc.main_vpc.id
  cidr_block              = "10.0.2.0/24"
  availability_zone       = data.aws_availability_zones.available.names[1]
  map_public_ip_on_launch = true
  tags                    = { Name = "AirQuality-Subnet-B" }
}

resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.main_vpc.id
  tags   = { Name = "AirQuality-IGW" }
}

resource "aws_route_table" "public_rt" {
  vpc_id = aws_vpc.main_vpc.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }
}

resource "aws_route_table_association" "a" {
  subnet_id      = aws_subnet.subnet_a.id
  route_table_id = aws_route_table.public_rt.id
}

resource "aws_route_table_association" "b" {
  subnet_id      = aws_subnet.subnet_b.id
  route_table_id = aws_route_table.public_rt.id
}

resource "aws_security_group" "ec2_sg" {
  name        = "fastapi-sg"
  description = "Pozwala na ruch HTTP i SSH"
  vpc_id      = aws_vpc.main_vpc.id

  ingress {
    from_port   = 8000
    to_port     = 8000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 5173
    to_port     = 5173
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "rds_sg" {
  name        = "postgres-sg"
  description = "Tylko ruch z EC2 do bazy"
  vpc_id      = aws_vpc.main_vpc.id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.ec2_sg.id]
  }
}

resource "aws_security_group" "redis_sg" {
  name        = "redis-sg"
  description = "Tylko ruch z EC2 do cache"
  vpc_id      = aws_vpc.main_vpc.id

  ingress {
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [aws_security_group.ec2_sg.id]
  }
}

resource "aws_db_subnet_group" "db_subnet" {
  name       = "air-quality-db-subnet"
  subnet_ids = [aws_subnet.subnet_a.id, aws_subnet.subnet_b.id]
}

resource "aws_elasticache_subnet_group" "redis_subnet" {
  name       = "air-quality-redis-subnet"
  subnet_ids = [aws_subnet.subnet_a.id, aws_subnet.subnet_b.id]
}

resource "aws_db_instance" "postgres" {
  identifier             = "air-quality-db"
  db_name                = "air_quality_db"
  engine                 = "postgres"
  engine_version         = "16"
  instance_class         = "db.t3.micro"
  allocated_storage      = 20
  username               = "monitor_user"
  password               = var.db_password
  db_subnet_group_name   = aws_db_subnet_group.db_subnet.name
  vpc_security_group_ids = [aws_security_group.rds_sg.id]
  skip_final_snapshot    = true
  publicly_accessible    = false
}

resource "aws_elasticache_cluster" "redis" {
  cluster_id         = "air-quality-redis"
  engine             = "redis"
  node_type          = "cache.t3.micro"
  num_cache_nodes    = 1
  port               = 6379
  subnet_group_name  = aws_elasticache_subnet_group.redis_subnet.name
  security_group_ids = [aws_security_group.redis_sg.id]
}

data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]
  filter {
    name   = "name"
    values = ["al2023-ami-2023.*-x86_64"]
  }
}

resource "aws_instance" "fastapi_server" {
  ami                    = data.aws_ami.amazon_linux.id
  instance_type          = "t2.micro"
  subnet_id              = aws_subnet.subnet_a.id
  vpc_security_group_ids = [aws_security_group.ec2_sg.id]
  key_name               = "air-quality-key"

  user_data                   = <<-EOF
#!/bin/bash
set -eux

# Instalacja Docker i Git (z poprawką dla Amazon Linux 2023)
if command -v dnf >/dev/null 2>&1; then
  dnf -y update
  dnf -y install docker git || true
  systemctl daemon-reload
  systemctl enable docker
  systemctl start docker
  usermod -aG docker ec2-user || true
else
  apt-get update -y
  apt-get install -y docker.io git || true
  systemctl enable --now docker
  usermod -aG docker ec2-user || true
fi

# Jeśli podano obraz kontenera (uruchomienie tylko backendu z obrazu)
if [ -n "${var.container_image}" ]; then
  mkdir -p /home/ec2-user/app
  cat > /home/ec2-user/app/.env <<EOL
DATABASE_URL=postgresql://monitor_user:${var.db_password}@${aws_db_instance.postgres.address}:${aws_db_instance.postgres.port}/air_quality_db
REDIS_HOST=${aws_elasticache_cluster.redis.cache_nodes[0].address}
EOL
  IMAGE_REF="${var.container_image}"
  docker pull "$IMAGE_REF" || true
  docker rm -f air_quality_api || true
  docker run -d --name air_quality_api --restart unless-stopped -p 8000:8000 --env-file /home/ec2-user/app/.env "$IMAGE_REF"

else
  # Pobranie repozytorium i uruchomienie pełnego środowiska (Backend + Frontend)
  if [ -n "${var.repo_url}" ]; then
    cd /home/ec2-user
    
    # UWAGA: Jeżeli Twoje zmiany wciąż są na branchu 'feature/aws-deploy', 
    # zmień poniższą linijkę na: git clone -b feature/aws-deploy "${var.repo_url}" app
    git clone "${var.repo_url}" app || (cd app && git pull)
    
    chown -R ec2-user:ec2-user app
    cd app || exit 0

    # Pobieranie publicznego adresu IP maszyny EC2 (Metadane AWS)
    TOKEN=$(curl -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 21600")
    PUBLIC_IP=$(curl -H "X-aws-ec2-metadata-token: $TOKEN" -s http://169.254.169.254/latest/meta-data/public-ipv4)

    # Generowanie pliku .env wewnątrz folderu aplikacji
    cat > .env <<EOL
DATABASE_URL=postgresql://monitor_user:${var.db_password}@${aws_db_instance.postgres.address}:${aws_db_instance.postgres.port}/air_quality_db
REDIS_HOST=${aws_elasticache_cluster.redis.cache_nodes[0].address}
VITE_API_URL=http://$PUBLIC_IP:8000
EOL

    # Pobieranie starej wersji wtyczki docker-compose
    if ! command -v docker-compose >/dev/null 2>&1 && ! docker compose version >/dev/null 2>&1; then
      curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
      chmod +x /usr/local/bin/docker-compose
    fi
    
    # Uruchamianie bazy danych, cache, backendu i frontendu z pominięciem buildx
    DOCKER_BUILDKIT=0 /usr/local/bin/docker-compose up -d backend frontend
  else
    echo "No container_image or repo_url provided; nothing to run"
  fi
fi
EOF
  user_data_replace_on_change = true
  tags                        = { Name = "AirQuality-FastAPI" }
}