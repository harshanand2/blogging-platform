# Blogging Platform

A full-stack blogging platform where users can register, log in, create blog posts, like and comment on posts, and delete their own posts.

## Tech Stack
- Node.js
- Express.js
- MongoDB (Mongoose)
- HTML5, CSS, JavaScript (Frontend)

## Features
- User registration and authentication (JWT)
- Create, read, and delete blog posts
- Like/unlike blog posts
- Comment on blog posts
- Only authors can delete their own posts

## Project Structure
```
blogging-platform/
  backend/
    controllers/
    middleware/
    models/
    routes/
    .env
    index.js
    package.json
  frontend/
    index.html
    style.css
    (JS files)
```

## Getting Started

### Backend Setup
1. Clone the repository
2. Navigate to the `backend` directory
3. Install dependencies:
   ```
   npm install
   ```
4. Create a `.env` file in the `backend` folder:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```
5. Start the server:
   ```
   node index.js
   ```

### API Endpoints
- `POST /api/auth/register` — Register a new user
- `POST /api/auth/login` — Log in and receive a JWT token
- `POST /api/blogs/` — Create a blog post (requires JWT)
- `GET /api/blogs/` — Get all blog posts
- `GET /api/blogs/:id` — Get a single blog post
- `DELETE /api/blogs/:id` — Delete a blog post (author only, requires JWT)
- `POST /api/blogs/:id/like` — Like/unlike a blog post (requires JWT)
- `POST /api/blogs/:id/comment` — Comment on a blog post (requires JWT)

### Frontend
- Basic HTML/CSS/JS files for user interaction (to be developed)

## Usage
- Use Postman or curl to test API endpoints
- Register and log in to get a JWT token
- Use the token for protected routes (create, like, comment, delete)

## License
MIT 