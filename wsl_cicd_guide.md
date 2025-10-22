# WSL 환경에서 AWS EC2 기반 GoTogether 시스템 완전 배포 가이드

## 서론: 왜 WSL을 사용하는가?

Windows 환경에서 AWS 인프라를 구축하고 관리할 때, PowerShell과 CMD는 종종 파일 인코딩, JSON 파싱, 파일 권한 등의 문제를 일으킵니다. WSL(Windows Subsystem for Linux)은 이러한 문제들을 근본적으로 해결해주는 훌륭한 대안입니다. WSL을 사용하면 Windows에서 네이티브 Linux 환경을 실행할 수 있어, Linux 기반의 AWS CLI와 각종 도구들이 원래 설계된 환경에서 동작하게 됩니다.

이 가이드는 WSL 환경에서 처음부터 끝까지 GoTogether 시스템을 AWS EC2에 배포하는 전체 과정을 상세히 다룹니다. GoTogether는 시각장애인을 위한 보조기기 대여 관리 플랫폼으로, 백엔드 API 서버와 두 개의 프론트엔드(관리자/시설)로 구성된 풀스택 애플리케이션입니다.

---

## 1장: WSL 환경 준비

### 1.1 WSL 설치 및 초기 설정

WSL을 설치하는 과정은 매우 간단해졌습니다. Windows 10 버전 2004 이상 또는 Windows 11에서는 단 하나의 명령어로 설치가 가능합니다.

먼저 PowerShell을 관리자 권한으로 실행한 후 다음 명령어를 입력합니다:

```powershell
# WSL 설치 (Ubuntu가 기본으로 설치됨)
wsl --install

# 설치 후 컴퓨터를 재시작해야 합니다
```

재시작 후 Ubuntu가 자동으로 실행되며, 초기 사용자 계정을 생성하라는 메시지가 나타납니다. 여기서 생성하는 계정은 WSL Ubuntu 내에서 사용할 계정이며, Windows 계정과는 별개입니다.

```bash
# Ubuntu 초기 설정 시 나타나는 프롬프트
Enter new UNIX username: your_username
New password:
Retype new password:
```

### 1.2 WSL 환경 최적화

WSL이 설치되었다면, 이제 개발 환경을 최적화해보겠습니다. WSL은 Windows 파일 시스템에 접근할 수 있지만, 성능상의 이유로 Linux 파일 시스템 내에서 작업하는 것이 훨씬 빠릅니다.

```bash
# WSL Ubuntu 터미널에서 실행

# 시스템 패키지 업데이트
sudo apt update && sudo apt upgrade -y

# 필수 개발 도구 설치
sudo apt install -y \
    curl \
    git \
    unzip \
    build-essential \
    python3-pip

# 작업 디렉토리 생성
mkdir -p ~/aws-projects/gotogether-system
cd ~/aws-projects/gotogether-system

# Git 전역 설정 (본인 정보로 변경)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### 1.3 Windows와 WSL 간 파일 공유 이해하기

WSL의 가장 강력한 기능 중 하나는 Windows와 Linux 파일 시스템 간의 상호 운용성입니다. 이를 이해하면 작업 효율성이 크게 향상됩니다.

Windows에서 WSL 파일에 접근하려면 파일 탐색기에서 `\\wsl$` 경로를 사용합니다. 반대로 WSL에서 Windows 파일에 접근하려면 `/mnt/` 경로를 사용합니다. 예를 들어, Windows의 `C:\Users\YourName\Documents`는 WSL에서 `/mnt/c/Users/YourName/Documents`로 접근할 수 있습니다.

```bash
# WSL에서 Windows 파일 접근 예시
ls /mnt/c/Users/

# Windows의 Downloads 폴더에서 파일 복사
cp /mnt/c/Users/YourName/Downloads/file.txt ~/

