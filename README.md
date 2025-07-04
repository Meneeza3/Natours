# 🌍 Natours – Tour Booking Web App

Natours is a full-stack Node.js web application for browsing, booking, and managing tours around the world. The app features user authentication, secure payments via Stripe, dynamic tour pages, and an admin dashboard — all built using the MVC architecture.

## 🚀 Features

- Browse beautiful tours with photos, prices, and locations
- Secure user authentication (signup / login / update password)
- Booking system integrated with Stripe Checkout (webhooks included)
- Dynamic map using Leaflet + location data
- Admin dashboard to manage tours, users, reviews, and bookings
- Tour stats and analytics using MongoDB aggregation

## 🚀 Technologies Used

### Backend

- **Node.js** with **Express**
- **MongoDB** with **Mongoose**
- **JWT** Authentication & Authorization
- **Stripe API** for secure payments
- **Pug** as the templating engine
- **Multer** for image uploads
- **Sharp** for image resizing
- **Security**: Express Rate Limit, Helmet, Data Sanitization

### Frontend

- **Pug templates** and **SCSS**
- **Leaflet.js** for interactive maps
- **Parcel** for local bundling
- **Axios** for AJAX requests

## 🔐 Authentication Flow

- Secure signup & login using JWT
- HTTP-only cookies to store token
- Password reset via email
- Role-based access control (`user`, `admin`, `guide`)

## Stripe Integration

- Tour details → Stripe Checkout
- Stripe sends payment confirmation via Webhook
- Booking created automatically on success
- Saved to MongoDB with references to `tour`, `user`, `price`

## 📁 Folder Structure

- `controllers/` – All route logic (tour, user, booking, review)
- `models/` – Mongoose schemas (Tour, User, etc.)
- `routes/` – Express route modules
- `views/` – Pug templates for frontend
- `public/` – Static files (images, JS, CSS)
- `utils/` – Helper modules (APIs, email, error handling)
- `dev-data/` – Sample data for development (JSON files)
- `.env` – Environment variables (config.env)
- `server.js` – App entry point
- `app.js` – Express app setup and middleware config

## ⚙️ How to Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/your-username/natours.git
cd natours
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set environment variables

Create a file named `config.env` in the root directory and add:

```env
NODE_ENV=development
PORT=3000
DATABASE=mongodb+srv://...
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=90d
JWT_COOKIE_EXPIRES_IN=90
EMAIL_USERNAME=your_email@example.com
EMAIL_PASSWORD=your_password
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=2525
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

### 4. Run the development server

```bash
npm run start:dev
```

Open `http://localhost:3000` to access the app.
