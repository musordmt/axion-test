# Axion

Axion is a School Management System API designed to manage students, classrooms, and schools efficiently. It provides a comprehensive set of endpoints for managing entities and operations within a school environment.

## Features

- Student enrollment, updates, and management
- Classroom creation, updates, and capacity management
- School creation, updates, and statistics
- Authentication and authorization with JWT
- Redis caching for performance optimization
- MongoDB for data persistence

## Prerequisites

- Node.js (v18 or later)
- MongoDB (v6.0 or later)
- Redis (v7.0 or later)
- npm (v10.0 or later)

## Setup Instructions

1. **Clone the repository:**

   ```bash
   git clone https://github.com/musordmt/axion.git
   cd axion
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Environment Configuration:**

   Create a `.env` file in the root directory and configure the following environment variables:

   ```plaintext
   SERVICE_NAME=Axion
   USER_PORT=5111
   ADMIN_PORT=5222
   ENV=development
   REDIS_URI=redis://127.0.0.1:6379
   MONGO_URI=mongodb://localhost:27017/axion
   LONG_TOKEN_SECRET=your_long_token_secret
   SHORT_TOKEN_SECRET=your_short_token_secret
   NACL_SECRET=your_nacl_secret
   ```

4. **Start the MongoDB and Redis servers:**

   Ensure that both MongoDB and Redis are running on your local machine or accessible from the configured URIs.

5. **Run the application:**

   ```bash
   npm run dev
   ```

   The application will start on the configured `USER_PORT` and `ADMIN_PORT`.

6. **Run tests:**

   To run the test suite, use:

   ```bash
   npm test
   ```

## API Documentation

The API documentation is generated using Swagger and can be accessed at `http://localhost:<USER_PORT>/api-docs` after starting the server.

## Project Structure

- **config/**: Configuration files for different environments.
- **connect/**: Database connection setup.
- **loaders/**: Modules for loading various components like managers, middlewares, etc.
- **managers/**: Core business logic and entity management.
- **cache/**: Redis cache setup and operations.
- **libs/**: Utility functions and helpers.
- **mws/**: Middleware functions.
- **test/**: Test cases for the API.

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
