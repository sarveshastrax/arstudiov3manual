#!/bin/bash

# Adhvyk AR Studio - EC2 Setup Script
# Usage: ./setup.sh

echo "🚀 Starting Adhvyk AR Studio Setup..."

# 1. Update System
echo "📦 Updating system packages..."
sudo apt-get update && sudo apt-get upgrade -y

# 2. Install Docker & Compose Plugin
echo "🐳 Checking Docker installation..."

# Function to check if docker compose (v2) is available
check_docker_compose() {
    docker compose version &> /dev/null
    return $?
}

if ! command -v docker &> /dev/null; then
    echo "Docker not found. Installing..."
    install_docker=true
elif ! check_docker_compose; then
    echo "Docker found, but 'docker compose' is missing. Installing plugin..."
    install_docker=true
else
    echo "✅ Docker and Docker Compose are already installed."
    install_docker=false
fi

if [ "$install_docker" = true ]; then
    sudo apt-get install -y ca-certificates curl gnupg
    sudo install -m 0755 -d /etc/apt/keyrings
    # Remove old key if exists to avoid conflict
    [ -f /etc/apt/keyrings/docker.gpg ] && sudo rm /etc/apt/keyrings/docker.gpg
    
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    sudo chmod a+r /etc/apt/keyrings/docker.gpg

    echo \
      "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
      sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    sudo apt-get update
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    
    sudo usermod -aG docker $USER
    echo "✅ Docker & Compose Plugin installed."
fi

# 3. Create .env file if not exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating a template..."
    cat <<EOT >> .env
MYSQL_ROOT_PASSWORD=rootpassword
MYSQL_DATABASE=adhvyk_ar_studio
MYSQL_USER=adhvyk_user
MYSQL_PASSWORD=adhvyk_password
JWT_SECRET=change_this_secret
JWT_REFRESH_SECRET=change_this_refresh_secret
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_BUCKET_NAME=your_bucket_name
FRONTEND_URL=http://your-ec2-ip-or-domain
EOT
    echo "📝 .env template created. PLEASE EDIT IT with your actual secrets!"
fi

# 4. Run Docker Compose
echo "🚀 Launching containers..."

# Try 'docker compose' first, fallback to 'docker-compose'
if docker compose version &> /dev/null; then
    COMPOSE_CMD="sudo docker compose"
elif command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="sudo docker-compose"
else
    echo "❌ Error: Neither 'docker compose' nor 'docker-compose' found."
    echo "Please install Docker Compose manually."
    exit 1
fi

$COMPOSE_CMD -f docker-compose.prod.yml up -d --build


echo "🎉 Setup Complete!"
echo "👉 Application should be running on http://<YOUR-EC2-IP>"
echo "⚠️  Make sure to configure your Security Group to allow inbound traffic on port 80."