# 하지만 성능을 위해 WSL 파일 시스템 내에서 작업하는 것을 권장
pwd  # 현재 위치 확인: /home/your_username/aws-projects/gotogether-system
```

---

## 2장: AWS CLI 설치 및 구성

### 2.1 AWS CLI v2 설치

AWS CLI는 AWS 서비스를 명령줄에서 제어할 수 있게 해주는 도구입니다. WSL에서는 Linux 버전의 AWS CLI를 설치하며, 이는 Windows 버전보다 안정적이고 일관된 동작을 보장합니다.

```bash
# AWS CLI v2 다운로드 및 설치
cd /tmp
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# 설치 확인
aws --version
# 출력 예: aws-cli/2.x.x Python/3.x.x Linux/5.x.x-x-microsoft-standard-WSL2

# 설치 디렉토리로 돌아가기
cd ~/aws-projects/gotogether-system
```

### 2.2 AWS 자격 증명 구성

AWS CLI를 사용하려면 AWS 계정의 액세스 키가 필요합니다. 이 키는 AWS IAM 콘솔에서 생성할 수 있으며, 한 번만 표시되므로 안전한 곳에 보관해야 합니다.

```bash
# AWS CLI 구성
aws configure

# 다음 정보를 입력합니다:
AWS Access Key ID [None]: AKIAIOSFODNN7EXAMPLE
AWS Secret Access Key [None]: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
Default region name [None]: ap-northeast-2
Default output format [None]: json
```

구성이 완료되면 자격 증명은 `~/.aws/credentials` 파일에, 설정은 `~/.aws/config` 파일에 저장됩니다. 이 파일들을 직접 편집할 수도 있습니다:

```bash
# 자격 증명 확인
cat ~/.aws/credentials

# 설정 확인
cat ~/.aws/config

# 자격 증명 테스트
aws sts get-caller-identity
```

---

## 3장: EC2 인스턴스 생성 및 구성

### 3.1 키 페어 생성

EC2 인스턴스에 SSH로 접속하려면 키 페어가 필요합니다. 이미 키 페어가 있다면 이 단계를 건너뛸 수 있습니다.

```bash
# 키 페어 생성 및 로컬 저장
aws ec2 create-key-pair \
    --key-name gotogether-key \
    --query 'KeyMaterial' \
    --output text > ~/.ssh/gotogether-key.pem

# 키 파일 권한 설정 (매우 중요!)
chmod 400 ~/.ssh/gotogether-key.pem

# 키가 제대로 생성되었는지 확인
ls -la ~/.ssh/gotogether-key.pem
```

### 3.2 보안 그룹 생성

보안 그룹은 EC2 인스턴스의 방화벽 역할을 합니다. GoTogether 시스템에 필요한 포트를 열어둡니다.

```bash
# 보안 그룹 생성
SECURITY_GROUP_ID=$(aws ec2 create-security-group \
    --group-name gotogether-security-group \
    --description "Security group for GoTogether application" \
    --query 'GroupId' \
    --output text)

echo "Created security group: $SECURITY_GROUP_ID"

