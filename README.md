# 📚 Full-Stack Library Management System

A beautiful, modern full-stack Library Management Dashboard engineered with a decoupled architecture. The application features a robust relational database backend built with **FastAPI** and **SQLAlchemy (SQLite)**, and a highly responsive, tabbed administrative user interface built with **React** and **Tailwind CSS**.

---

## 🚀 Live Demo & Project Previews

> 🌐 **Frontend Live Deployment:** [View the Dashboard on GitHub Pages](https://kechomartin.github.io/Library-Management-System/)
> 
> *Note: The frontend client is fully deployed. To interact with live database state simulation, run the backend server locally.*

### 🖥️ Main Dashboard (Catalog & Circulation Tab)
Manage your inventory and track live circulation sequences effortlessly. The lending window engine features an automatic **14-day return deadline tracker** that visually flags overdue status conditions.

![Dashboard Preview](/frontend/public/Screenshot%202026-06-10%20115923.png)

### 👥 User Directory Tab
An administrative portal allowing librarians to register new institutional members and assign platform access roles dynamically.

![User Directory Preview](/frontend/public/Screenshot%202026-06-10%20120353.png)

---

## ✨ Core Features

*   **Dual-Tab Interface:** Smooth, state-driven navigation between Inventory Cataloging and Member Management without page refreshes.
*   **Circulation Engine:** Track checkout constraints, automated remaining-day calculations, and distinct color-coded urgency states (Overdue, Expiring Soon, Stable).
*   **Nested Relational Data Mapping:** Database architecture links transaction logs directly to member names and book titles using SQLAlchemy relational integrity.
*   **Fail-Safe Inventory Tracking:** Integrated checks prevent borrowing out-of-stock items or creating duplicate active loans for the same user.

---

## 🛠️ System Architecture & Tech Stack

### Backend
*   **FastAPI:** Asynchronous, high-performance Python web API framework.
*   **SQLAlchemy ORM:** Relational database object mapping.
*   **SQLite:** Light, stateful local server engine.
*   **Pydantic:** Strict data validation and serialization schemas.

### Frontend
*   **React (Vite):** Client-side interface framework.
*   **Tailwind CSS:** Modern utility-first styling.
*   **Axios:** Promise-based HTTP client for seamless backend communication.

---
