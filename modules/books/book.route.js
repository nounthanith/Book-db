const { Router } = require("express");
const { create, getAll, getById, update, remove, getFeatured } = require("./book.controller");
const auth = require("../../middleware/auth");
const upload = require("../../middleware/upload");

const router = Router();

// Create book with image and PDF upload
router.post("/book", auth, upload.fields([
  { name: "image", maxCount: 1 },
  { name: "pdf", maxCount: 1 }
]), create);

// Get all books with search and pagination
router.get("/books", getAll);

// Get featured books
router.get("/books/featured", getFeatured);

// Get book by ID
router.get("/book/:id", getById);

// Update book with optional file uploads
router.put("/book/:id", auth, upload.fields([
  { name: "image", maxCount: 1 },
  { name: "pdf", maxCount: 1 }
]), update);

// Delete book
router.delete("/book/:id", auth, remove);

module.exports = router;