# 현재 IP 주소 확인 (SSH 접속용)
MY_IP=$(curl -s http://checkip.amazonaws.com)
echo "Your current IP: $MY_IP"

# SSH 포트 (22) 열기 - 본인 IP만 허용
aws ec2 authorize-security-group-ingress \
    --group-id $SECURITY_GROUP_ID \
    --protocol tcp \
    --port 22 \
    --cidr "$MY_IP/32"

# HTTP 포트 (80) 열기 - 모든 IP 허용
aws ec2 authorize-security-group-ingress \
    --group-id $SECURITY_GROUP_ID \
    --protocol tcp \
    --port 80 \
    --cidr 0.0.0.0/0

# HTTPS 포트 (443) 열기 - 모든 IP 허용
aws ec2 authorize-security-group-ingress \
    --group-id $SECURITY_GROUP_ID \
    --protocol tcp \
    --port 443 \
    --cidr 0.0.0.0/0

# Backend API 포트 (3002) - 개발/테스트용
aws ec2 authorize-security-group-ingress \
    --group-id $SECURITY_GROUP_ID \
    --protocol tcp \
    --port 3002 \
    --cidr 0.0.0.0/0

# 설정된 규칙 확인
aws ec2 describe-security-groups --group-ids $SECURITY_GROUP_ID
```

### 3.3 EC2 인스턴스 생성

이제 t3.small 인스턴스를 생성합니다. t3.small은 2 vCPU와 2GB 메모리를 제공하여 GoTogether 애플리케이션을 실행하기에 충분한 사양입니다.

```bash
# 최신 Amazon Linux 2023 AMI ID 가져오기
AMI_ID=$(aws ec2 describe-images \
    --owners amazon \
    --filters \
        "Name=name,Values=al2023-ami-*-x86_64" \
        "Name=state,Values=available" \
    --query 'Images | sort_by(@, &CreationDate) | [-1].ImageId' \
    --output text)

echo "Using AMI: $AMI_ID"

# EC2 인스턴스 생성
INSTANCE_ID=$(aws ec2 run-instances \
    --image-id $AMI_ID \
    --instance-type t3.small \
    --key-name gotogether-key \
    --security-group-ids $SECURITY_GROUP_ID \
    --block-device-mappings '[
        {
            "DeviceName": "/dev/xvda",
            "Ebs": {
                "VolumeSize": 40,
                "VolumeType": "gp3",
                "DeleteOnTermination": true
            }
        }
    ]' \
    --tag-specifications 'ResourceType=instance,Tags=[
        {Key=Name,Value=GoTogether-Server},
        {Key=Environment,Value=Production},
        {Key=Application,Value=GoTogether}
    ]' \
    --query 'Instances[0].InstanceId' \
    --output text)

echo "Instance created: $INSTANCE_ID"

# 인스턴스가 실행될 때까지 대기
echo "Waiting for instance to be running..."
aws ec2 wait instance-running --instance-ids $INSTANCE_ID

# 퍼블릭 IP 가져오기
PUBLIC_IP=$(aws ec2 describe-instances \
    --instance-ids $INSTANCE_ID \
    --query 'Reservations[0].Instances[0].PublicIpAddress' \
    --output text)

echo "Instance is ready!"
echo "Instance ID: $INSTANCE_ID"
echo "Public IP: $PUBLIC_IP"
echo "Connect using: ssh -i ~/.ssh/gotogether-key.pem ec2-user@$PUBLIC_IP"
```

---

## 4장: IAM 역할 구성

### 4.1 IAM 역할의 이해

IAM(Identity and Access Management) 역할은 EC2 인스턴스가 다른 AWS 서비스에 안전하게 접근할 수 있도록 해주는 메커니즘입니다. 액세스 키를 인스턴스에 저장하는 대신 IAM 역할을 사용하면, AWS가 자동으로 임시 자격 증명을 관리해주어 보안이 크게 향상됩니다.

### 4.2 IAM 역할 생성

```bash
# Trust Policy 문서 생성
cat > trust-policy.json <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "Service": "ec2.amazonaws.com"
            },
            "Action": "sts:AssumeRole"
        }
    ]
}
EOF

# IAM 역할 생성
aws iam create-role \
    --role-name GoTogether-EC2-Role \
    --assume-role-policy-document file://trust-policy.json

# 필요한 정책 연결
# S3 읽기 권한 (CodeDeploy용)
aws iam attach-role-policy \
    --role-name GoTogether-EC2-Role \
    --policy-arn arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess

# Systems Manager Parameter Store 읽기 권한
aws iam attach-role-policy \
    --role-name GoTogether-EC2-Role \
    --policy-arn arn:aws:iam::aws:policy/AmazonSSMReadOnlyAccess

# CloudWatch 로그 권한
aws iam attach-role-policy \
    --role-name GoTogether-EC2-Role \
    --policy-arn arn:aws:iam::aws:policy/CloudWatchAgentServerPolicy

# Instance Profile 생성 및 역할 연결
aws iam create-instance-profile \
    --instance-profile-name GoTogether-EC2-Profile

aws iam add-role-to-instance-profile \
    --instance-profile-name GoTogether-EC2-Profile \
    --role-name GoTogether-EC2-Role

# EC2 인스턴스에 IAM 역할 연결
aws ec2 associate-iam-instance-profile \
    --instance-id $INSTANCE_ID \
    --iam-instance-profile Name=GoTogether-EC2-Profile

