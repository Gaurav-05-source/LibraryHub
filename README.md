# LibraryHub 📚

A full-stack Library Management & Book Reservation System built with **Spring Boot, React, and MySQL**. LibraryHub provides a modern platform for managing books, library members, reservations, borrowing, returns, and fines with role-based access control.

## 🚀 Features

### 👤 Member
- Secure registration and login with JWT authentication
- Browse and search books
- Filter books by category
- View book availability
- Reserve books
- Track reservations and queue status
- View borrowing history
- Manage profile and change password
- View fines

### 🛡️ Admin
- Admin dashboard with library statistics
- Manage books (CRUD)
- Manage book copies and inventory
- Manage categories
- Manage members
- Manage reservations
- Issue and return books
- Manage borrowing records
- Manage fines

### ⚙️ System Features
- JWT-based authentication
- Role-based authorization (ADMIN / MEMBER)
- RESTful APIs
- Database persistence using Spring Data JPA and Hibernate
- Reservation queue management
- Reservation expiry handling
- Centralized exception handling
- Responsive frontend interface

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, JavaScript, CSS |
| Backend | Java, Spring Boot |
| API | REST API |
| Authentication | Spring Security, JWT |
| ORM | Hibernate, Spring Data JPA |
| Database | MySQL |
| Build Tool | Maven |
| Testing | JUnit |

## 🏗️ Project Structure

```text
LibraryHub/
│
├── libraryhub/                 # Spring Boot backend
│   ├── src/main/java/
│   │   └── com/libraryhub/libraryhub/
│   │       ├── config/
│   │       ├── controller/
│   │       ├── dto/
│   │       ├── entity/
│   │       ├── exception/
│   │       ├── mapper/
│   │       ├── repository/
│   │       ├── security/
│   │       ├── service/
│   │       └── util/
│   ├── src/main/resources/
│   └── pom.xml
│
├── libraryhub-frontend/        # React frontend
│   ├── src/
│   │   ├── context/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── routes/
│   │   └── services/
│   ├── public/
│   └── package.json
│
└── README.md
```

## 💻 Getting Started

### Prerequisites

- Java JDK
- Node.js and npm
- MySQL Server
- Git

### 1. Clone the repository

```bash
git clone https://github.com/Gaurav-05-source/LibraryHub.git
cd LibraryHub
```

### 2. Configure MySQL

Create a MySQL database for the project and configure the database connection in the backend configuration.

Set the required environment variables for database credentials and JWT security.

### 3. Run the Backend

```bash
cd libraryhub
```

Windows:

```cmd
mvnw.cmd spring-boot:run
```

### 4. Run the Frontend

Open another terminal:

```bash
cd libraryhub-frontend
npm install
npm run dev
```

Open the local frontend URL displayed by Vite in your terminal.

## 🔐 Security

- Password hashing
- JWT authentication
- Protected endpoints
- Role-based access control
- Environment-based secret configuration

## 👨‍💻 Author

**Gaurav Devale**

Computer Engineering Student

GitHub: [Gaurav-05-source](https://github.com/Gaurav-05-source)

---

⭐ If you find this project interesting, feel free to explore the repository.
