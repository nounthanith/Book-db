const Book = require("./book.model");
const fs = require("fs");
const path = require("path");

// Helper function to generate clean file paths and URLs
const generateFileUrls = (book, req) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  // Remove 'uploads/' prefix from paths
  const cleanImagePath = book.image.replace('uploads/', '');
  const cleanPdfPath = book.pdf.replace('uploads/', '');
  
  return {
    ...book.toObject(),
    image: cleanImagePath,
    pdf: cleanPdfPath,
    imageUrl: `${baseUrl}/${book.image}`,
    pdfUrl: `${baseUrl}/${book.pdf}`
  };
};

exports.create = async (req, res) => {
  try {
    const { title, author, description, category, publishedDate } = req.body;

    // Check if files were uploaded
    if (!req.files || !req.files.image || !req.files.pdf) {
      return res.status(400).json({
        status: false,
        message: "Both image and PDF files are required",
      });
    }

    const book = await Book.create({
      title,
      author,
      description,
      category,
      publishedDate,
      image: req.files.image[0].path.replace(/\\/g, '/'), // Convert backslashes to forward slashes
      pdf: req.files.pdf[0].path.replace(/\\/g, '/'),     // Convert backslashes to forward slashes
      createdBy: req.user._id,
    });

    const populatedBook = await Book.findById(book._id)
      .populate("category", "name")
      .populate("createdBy", "name email");

    const bookWithUrls = generateFileUrls(populatedBook, req);

    return res.status(201).json({
      status: true,
      message: "Book created successfully",
      data: bookWithUrls,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

exports.getAll = async (req, res) => {
  try {
    const search = req.query.search || "";
    const category = req.query.category || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build search query
    let query = {
      isActive: true,
      $or: [
        { title: { $regex: search, $options: "i" } },
        { author: { $regex: search, $options: "i" } },
      ],
    };

    if (category) {
      query.category = category;
    }

    const totalBooks = await Book.countDocuments(query);
    const totalPages = Math.ceil(totalBooks / limit);

    const books = await Book.find(query)
      .populate("category", "name")
      .populate("createdBy", "name email")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const booksWithUrls = books.map(book => generateFileUrls(book, req));

    return res.status(200).json({
      status: true,
      message: "Books fetched successfully",
      data: booksWithUrls,
      page,
      totalBooks,
      totalPages,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

exports.getById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
      .populate("category", "name description")
      .populate("createdBy", "name email");

    if (!book) {
      return res.status(404).json({
        status: false,
        message: "Book not found",
      });
    }

    const bookWithUrls = generateFileUrls(book, req);

    return res.status(200).json({
      status: true,
      message: "Book fetched successfully",
      data: bookWithUrls,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

exports.update = async (req, res) => {
  try {
    const bookId = req.params.id;
    const currentUser = req.user;

    // Find the book first
    const existingBook = await Book.findById(bookId);
    if (!existingBook) {
      return res.status(404).json({
        status: false,
        message: "Book not found",
      });
    }

    // Check permissions: only book creator or admin can update
    if (
      existingBook.createdBy.toString() !== currentUser._id.toString() &&
      currentUser.role !== "admin"
    ) {
      return res.status(403).json({
        status: false,
        message: "Access denied. You can only update your own books or you must be an admin.",
      });
    }

    const updateData = { ...req.body };

    // Handle file updates
    if (req.files) {
      if (req.files.image) {
        // Delete old image file
        if (fs.existsSync(existingBook.image)) {
          fs.unlinkSync(existingBook.image);
        }
        updateData.image = req.files.image[0].path.replace(/\\/g, '/'); // Convert backslashes to forward slashes
      }

      if (req.files.pdf) {
        // Delete old PDF file
        if (fs.existsSync(existingBook.pdf)) {
          fs.unlinkSync(existingBook.pdf);
        }
        updateData.pdf = req.files.pdf[0].path.replace(/\\/g, '/'); // Convert backslashes to forward slashes
      }
    }

    const book = await Book.findByIdAndUpdate(bookId, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("category", "name")
      .populate("createdBy", "name email");

    const bookWithUrls = generateFileUrls(book, req);

    return res.status(200).json({
      status: true,
      message: "Book updated successfully",
      data: bookWithUrls,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

exports.remove = async (req, res) => {
  try {
    const bookId = req.params.id;
    const currentUser = req.user;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({
        status: false,
        message: "Book not found",
      });
    }

    // Check permissions: only book creator or admin can delete
    if (
      book.createdBy.toString() !== currentUser._id.toString() &&
      currentUser.role !== "admin"
    ) {
      return res.status(403).json({
        status: false,
        message: "Access denied. You can only delete your own books or you must be an admin.",
      });
    }

    // Delete associated files
    if (fs.existsSync(book.image)) {
      fs.unlinkSync(book.image);
    }
    if (fs.existsSync(book.pdf)) {
      fs.unlinkSync(book.pdf);
    }

    await Book.findByIdAndDelete(bookId);

    return res.status(200).json({
      status: true,
      message: "Book deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

exports.getFeatured = async (req, res) => {
  try {
    const books = await Book.find({ featured: true })
      .populate("category", "name")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    const booksWithUrls = books.map(book => generateFileUrls(book, req));

    return res.status(200).json({
      status: true,
      message: "Featured books fetched successfully",
      data: booksWithUrls,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};