echo "IAM role attached to EC2 instance"
```

---

## 5장: EC2 서버 초기 설정

### 5.1 SSH 접속 및 초기 설정 스크립트

이제 EC2 인스턴스에 접속하여 필요한 소프트웨어를 설치하고 환경을 구성합니다.

```bash
# SSH 접속
ssh -i ~/.ssh/gotogether-key.pem ec2-user@$PUBLIC_IP

# 접속 후 실행할 초기 설정 스크립트
cat > ~/setup.sh <<'SCRIPT'
#!/bin/bash
set -e

echo "Starting EC2 instance initial setup for GoTogether..."

# System update
echo "Updating system packages..."
sudo dnf update -y

# Install basic development tools
echo "Installing development tools..."
sudo dnf groupinstall -y "Development Tools"
sudo dnf install -y curl git wget unzip

# Install Python and pip (Amazon Linux 2023 방식)
echo "Installing Python and pip..."
python3 -m ensurepip --upgrade || {
    curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py
    python3 get-pip.py
    rm get-pip.py
}

# Install Node.js via NVM
echo "Installing Node.js..."
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

nvm install 22
nvm use 22
nvm alias default 22

# Install npm
npm install -g npm@latest

# Install PM2
npm install -g pm2

# Install Nginx
echo "Installing Nginx..."
sudo dnf install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx

# Install MySQL
echo "Installing MySQL..."
sudo dnf install -y mariadb105-server
sudo systemctl enable mariadb
sudo systemctl start mariadb

# Install CodeDeploy Agent
echo "Installing CodeDeploy Agent..."
sudo dnf install -y ruby wget
cd /tmp
wget https://aws-codedeploy-ap-northeast-2.s3.ap-northeast-2.amazonaws.com/latest/install
chmod +x ./install
sudo ./install auto
sudo systemctl enable codedeploy-agent
sudo systemctl start codedeploy-agent

# Create application directories
mkdir -p ~/gotogether-system
sudo mkdir -p /var/www/gotogether-admin
sudo mkdir -p /var/www/gotogether-facility
sudo chown -R ec2-user:ec2-user /var/www/gotogether-admin
sudo chown -R ec2-user:ec2-user /var/www/gotogether-facility

echo "======================================"
echo "Installation Summary"
echo "======================================"
echo "✓ curl: $(which curl)"
echo "✓ git: $(which git)"
echo "✓ make: $(which make)"
echo "✓ gcc: $(which gcc)"
echo "✓ node: $(which node)"
echo "✓ npm: $(which npm)"
echo "✓ python3: $(which python3)"
echo "✓ pip3: $(which pip3)"
echo "✓ pm2: $(which pm2)"

echo ""
echo "Setup completed successfully!"
SCRIPT

# 스크립트 실행
chmod +x ~/setup.sh
~/setup.sh
```

### 5.2 MySQL 보안 설정

MySQL 설치 후에는 반드시 보안 설정을 수행해야 합니다. 이 과정에서 root 비밀번호를 설정하고 불필요한 접근을 차단합니다.

```bash
# MySQL 보안 설정 실행
sudo mysql_secure_installation

# 프롬프트에 따라 다음과 같이 응답:
# 1. 임시 비밀번호 입력 (없으면 그냥 Enter)
# 2. 새 root 비밀번호 설정 (강력한 비밀번호 사용)
# 3. Remove anonymous users? Y
# 4. Disallow root login remotely? Y
# 5. Remove test database? Y
# 6. Reload privilege tables? Y

# MySQL 접속하여 GoTogether 데이터베이스 생성
mysql -u root -p

# MySQL 콘솔에서 실행
CREATE DATABASE gotogether CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'gotogether_user'@'localhost' IDENTIFIED BY 'YourStrongPassword123!';
GRANT ALL PRIVILEGES ON gotogether.* TO 'gotogether_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

## 6장: Nginx 웹 서버 구성

### 6.1 Nginx 설정 파일 생성

