# Invoice Management System

A full-stack Invoice Management System built with **React.js, Node.js, Express.js, MongoDB, and Material UI**.

The application allows users to manage companies, items, customers, invoices, and invoice reports through a simple dashboard.

## 🚀 Features

### 🔐 Authentication
- User Signup and Login
- JWT-based authentication
- Protected routes
- User-specific invoice data

### 📊 Dashboard
- Total number of invoices
- Total invoice amount
- Last 12 months revenue chart
- Top 5 items
- Date-based invoice filtering

### 🧾 Invoice Management
- Create invoices
- Update invoices
- Delete invoices
- View invoice details
- Automatic invoice number generation
- Multiple items per invoice
- Quantity and rate calculation
- Discount calculation
- Tax calculation
- Invoice total calculation

### 📦 Item Management
- Add items
- Edit items
- Delete items
- Item description
- Sales rate
- Discount percentage
- Item image upload
- Item image preview

### 🏢 Company Management
- Company name
- Address
- City
- ZIP code
- Industry
- Currency symbol
- Company logo

### 📈 Reports & Analytics
- Invoice count
- Total invoice amount
- Monthly revenue
- Top-selling items
- Date range filtering

---

## 🛠️ Technologies Used

### Frontend

- React.js
- Vite
- Material UI (MUI)
- MUI X Charts
- MUI Data Grid
- React Router
- TanStack React Query
- Axios
- React Hot Toast
- JavaScript
- HTML
- CSS

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcrypt
- Joi
- Multer
- dotenv
- CORS

---

## 📂 Project Structure

```text
InvoiceApp/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── api/
│   │   ├── context/
│   │   └── App.jsx
│   │
│   └── package.json
│
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── config/
│   ├── uploads/
│   ├── server.js
│   └── package.json
│
└── README.md
