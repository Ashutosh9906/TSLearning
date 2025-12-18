# 📚 Library Management System – Backend

A robust backend API for a Library Management System built using **TypeScript**, **Node.js**, **Express**, and **MongoDB**.  
The system supports **role-based access**, **book management**, **borrowing/returning**, **email notifications**, and **background job processing using BullMQ & Redis**.

---

## 🚀 Features

- User authentication with JWT (Student / Librarian roles)
- Book CRUD operations
- Borrow & return books with stock validation
- Email notifications using Nodemailer (OAuth2)
- Background job processing using BullMQ
- Redis-based queue system
- MongoDB transactions
- Centralized error handling
- Scalable & modular architecture
- Docker support for Redis & MongoDB

---

## 🛠 Tech Stack

- **Language:** TypeScript  
- **Runtime:** Node.js  
- **Framework:** Express.js  
- **Database:** MongoDB (Mongoose)  
- **Queue:** BullMQ  
- **Cache / Broker:** Redis  
- **Authentication:** JWT  
- **Email Service:** Nodemailer (OAuth2)  
- **Containerization:** Docker  

---

## 📁 Project Structure
```
src/
├── controllers/
├── services/
├── models/
├── routes/
├── middlewares/
├── jobs/
├── workers/
├── config/
├── utils/
├── app.ts
└── server.ts
```

---

## ⚙️ Installation & Setup

### Clone the Repository
```bash
git clone https://github.com/your-username/library-backend.git
cd library-backend
```
### Install Dependencies
```bash
npm install
```
### Environment Variables

| Variable | Description |
|--------|------------|
| PORT | Server port |
| MONGO_URI | MongoDB connection string |
| JWT_SECRET | JWT signing key |
| EMAIL_USER | Email service user |
| CLIENT_ID | Gmail api OAuth2 |
| CLIENT_SECRET | Gmail api OAuth2 |
| REFERESH_TOKEN | Gmail api OAuth2 |
### API Endpoints
### Auth
| Method | Endpoint        | Description |
|------|----------------|------------|
| POST | api/auth/signUp | Register user |
| POST | api/auth/SignIn    | Login user |

### Books
| Method | Endpoint | Description |
|------|----------|------------|
| POST | api/books   | Add new book (Librarian) |
| GET  | api/books   | Get all books |
| GET  | api/books/:is   | Get specific book |
| DELETE  | api/books/:id   | Remove book |
| PATCH  | api/books/:id   | Edit book details |

### Borrow
| Method | Endpoint | Description |
|------|----------|------------|
| POST | api/borrows/ | Borrow a book |
| GET | api/borrows/ | Get Borrowed book details |
| PATCH | api/borrows/:id/renew | Renew Borrowed book |
| PATCH | api/borrows/:id/return | Return Borrowed Book |

### Docker Setup (Redis & MongoDB)
- Start Redis using Docker
```bash
docker run -d \
  --name redis \
  -p 6379:6379 \
  redis:7
```
- Start MongoDB using Docker
```bash
docker run -d \
  --name mongo \
  -p 27017:27017 \
  mongo
```
- Verify Containers
```bash
docker ps
```

### Running the Application
```bash
npm run dev        # Start backend in development mode
npm run worker     # Start BullMQ email worker
npm run build      # Compile TypeScript using tsgo
npm run start      # Start production server (dist/index.js)
```

### Reference: Gmail API Guides

- **Official Gmail API Guides (Google Developers)**  
  https://developers.google.com/workspace/gmail/api/guides Gmail API overview and developer guides from Google Workspace documentation.

### Reference: Redis Docker Official Image Guide

- **How to Use the Redis Docker Official Image**  
  https://www.docker.com/blog/how-to-use-the-redis-docker-official-image/ Official Docker blog guide on pulling and running the Redis Docker image, setting up persistence, using the Redis CLI, and configuring Redis containers.

