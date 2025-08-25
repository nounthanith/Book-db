const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();
dotenv.config({ quiet: true });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static files for uploads
app.use("/uploads", express.static("uploads"));

app.use(require("./modules/users/user.route"));
app.use(require("./modules/categories/category.route"));
app.use(require("./modules/books/book.route"));

app.use((err, req, res, next) => {
  res.status(500).json({
    message: err.message,
  });
});

module.exports = app;