Nginx는 정적 파일 서빙과 리버스 프록시 역할을 수행합니다. GoTogether는 두 개의 프론트엔드(Admin, Facility)와 하나의 백엔드 API로 구성됩니다.

```bash
# Nginx 설정 파일 생성
sudo nano /etc/nginx/conf.d/gotogether.conf
```

다음 내용을 입력합니다:

```nginx
# Backend API server
server {
    listen 80;
    server_name api.gotogether.kr;  # 실제 도메인으로 변경

    client_max_body_size 100M;

    location / {
        proxy_pass http://127.0.0.1:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # 타임아웃 설정
        proxy_connect_timeout 600;
        proxy_send_timeout 600;
        proxy_read_timeout 600;
    }
}

# Admin Frontend server
server {
    listen 80;
    server_name admin.gotogether.kr;  # 실제 도메인으로 변경

    root /var/www/gotogether-admin;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /assets {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

# Facility Frontend server
server {
    listen 80;
    server_name facility.gotogether.kr;  # 실제 도메인으로 변경

    root /var/www/gotogether-facility;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /assets {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
# Nginx 설정 테스트
sudo nginx -t

# Nginx 재시작
sudo systemctl restart nginx
```

---

## 7장: 자동 배포 시스템 구축

### 7.1 CodeDeploy 설정

CodeDeploy는 GitHub에서 EC2로 코드를 자동으로 배포해주는 AWS 서비스입니다. 먼저 필요한 IAM 역할을 생성합니다.

```bash
# WSL 환경으로 돌아오기 (EC2에서 exit)
exit

# CodeDeploy 서비스 역할 생성
cat > codedeploy-trust-policy.json <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "Service": "codedeploy.amazonaws.com"
            },
            "Action": "sts:AssumeRole"
        }
    ]
}
EOF

aws iam create-role \
    --role-name CodeDeployServiceRole \
    --assume-role-policy-document file://codedeploy-trust-policy.json

aws iam attach-role-policy \
    --role-name CodeDeployServiceRole \
    --policy-arn arn:aws:iam::aws:policy/AWSCodeDeployRole

# CodeDeploy 애플리케이션 생성
aws deploy create-application \
    --application-name gotogether-app \
    --compute-platform Server

# 배포 그룹 생성
aws deploy create-deployment-group \
    --application-name gotogether-app \
    --deployment-group-name gotogether-production \
    --deployment-config-name CodeDeployDefault.OneAtATime \
    --service-role-arn arn:aws:iam::$(aws sts get-caller-identity --query Account --output text):role/CodeDeployServiceRole \
    --ec2-tag-filters Type=KEY_AND_VALUE,Key=Name,Value=GoTogether-Server
```

### 7.2 프로젝트 배포 스크립트 생성

프로젝트 루트에 필요한 배포 파일들을 생성합니다.

