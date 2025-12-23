# Home Manager

Full-stack web application for managing family household tasks.
Implemented as an Angular SPA with a Node.js REST API and a MariaDB database.
The project demonstrates authentication, task management workflows, file attachments, and a structured client–server architecture.

---

## Tech Stack

![Angular](https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![SCSS](https://img.shields.io/badge/SCSS-CC6699?style=for-the-badge&logo=sass&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![MariaDB](https://img.shields.io/badge/MariaDB-003545?style=for-the-badge&logo=mariadb&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white)

---

## About the Project

Home Manager is a web application designed to help families organize and control household responsibilities.
Users can create tasks, assign them to family members, manage statuses, add comments, and keep everything in one place.

The solution is split into two parts:
- home-manager-project: Angular frontend (SPA)
- home-manager-api: Node.js backend (REST API)

---

## Functional Overview

Core features:
- user authentication and authorization
- creating and managing household tasks
- assigning tasks within a family context
- task status updates and filtering
- comments and activity tracking
- file attachments for tasks (upload, download, delete)

UI features (frontend side):
- task list with empty-state handling
- modal flows for creating and confirming actions
- role-based visibility of features where applicable

---

## System Architecture

The project follows a client–server architecture:
- Angular SPA communicates with the backend via HTTP (REST)
- backend contains routing, middleware, and database access logic
- MariaDB is used for persistent storage of users, families, tasks, and attachments

The application is designed around a clear separation of concerns:
- frontend: UI state, forms, client-side validation, API consumption
- backend: business rules, authentication, persistence, file handling

---

## Repository Structure

    home-manager/
      home-manager-api/          # Node.js / Express REST API
      home-manager-project/      # Angular SPA (frontend)
      README.md

---

## Getting Started (Development)

Prerequisites:
- Node.js and npm
- MariaDB (local or containerized)

Backend setup:

    cd home-manager-api
    npm install
    npm start

Frontend setup:

    cd ../home-manager-project
    npm install
    npm start

Frontend default URL:
http://localhost:4200

Backend default URL:
http://localhost:8080

---

## Environment Configuration

The backend requires environment variables for database connection and JWT configuration.
Example fields that are typically required:
- DB_HOST
- DB_PORT
- DB_USER
- DB_PASSWORD
- DB_NAME
- JWT_SECRET
- ALLOWED_ORIGINS

The exact names and values depend on the configuration used in home-manager-api.

---

## Project Status

Core functionality is implemented and operational:
- frontend–backend integration
- authentication flow
- task management (create, update, delete)
- attachments handling

Planned improvements:
- extended UI pages and UX refinements
- additional family management features
- advanced filtering and search
- expanded reporting and analytics
