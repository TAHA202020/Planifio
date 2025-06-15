# 🗂️ Planifio — A Trello-Inspired Task Management App

Planifio is a kanban-style task manager where users can create boards, lists, and cards — and manage tasks with drag-and-drop, descriptions, file uploads, and due dates. Cards with due dates are automatically displayed on a calendar.

![Planifio](./images/banner.png)

---

## ✨ Features

- ✅ User authentication using **OTP (One-Time Password)**
- ✅ Create and manage multiple **boards**
- ✅ Add **lists** inside boards (e.g., To Do, In Progress, Done)
- ✅ Add and **reorganize cards** within and between lists
- ✅ Card features:
  - 📝 Description
  - 📎 File attachments
  - 📅 Due date picker
- ✅ Cards with due dates are displayed in a **calendar view**
- 🔁 **Drag and drop** support for lists and cards

---

## 🖼️ Screenshots
### 👤 Sign In
Signin using only your email.

![Sign In](./images/signin.png)

---


### 📋 Board View
View and manage all your boards and lists.

![Board View](./images/board-view.png)

---

### 📝 Card Details
Add a description, upload files, and set a due date.

![Card Details](./images/card-view.png)

---

### 📅 Calendar View
All cards with due dates are shown in a calendar.

![Calendar](./images/calendar-view.png)
 
---

## 🔐 Authentication

Users log in securely using **OTP-only authentication** — no passwords required.
- OTP is sent via email or phone (customizable backend logic).
- Upon successful OTP verification, users receive a **JWT Access Token and Refresh Token**.

---

## 🧰 Tech Stack

### 🖥️ Frontend
- **React.js**
- **Zustand** for global state management
- **React Beautiful DnD** for drag-and-drop
- **FullCalendar.io** for calendar integration

### 🛠️ Backend
- **ASP.NET Core**
- **JWT** for authentication
- **Custom OTP service** (email or phone-based)

### 🗄️ Database
- **MySQL / MariaDB**

---

## 🚀 Getting Started

### 🔧 Prerequisites
- Node.js + npm
- .NET 6+ SDK
- MySQL/MariaDB running

## 🙏 Acknowledgments

- This project was inspired by the intuitive design and functionality of [Trello](https://trello.com).
- Drag-and-drop functionality is powered by the excellent [`react-beautiful-dnd`](https://github.com/atlassian/react-beautiful-dnd) library by Atlassian.
- Calendar integration is made possible thanks to the robust and flexible [FullCalendar](https://fullcalendar.io).