```bash
# 프로젝트 루트에서 실행 (gotogether-system 디렉토리)
cd ~/aws-projects/gotogether-system

# appspec.yml 생성
cat > appspec.yml <<'EOF'
version: 0.0
os: linux

files:
  - source: /
    destination: /home/ec2-user/gotogether-system
    overwrite: true

permissions:
  - object: /home/ec2-user/gotogether-system
    owner: ec2-user
    group: ec2-user
    mode: 755
    type:
      - directory
      - file

hooks:
  ApplicationStop:
    - location: scripts/stop_application.sh
      timeout: 60
      runas: ec2-user

  BeforeInstall:
    - location: scripts/before_install.sh
      timeout: 300
      runas: ec2-user

  AfterInstall:
    - location: scripts/after_install.sh
      timeout: 600
      runas: ec2-user

  ApplicationStart:
    - location: scripts/start_application.sh
      timeout: 300
      runas: ec2-user

  ValidateService:
    - location: scripts/validate_service.sh
      timeout: 60
      runas: ec2-user
EOF

# 배포 스크립트 생성
mkdir -p scripts

cat > scripts/stop_application.sh <<'EOF'
#!/bin/bash
echo "Stopping GoTogether application..."
pm2 stop all || true
EOF

cat > scripts/before_install.sh <<'EOF'
#!/bin/bash
echo "Preparing for installation..."
rm -rf /home/ec2-user/gotogether-system/backend/node_modules
rm -rf /home/ec2-user/gotogether-system/frontend/admin/node_modules
rm -rf /home/ec2-user/gotogether-system/frontend/facility/node_modules
EOF

cat > scripts/after_install.sh <<'EOF'
#!/bin/bash
set -e

echo "Installing dependencies for GoTogether..."

# Load NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Backend
echo "Building backend..."
cd /home/ec2-user/gotogether-system/backend
npm install
npm run build

# Create .env file from Parameter Store
aws ssm get-parameter --name "/gotogether/production/backend-env" --with-decryption --query 'Parameter.Value' --output text > .env || echo "Using default .env"

# Admin Frontend
echo "Building admin frontend..."
cd /home/ec2-user/gotogether-system/frontend/admin
npm install
npm run build

# Copy to Nginx directory
sudo rm -rf /var/www/gotogether-admin/*
sudo cp -r .next/standalone/* /var/www/gotogether-admin/ || sudo cp -r dist/* /var/www/gotogether-admin/
sudo chown -R nginx:nginx /var/www/gotogether-admin

# Facility Frontend
echo "Building facility frontend..."
cd /home/ec2-user/gotogether-system/frontend/facility
npm install
npm run build

# Copy to Nginx directory
sudo rm -rf /var/www/gotogether-facility/*
sudo cp -r .next/standalone/* /var/www/gotogether-facility/ || sudo cp -r dist/* /var/www/gotogether-facility/
sudo chown -R nginx:nginx /var/www/gotogether-facility

echo "Build completed successfully!"
EOF

cat > scripts/start_application.sh <<'EOF'
#!/bin/bash
echo "Starting GoTogether application..."

# Load NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

cd /home/ec2-user/gotogether-system/backend
pm2 delete gotogether-backend || true
pm2 start dist/main.js --name gotogether-backend --max-memory-restart 800M
pm2 save
pm2 startup systemd -u ec2-user --hp /home/ec2-user | grep 'sudo' | bash || true

sudo systemctl reload nginx

echo "Application started successfully!"
EOF

cat > scripts/validate_service.sh <<'EOF'
#!/bin/bash
echo "Validating GoTogether service..."
sleep 10
curl -f http://localhost:3002/api || exit 1
echo "Application is healthy"
EOF

# 실행 권한 부여
chmod +x scripts/*.sh
```

---

## 8장: GitHub Actions를 통한 CI/CD

### 8.1 GitHub Actions 워크플로우 설정

GitHub Actions를 사용하면 코드를 푸시할 때마다 자동으로 배포가 실행됩니다.

```bash
# .github/workflows 디렉토리 생성
mkdir -p .github/workflows

# 배포 워크플로우 생성
cat > .github/workflows/deploy.yml <<'EOF'
name: Deploy GoTogether to EC2

on:
  push:
    branches: [main]

env:
  AWS_REGION: ap-northeast-2
  APPLICATION_NAME: gotogether-app
  DEPLOYMENT_GROUP: gotogether-production

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v2
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: ${{ env.AWS_REGION }}

    - name: Create deployment package
      run: |
        zip -r deployment.zip . -x "*.git*" ".github/*" "*.md" "node_modules/*" "*/node_modules/*"

    - name: Upload to S3
      run: |
        BUCKET_NAME="gotogether-deployments-$(date +%s)"
        aws s3 mb s3://$BUCKET_NAME
        aws s3 cp deployment.zip s3://$BUCKET_NAME/
        echo "BUCKET_NAME=$BUCKET_NAME" >> $GITHUB_ENV

    - name: Create CodeDeploy Deployment
      run: |
        DEPLOYMENT_ID=$(aws deploy create-deployment \
          --application-name ${{ env.APPLICATION_NAME }} \
          --deployment-group-name ${{ env.DEPLOYMENT_GROUP }} \
          --s3-location bucket=${{ env.BUCKET_NAME }},key=deployment.zip,bundleType=zip \
          --query 'deploymentId' \
          --output text)

        echo "Deployment ID: $DEPLOYMENT_ID"

        # 배포 상태 확인
        aws deploy wait deployment-successful --deployment-id $DEPLOYMENT_ID
EOF
```

