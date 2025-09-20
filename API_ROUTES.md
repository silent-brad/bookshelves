# API Routes

## Authentication
- **POST /api/auth/login**  
  Authenticates a user.  
  Request Body: `{ "username": "string", "password": "string" }`  
  Response: `{ "jwt": "token" }` (200 OK) or error.

## Users
- **POST /api/users/register**  
  Registers a new user.  
  Request Body: `{ "username": "string", "password": "string", "email": "string" }`  
  Response: User object (200 OK) or error if username exists.

## Books (Requires JWT Authentication)
- **GET /api/books**  
  Retrieves all books.  
  Response: Array of Book objects.

- **POST /api/books**  
  Creates a new book (owner set to authenticated user).  
  Request Body: `{ "title": "string", "author": "string", "status": "string" }`  
  Response: Created Book object.

- **GET /api/books/{id}**  
  Retrieves a book by ID.  
  Response: Book object or 404 if not found.

- **PUT /api/books/{id}**  
  Updates a book (only if authenticated user is owner).  
  Request Body: `{ "title": "string", "author": "string", "status": "string" }`  
  Response: Updated Book object, 403 if not owner, or 404 if not found.

- **DELETE /api/books/{id}**  
  Deletes a book (only if authenticated user is owner).  
  Response: 204 No Content, 403 if not owner, or 404 if not found.
