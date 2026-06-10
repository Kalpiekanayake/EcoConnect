# 🌱 EcoConnect

EcoConnect is a smart waste management and recycling platform that connects households with waste collectors to encourage sustainable waste disposal and resource recovery.

The platform allows users to register, submit waste pickup requests, browse recyclable waste categories, and track collection activities through a modern web interface.

---

## 🚀 Features

### 👤 User Authentication
- User Registration
- Secure Login
- JWT Authentication
- Role-Based Access Control

### 🏠 Household Features
- Create Waste Pickup Requests
- View Personal Requests
- Track Request Status
- Manage Recyclable Waste

### 🚛 Collector Features
- Browse Available Pickup Requests
- Accept Collection Requests
- Manage Assigned Pickups
- Update Collection Status

### ♻ Waste Categories
- Coconut Shells
- Coconut Husks
- Plastic
- Glass
- Paper / Cardboard
- Food Waste
- General Disposal

### 📊 Dashboard
- Request Overview
- Pickup Statistics
- Waste Tracking

---

## 📸 Screenshots

### Home Page

<img width="1339" height="634" alt="image" src="https://github.com/user-attachments/assets/0a9de21d-3fb9-47f7-9d57-dd3ccc67761b" />

### Circular Economy Categories

<img width="1333" height="624" alt="image" src="https://github.com/user-attachments/assets/d2243c5e-8595-4073-9dcf-a70843bbb9a3" />

### Collector Dashboard

<img width="1341" height="626" alt="image" src="https://github.com/user-attachments/assets/445f1f47-7ebd-469a-a8d4-73524749ae89" />

### Householder Dashboard

<img width="1341" height="631" alt="image" src="https://github.com/user-attachments/assets/a00f2b71-bd2c-4c2c-a044-ea07cadf46aa" />

### Marketplace

<img width="1341" height="626" alt="image" src="https://github.com/user-attachments/assets/7985c3df-9a81-42ce-bf24-64411007f108" />
<img width="1334" height="637" alt="image" src="https://github.com/user-attachments/assets/a5c66940-602c-4ac8-a99b-0671d1c4b344" />

### Bookings

<img width="1344" height="639" alt="image" src="https://github.com/user-attachments/assets/ba38d7b2-6647-45df-9bd2-a618fd1e3f4f" />

---

## 🛠 Tech Stack

### Frontend
- React
- Vite
- Tailwind CSS
- React Router
- Axios

### Backend
- FastAPI
- SQLAlchemy
- Pydantic
- JWT Authentication

### Database
- SQLite

---

## 📂 Project Structure

```text
EcoConnect
│
├── frontend/
│   ├── src/
│   ├── components/
│   ├── pages/
│   └── services/
│
├── backend/
│   ├── app/
│   │   ├── routes/
│   │   ├── models/
│   │   ├── schemas/
│   │   └── database/
│   │
│   ├── main.py
│   └── requirements.txt
│
└── README.md
```

---

## ⚙ Installation

### Clone Repository

```bash
git clone https://github.com/Kalpiekanayake/EcoConnect.git
```

---

### Backend Setup

```bash
cd backend

python -m venv venv

venv\Scripts\activate

pip install -r requirements.txt

uvicorn main:app --reload
```

Backend runs on:

```text
http://127.0.0.1:8000
```

---

### Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

---

## API Endpoints

### Authentication

```text
POST /auth/register
POST /auth/login
```

### Users

```text
GET /users
POST /users
```

### Categories

```text
GET /categories
POST /categories
POST /categories/seed
```

### Waste Requests

```text
GET /wastes
POST /wastes
```

---

## Future Improvements

- Google Maps Integration
- Real-time Notifications
- Mobile Application
- Collector Route Optimization
- Waste Analytics Dashboard
- Cloud Database Deployment

---

## Learning Outcomes

This project helped strengthen skills in:

- Full Stack Development
- REST API Design
- Authentication & Authorization
- Database Design
- Frontend Routing
- State Management
- Software Architecture

---

## Author

**Kalpani Ekanayake**

Software Engineering Undergraduate

GitHub:
https://github.com/Kalpiekanayake
