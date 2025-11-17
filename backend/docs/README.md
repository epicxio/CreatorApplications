# Creator Marketplace Platform

A modern content creator marketplace platform built with React, Node.js, and MongoDB.

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd creator-marketplace
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

4. Start the development server
```bash
npm run dev
```

## 📁 Project Structure

```
creator-marketplace/
├── src/
│   ├── models/         # MongoDB models
│   ├── routes/         # API routes
│   ├── middleware/     # Custom middleware
│   └── server.js       # Main server file
├── .env               # Environment variables
├── package.json       # Project dependencies
└── README.md         # Project documentation
```

## 🔑 API Endpoints

### Brand Registration
- **POST** `/api/brands/register`
  - Register a new brand account
  - Required fields:
    - companyName
    - email
    - password
    - industry
    - companySize

## 🛠 Tech Stack

- **Frontend**: React + TailwindCSS
- **Backend**: Node.js + Express
- **Database**: MongoDB Atlas
- **Authentication**: JWT
- **File Storage**: AWS S3

## 📝 License

This project is licensed under the MIT License. 