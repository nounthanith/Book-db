const Category = require("./category.model");

exports.create = async (req, res) => {
  const { name, description } = req.body;

  const category = await Category.create({
    name,
    description,
  });

  return res.status(201).json({
    status: true,
    message: "Category created successfully",
    data: category,
  });
};

exports.getAll = async (req, res) => {
  const search = req.query.search || "";
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const totalCategories = await Category.countDocuments({
    name: { $regex: search, $options: "i" },
  });

  const totalPages = Math.ceil(totalCategories / limit);

  const categories = await Category.find({
    name: { $regex: search, $options: "i" },
  })
    .select("-password")
    .skip(skip)
    .limit(limit);

  return res.status(200).json({
    status: true,
    message: "Categories fetched successfully",
    page,
    totalCategories,
    totalPages,
    data: categories,
  });
};

exports.getById = async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return res.status(404).json({
      status: false,
      message: "Category not found",
    });
  }

  return res.status(200).json({
    status: true,
    message: "Category fetched successfully",
    data: category,
  });
};

exports.update = async (req, res) => {
  const targetCategoryId = req.params.id;
  const currentUser = req.user;

  if (
    currentUser._id.toString() !== targetCategoryId &&
    currentUser.role !== "admin"
  )
    return res.status(403).json({
      status: false,
      message:
        "Access denied. You can only update your own profile or you must be an admin.",
    });

  const category = await Category.findByIdAndUpdate(
    targetCategoryId,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  ).select("-password");

  if (!category)
    return res
      .status(404)
      .json({ status: false, message: "Category not found" });

  return res.status(200).json({
    status: true,
    message: "Category updated successfully",
    data: category,
  });
};

exports.remove = async (req, res) => {
  const targetCategoryId = req.params.id;
  const currentUser = req.user;

  if (
    currentUser._id.toString() !== targetCategoryId &&
    currentUser.role !== "admin"
  )
    return res.status(403).json({
      status: false,
      message:
        "Access denied. You can only update your own profile or you must be an admin.",
    });

  const category = await Category.findByIdAndDelete(targetCategoryId);

  if (!category)
    return res
      .status(404)
      .json({ status: false, message: "Category not found" });

  return res.status(200).json({
    status: true,
    message: "Category deleted successfully",
  });
};