### 8.2 환경 변수 설정

민감한 정보는 AWS Systems Manager Parameter Store에 저장합니다.

```bash
# 환경 변수를 Parameter Store에 저장
cat > backend.env <<EOF
NODE_ENV=production
PORT=3002

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=gotogether_user
DB_PASSWORD=YourStrongPassword123!
DB_NAME=gotogether

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_ACCESS_TOKEN_EXPIRES=1h
JWT_REFRESH_TOKEN_EXPIRES=7d

# CORS
CORS_ORIGIN=https://admin.gotogether.kr,https://facility.gotogether.kr

# Other settings
TZ=Asia/Seoul
EOF

# Parameter Store에 저장
aws ssm put-parameter \
    --name "/gotogether/production/backend-env" \
    --type "SecureString" \
    --value "$(cat backend.env)" \
    --overwrite

echo "Environment variables stored in Parameter Store"
rm backend.env  # 로컬 파일 삭제 (보안)
```

---

## 9장: SSL 인증서 설정

### 9.1 Let's Encrypt SSL 인증서 발급

HTTPS를 사용하려면 SSL 인증서가 필요합니다. Let's Encrypt는 무료 SSL 인증서를 제공합니다.

```bash
# EC2에 다시 접속
ssh -i ~/.ssh/gotogether-key.pem ec2-user@$PUBLIC_IP

# Certbot 설치
sudo dnf install -y certbot python3-certbot-nginx

# SSL 인증서 발급
sudo certbot --nginx \
    -d gt-api.remo.re.kr \
    -d gt-facility.remo.re.kr \
    -d gt-admin.remo.re.kr \
    --non-interactive \
    --agree-tos \
    --email newtechremo@gmail.com

# 자동 갱신 설정
echo "0 0,12 * * * root python3 -c 'import random; import time; time.sleep(random.random() * 3600)' && certbot renew -q" | sudo tee -a /etc/crontab > /dev/null

# 갱신 테스트
sudo certbot renew --dry-run
```

---

## 10장: 모니터링 및 유지보수

### 10.1 모니터링 스크립트 생성

시스템 상태를 쉽게 확인할 수 있는 스크립트를 만들어둡니다.

```bash
# 모니터링 스크립트 생성
cat > ~/monitor.sh <<'EOF'
#!/bin/bash

echo "====================================="
echo "  GoTogether System Status Monitor  "
echo "====================================="

# 색상 정의
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# 서비스 상태 확인 함수
check_service() {
    if systemctl is-active --quiet $1; then
        echo -e "$2: ${GREEN}Running${NC}"
    else
        echo -e "$2: ${RED}Stopped${NC}"
    fi
}

# 시스템 정보
echo -e "\n📊 System Information:"
echo "------------------------"
echo "Hostname: $(hostname)"
echo "IP Address: $(curl -s http://checkip.amazonaws.com)"
echo "Uptime: $(uptime -p)"

# 리소스 사용량
echo -e "\n💾 Resource Usage:"
echo "------------------------"
echo "CPU Load: $(uptime | awk -F'load average:' '{print $2}')"
echo "Memory: $(free -h | awk '/^Mem:/ {printf "%s / %s (%.1f%%)", $3, $2, $3/$2*100}')"
echo "Disk: $(df -h / | awk 'NR==2 {printf "%s / %s (%s)", $3, $2, $5}')"

# 서비스 상태
echo -e "\n🔧 Service Status:"
echo "------------------------"
check_service nginx "Nginx"
check_service mariadb "MySQL"
check_service codedeploy-agent "CodeDeploy"

# PM2 프로세스
echo -e "\n📦 PM2 Processes:"
echo "------------------------"
pm2 list

# 최근 로그
echo -e "\n📝 Recent Application Logs:"
echo "------------------------"
pm2 logs --lines 10 --nostream

echo "====================================="
EOF

chmod +x ~/monitor.sh
```

