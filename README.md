# E-Challan Traffic Violation Management System

A digital platform for traffic law enforcement and violation processing. This web application enables traffic officers to issue electronic challans (fines), and allows citizens to view and pay their fines online.

**JIRA Board:** [https://vaishnav-rai.atlassian.net/jira/software/projects/EC/boards/34](https://vaishnav-rai.atlassian.net/jira/software/projects/EC/boards/34)

## Live Demo

**Public URL:** [http://13.236.117.145](http://13.236.117.145/dashboard)

**Test Credentials:**
- **Officer Account:** 
  - Email: `officer@test.com`
  - Password: `password123`
- **Citizen Account:**
  - Email: `citizen@test.com` 
  - Password: `password123`

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Local Development Setup](#local-development-setup)
- [Production Deployment](#production-deployment)
- [CI/CD Pipeline](#cicd-pipeline)
- [API Documentation](#api-documentation)
- [Project Management](#project-management)
- [Contributing](#contributing)
- [Troubleshooting](#troubleshooting)

## Features

### For Traffic Officers
- **Digital Challan Issuance**: Issue e-challans with vehicle details, violation type, and location
- **Violation History**: Access complete history of issued challans
- **System Analytics Dashboard**: Monitor system usage and violation trends

### For Citizens
- **Online Challan Viewing**: Check all personal traffic violations
- **Secure Payment Processing**: Pay fines online with multiple payment options (Mock)
- **Payment History**: Track all payment transactions
- **Violation Details**: View detailed violation information and evidence

### Security Features
- **JWT Authentication**: Secure token-based authentication system
- **Role-Based Access Control**: Different access levels for officers, citizens
- **Session Management**: Automatic session timeout and security measures

## Tech Stack

### Frontend
- **React.js 18** - Modern UI framework
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API calls
- **React Router** - Client-side routing
- **Context API** - State management

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Token authentication
- **Nodemailer** - Email service integration

### DevOps & Deployment
- **AWS EC2** - Cloud hosting platform
- **GitHub Actions** - CI/CD pipeline
- **PM2** - Process management
- **Nginx** - Web server and reverse proxy
- **Docker Ready** - Containerization support

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React.js      │    │   Express.js    │    │   MongoDB       │
│   Frontend      │◄──►│   Backend       │◄──►│   Database      │
│   (Port 3000)   │    │   (Port 5001)   │    │   (Cloud)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         ▲                       ▲                       ▲
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Nginx       │    │      PM2        │    │   GitHub        │
│  (Port 80/443)  │    │   Process Mgr   │    │   Repository    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Prerequisites

Before running this application, make sure you have:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** - Package manager
- **MongoDB** - [Atlas Cloud](https://www.mongodb.com/atlas) or Local installation
- **Git** - Version control system

## Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/idrcmatre/e-challan.git
cd e-challan
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env file with your configuration
nano .env
```

**Backend Environment Variables (.env):**
```env
NODE_ENV=development
PORT=5001
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/echallan?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-here

# Optional: For production
FRONTEND_URL=http://localhost:3000
```

```bash
# Start backend development server
npm run dev
# OR
npm start
```

Backend will run on: `http://localhost:5001`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create environment file (optional)
echo "REACT_APP_API_URL=http://localhost:5001/api" > .env

# Start frontend development server
npm start
```

Frontend will run on: `http://localhost:3000`

### 4. Access the Application

Open your browser and navigate to:
- **Frontend:** `http://localhost:3000`
- **Backend API:** `http://localhost:5001/api`

## Production Deployment

### AWS EC2 Deployment

#### 1. EC2 Instance Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
source ~/.bashrc
nvm install 22
nvm use 22

# Install PM2 and Yarn
npm install -g pm2 yarn

# Install Nginx
sudo apt install nginx -y
```

#### 2. Application Deployment

```bash
# Clone repository
git clone https://github.com/idrcmatre/e-challan.git
cd e-challan

# Setup backend
cd backend
npm install
# Create .env file with production values
npm start # Test manually first

# Setup frontend
cd ../frontend
npm install
npm run build

# Start with PM2
cd ../backend
pm2 start "npm start" --name="e-challan-backend"

cd ../frontend
pm2 serve build/ 3000 --name="e-challan-frontend" --spa

# Save PM2 configuration
pm2 save
pm2 startup # Follow the instructions
```

#### 3. Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/default
```

```nginx
server {
    server_name _;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
    
    location /api/ {
        proxy_pass http://localhost:5001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

```bash
# Test and restart Nginx
sudo nginx -t
sudo systemctl restart nginx
```

### Daily Restart Management (For EC2 Instances)

EC2 instance restarts daily, so use these commands to quickly restore services:

```bash
# Quick restart script
cd ~/www/actions-runner
sudo ./svc.sh start

cd ~/e-challan
pm2 resurrect
pm2 status

# If PM2 shows no processes:
cd backend
pm2 start "npm start" --name="e-challan-backend"
cd ../frontend
pm2 serve build/ 3000 --name="e-challan-frontend" --spa
pm2 save
```

## CI/CD Pipeline

This project uses GitHub Actions for automated deployment:

### Workflow Features
- **Automated Testing** - Runs test suite on every push
- **Multi-environment Support** - Development and production environments  
- **Self-hosted Runner** - Deploys directly to AWS EC2
- **Automatic IP Updates** - Handles dynamic EC2 IP addresses
- **Process Management** - Automatically manages PM2 processes

### Setting Up CI/CD

1. **Configure GitHub Secrets:**
   - `MONGO_URI` - MongoDB connection string
   - `JWT_SECRET` - JWT signing secret
   - `PORT` - Backend Port 
   - `PROD` - All production environment variables

2. **Setup Self-hosted Runner:**
   ```bash
   # On your EC2 instance
   mkdir actions-runner && cd actions-runner
   # Follow GitHub's runner setup instructions
   # Configure as a service
   sudo ./svc.sh install
   sudo ./svc.sh start
   ```

3. **Trigger Deployment:**
   ```bash
   git add .
   git commit -m "Deploy to production"
   git push origin main
   ```

## API Documentation

### Authentication Endpoints
```
POST /api/auth/register    - User registration
POST /api/auth/login       - User login
GET  /api/auth/profile     - Get user profile
PUT  /api/auth/profile     - Update user profile
```

### Challan Management
```
GET    /api/challans       - Get user's challans
POST   /api/challans       - Create new challan (Officers only)
GET    /api/challans/:id   - Get specific challan
PUT    /api/challans/:id   - Update challan (Officers only)
DELETE /api/challans/:id   - Delete challan (Admins only)
```

### Payment Processing
```
POST /api/payments/process - Process challan payment
GET  /api/payments/history - Get payment history
GET  /api/payments/:id     - Get payment details
```


## Project Management

**JIRA Board:** [https://vaishnav-rai.atlassian.net/jira/software/projects/EC/boards/34](https://vaishnav-rai.atlassian.net/jira/software/projects/EC/boards/34)

### Project Structure
- **Epics:** Violation History, Payment Processing System, User Authentication, E-Challan Issuance, Project Deliverables
- **User Stories:** Feature-based development
- **Sprints:** 2-week development cycles
- **Sub-tasks:** Further development tasks



## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

**Vaishnav Rai** - [GitHub](https://github.com/idrcmatre)

## Acknowledgments

- QUT IFN636 Software Life Cycle Management Course
- MongoDB Atlas Free Tier
- GitHub Actions for automated deployment


--test--
---

**Last Updated:** 15 August 2025  
**Version:** 1.0.0  
**Status:** Production Ready
# Test CI/CD Pipeline - Fri Aug 15 10:45:07 UTC 2025
