# Clothing E-commerce Platform

## Project Structure

### Backend (server folder)
- **app.js**: Main server file that initializes Express, connects to MongoDB, and sets up routes
- **middleware/**: Contains middleware functions for authentication, error handling, and file uploads
- **models/**: MongoDB schema definitions
- **routes/**: API route definitions
- **controllers/**: Business logic for handling requests
- **uploads/**: Storage for uploaded images
- **utils/**: Utility functions
- **services/**: Service modules like email service

### Frontend (client folder)
- **src/**: React application source code
  - **components/**: Reusable UI components
  - **pages/**: Page components
  - **context/**: React context providers
  - **services/**: API service functions
  - **assets/**: Static assets like images
  - **styles/**: CSS files

## Getting Started

1. Install dependencies:
   ```
   # Install backend dependencies
   cd server
   npm install

   # Install frontend dependencies
   cd ../client
   npm install
   ```

2. Set up environment variables:
   - Create `.env` file in the server directory
   - Create `.env` file in the client directory

3. Start the development servers:
   ```
   # Start backend server
   cd server
   npm run dev

   # Start frontend server
   cd ../client
   npm start
   ```