# BookStore App - React Native + Node.js

A multi-seller bookstore mobile application built with React Native (Expo) frontend and Node.js/Express backend.

## 🎥 Live Demo

[![BookStore App Demo](https://img.youtube.com/vi/E4DrTNhDnVA/0.jpg)](https://youtu.be/E4DrTNhDnVA?si=LTcVACZqEr7cU0wc)

Click the image above to watch the demo on YouTube

## Features

### Buyer Side (Storefront)
- 📚 Browse books like a feed
- 🔍 Search and filter books
- 📖 View detailed book information
- 🛒 Add books to cart
- 💳 Checkout and place orders
- 📱 Clean mobile UI

### Seller Side (Seller Panel)
- 📝 Add and manage book listings
- 📦 Manage orders and update status
- 📈 Has a seller dashboard

## Tech Stack

- **Frontend**: React Native with Expo
- **Backend**: Node.js with Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT token
- **State Management**: React Context API

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- Expo CLI (`npm install -g @expo/cli`)

## Setup Instructions

### 1. Database Setup

1. Create a PostgreSQL database
2. Run the SQL schema from `backend/dbschema.sql`
3. Create a `.env` file in the `backend/` directory:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/bookstore_db
JWT_SECRET=your_jwt_secret_key_here
PORT=5000
NODE_ENV=development
```

### 2. Backend Setup

```bash
cd backend
npm install
npm run dev
```

The backend will start on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd mobile
npm install
npx expo start
if you get some trouble loading apps, keep trying, the "npx expo start -c"
```

### 4. Running the App

1. Install Expo Go app on your mobile device (playstore/Appstore)
2. Scan the QR code from the terminal
3. Or run on simulator: `npx expo start --ios` or `npx expo start --android`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile

### Books
- `GET /api/books` - Get all books
- `GET /api/books/:id` - Get book by ID
- `POST /api/books` - Create new book (seller only)
- `PUT /api/books/:id` - Update book (seller only)
- `DELETE /api/books/:id` - Delete book (seller only)

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:id` - Update cart item
- `DELETE /api/cart/:id` - Remove item from cart

### Orders
- `GET /api/orders` - Get user's orders
- `POST /api/orders` - Create new order
- `GET /api/orders/seller` - Get seller's orders
- `PUT /api/orders/:id/status` - Update order status

## Project Structure

```
BookStoreApp/
├── backend/                 # Node.js backend
│   ├── config/             # Database configuration
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Authentication middleware
│   ├── routes/            # API routes
│   ├── utils/             # Utility functions
│   ├── dbschema.sql       # Database schema
│   └── server.js          # Main server file
├── mobile/                 # React Native frontend
│   ├── app/               # Expo Router pages
│   ├── src/               # Source code
│   │   ├── components/    # Reusable components
│   │   ├── contexts/      # React contexts
│   │   ├── screens/       # Screen components
│   │   ├── services/      # API services
│   │   └── theme/         # Theme configuration
│   └── assets/images      # Images and assets
└── README.md
```

## Testing the App

1. **Register as a Buyer**: Create an account with role "buyer"
2. **Register as a Seller**: Create an account with role "seller"
3. **Add Books**: As a seller, add some books to your catalog
4. **Browse and Buy**: As a buyer, browse books and add them to cart
5. **Manage Orders**: As a seller, view and update order status


## Troubleshooting

### Common Issues

1. **Database Connection**: Ensure PostgreSQL is running and credentials are correct
2. **API Connection**: Check that backend is running on port 5000
3. **Mobile Connection**: Ensure your mobile device and computer are on the same network
4. **Expo Issues**: Try clearing Expo cache with `npx expo start --clear`

### Backend Issues

- Check database connection in `backend/config/db.js`
- Verify environment variables in `.env` file
- Check server logs (backend logs) for detailed error messages

### Frontend Issues

- Check API base URL in `mobile/src/config/api.js`
- Verify all dependencies are installed
- Check Expo logs for detailed error messages


## License

This project is for showcasing the capability of developing a react native app with node.js backend and for evaluation purposes only, using the code for business components without permission is offensive.
