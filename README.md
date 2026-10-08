# 🐾Pet Grooming Salon Management System

A full-stack management platform for pet grooming salons. It streamlines daily operations, appointment scheduling, customer and pet records, custom service pricing, staff access control, and business reporting with PDF export.

## 🛠️ Tech Stack

Frontend: React 19 + TypeScript + Vite + Tailwind CSS

Backend: Spring Boot 3.2 + Java 17

Database: MySQL 8

Deployment: Docker / Docker Compose

## 🚀 Run with Docker
Prerequisites

Make sure you have:

* Docker Desktop
installed and running.

The project repository cloned locally.

1. Navigate to the Project Root

Open a terminal and navigate to the directory containing docker-compose.yml:

cd /path/to/project

2. Build and Start the Application
   docker compose up --build


Docker will build the required images and start the application and database services.

3. Open the Application

Once the containers are running, open:

http://localhost:3000

4. Stop the Application

To stop the running containers:

docker compose down

5. Stop and Wipe the Database

To stop the containers and remove the database volumes:

docker compose down --volumes


⚠️ Warning: docker compose down --volumes permanently removes the Docker volumes associated with the application, including the database data.

🔑 Demo Login Credentials
Role	Name	Username	Password
Admin	David Tanner — Owner	admin	password123
Staff	Michael Ross — Groomer	staff	password123
👤 User Roles & Permissions
Admin

The Admin role has full access to the management system, including:

* Appointments

* Customer management

* Pet management

* Service pricing

* Financial reports

* Staff management

* PDF reports

* Staff

## The Staff role has operational access to:

* Appointments

* Customers

* Pets

The staff directory is read-only for staff users.

* 📋 Features

* 📅 Appointment scheduling and management

* 👤 Customer management

* 🐕 Pet records

* 💰 Custom service pricing

* 👥 Role-based staff access control

* 📊 Business and financial reporting

* 📄 PDF report export

* 🗄️ MySQL database persistence

* 🐳 Dockerized deployment

* 🔐 Admin and staff authorization

* 📁 Project Stack Overview
Frontend
├── React 19
├── TypeScript
├── Vite
└── Tailwind CSS

Backend
├── Spring Boot 3.2
└── Java 17

Database
└── MySQL 8

Infrastructure
└── Docker / Docker Compose

▶️ Quick Start
## Clone the repository
git clone <GITLAB_REPOSITORY_URL>

## Enter the project
cd <PROJECT_DIRECTORY>

## Build and start the application
docker compose up --build

## Open in browser
/* http://localhost:3000 */