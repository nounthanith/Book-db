# Book Management API

build with nodejs, express, mongoose, multer, dotenv, cors, cookie-parser, jsonwebtoken

- install dependencies
```
npm install
```

- run server
```
node --watch server.js
```

- API Endpoints
```
GET /api/books
GET /api/books/:id
POST /api/books
PUT /api/books/:id
DELETE /api/books/:id
```

- API Documentation
```
http://localhost:3000/api-docs
```
- Book Example
```
{
    "title": "Book Title",
    "author": "Book Author",
    "description": "Book Description",
    "category": "Book Category ID",
    "publishedDate": "Book Published Date",
    "createdBy": "Admin ID",
    "image": "Book Image Path",
    "pdf": "Book PDF Path"
}
```