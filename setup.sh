#!/bin/bash

# Adhvyk AR Studio - EC2 Setup Script
# Usage: ./setup.sh

echo "🚀 Starting Adhvyk AR Studio Setup..."

# 1. Update System
echo "📦 Updating system packages..."
sudo apt-get update && sudo apt-get upgrade -y

# 2. Install Docker
echo "🐳 Installing Docker..."
if ! command -v docker &> /dev/null
then
    sudo apt-get install -y ca-certificates curl gnupg
    sudo install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    sudo chmod a+r /etc/apt/keyrings/docker.gpg

    echo \
      "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
      sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    sudo apt-get update
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    
    # Add user to docker group
    sudo usermod -aG docker $USER
    echo "✅ Docker installed."
else
    echo "✅ Docker already installed."
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
# Use docker compose plugin syntax
sudo docker compose -f docker-compose.prod.yml up -d --build

echo "🎉 Setup Complete!"
echo "👉 Application should be running on http://<YOUR-EC2-IP>"
echo "⚠️  Make sure to configure your Security Group to allow inbound traffic on port 80."