### 10.2 백업 스크립트

데이터베이스를 정기적으로 백업하는 스크립트를 생성합니다.

```bash
# 백업 스크립트 생성
cat > ~/backup.sh <<'EOF'
#!/bin/bash

BACKUP_DIR="/home/ec2-user/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="gotogether"
DB_USER="gotogether_user"
DB_PASS="YourStrongPassword123!"  # 실제 비밀번호로 변경

# 백업 디렉토리 생성
mkdir -p $BACKUP_DIR

# 데이터베이스 백업
echo "Creating database backup..."
mysqldump -u $DB_USER -p$DB_PASS $DB_NAME | gzip > $BACKUP_DIR/db_backup_$DATE.sql.gz

# S3에 업로드 (옵션)
# aws s3 cp $BACKUP_DIR/db_backup_$DATE.sql.gz s3://your-backup-bucket/

# 7일 이상 된 백업 삭제
find $BACKUP_DIR -name "db_backup_*.sql.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_DIR/db_backup_$DATE.sql.gz"
EOF

chmod +x ~/backup.sh

# Cron 작업 추가 (매일 새벽 2시 백업)
(crontab -l 2>/dev/null; echo "0 2 * * * /home/ec2-user/backup.sh") | crontab -
```

---

## 마무리: 전체 시스템 검증

모든 설정이 완료되었다면, 다음 명령어로 전체 시스템을 검증합니다:

```bash
# WSL에서 실행
# 시스템 상태 종합 확인
ssh -i ~/.ssh/gotogether-key.pem ec2-user@$PUBLIC_IP "~/monitor.sh"

# 웹 서비스 확인
curl -I http://$PUBLIC_IP
curl -I https://admin.gotogether.kr
curl -I https://facility.gotogether.kr
curl -I https://api.gotogether.kr/api  # API 헬스체크
```

## GoTogether 시스템 아키텍처 요약

```
┌─────────────────────────────────────────────────────────┐
│                     인터넷 사용자                           │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│                AWS EC2 Instance (t3.small)              │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │             Nginx (Reverse Proxy)                │   │
│  │  - Port 80/443 (HTTPS with Let's Encrypt)      │   │
│  └──┬──────────────┬────────────────┬───────────────┘   │
│     │              │                │                   │
│     ▼              ▼                ▼                   │
│  ┌─────────┐  ┌─────────┐  ┌───────────────┐           │
│  │ Admin   │  │Facility │  │   Backend API │           │
│  │Frontend │  │Frontend │  │   (NestJS)    │           │
│  │:5173    │  │:5174    │  │   Port 3002   │           │
│  │(Next.js)│  │(Next.js)│  └───────┬───────┘           │
│  └─────────┘  └─────────┘          │                   │
│                                     ▼                   │
│                           ┌──────────────────┐          │
│                           │  MySQL/MariaDB   │          │
│                           │  Port 3306       │          │
│                           │  DB: gotogether  │          │
│                           └──────────────────┘          │
│                                                          │
│  ┌───────────────────────────────────────────────────┐  │
│  │              PM2 Process Manager                  │  │
│  │  - gotogether-backend (auto-restart)             │  │
│  └───────────────────────────────────────────────────┘  │
│                                                          │
│  ┌───────────────────────────────────────────────────┐  │
│  │           CodeDeploy Agent                        │  │
│  │  - 자동 배포 및 업데이트                              │  │
│  └───────────────────────────────────────────────────┘  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

이제 GitHub에 코드를 푸시하면 자동으로 EC2에 배포되는 완전한 CI/CD 파이프라인이 구축되었습니다. WSL 환경을 사용함으로써 Windows에서 발생하는 여러 호환성 문제들을 피하고, Linux 네이티브 환경의 모든 이점을 누릴 수 있게 되었습니다.

각 단계에서 문제가 발생하면 로그를 확인하고 (`pm2 logs`, `/var/log/nginx/error.log`, `/opt/codedeploy-agent/deployment-root/deployment-logs/`), 필요시 서비스를 재시작하면 대부분의 문제를 해결할 수 있습니다.
