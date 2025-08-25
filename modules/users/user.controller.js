const bcrypt = require("bcryptjs");
const User = require("./user.model");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  const { name, email, role, avatar, password } = req.body;

  const hashedPassword = bcrypt.hashSync(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role,
    avatar,
  });

  return res.status(201).json({
    status: true,
    message: "User created successfully",
    data: user,
  });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(400).json({
      status: false,
      message: "User not found",
    });
  }

  const isPasswordValid = bcrypt.compareSync(password, user.password);

  if (!isPasswordValid) {
    return res.status(400).json({
      status: false,
      message: "Invalid password",
    });
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  return res.status(200).json({
    status: true,
    message: "User logged in successfully",
    data: user,
    token,
  });
};

exports.logout = async (req, res) => {
  return res.status(200).json({
    status: true,
    message: "User logged out successfully",
  });
};

exports.getProfile = async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");

  if (!user) {
    return res.status(404).json({
      status: false,
      message: "User not found",
    });
  }

  return res.status(200).json({
    status: true,
    message: "User profile fetched successfully",
    data: user,
  });
};

exports.getAllUsers = async (req, res) => {
  const search = req.query.search || "";
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const totalUsers = await User.countDocuments({
    name: { $regex: search, $options: "i" },
  });

  const totalPages = Math.ceil(totalUsers / limit);

  const users = await User.find({
    name: { $regex: search, $options: "i" },
  })
    .select("-password")
    .skip(skip)
    .limit(limit);

  if (!users)
    return res.status(404).json({ status: false, message: "Users not found" });

  return res.status(200).json({
    status: true,
    message: "Users fetched successfully",
    data: users,
    page,
    totalUsers,
    totalPages,
  });
};

exports.getUserById = async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");

  if (!user) {
    return res.status(404).json({
      status: false,
      message: "User not found",
    });
  }

  return res.status(200).json({
    status: true,
    message: "User fetched successfully",
    data: user,
  });
};

exports.updateUser = async (req, res) => {
  const targetUserId = req.params.id;
  const currentUser = req.user;

  if (
    currentUser._id.toString() !== targetUserId &&
    currentUser.role !== "admin"
  )
    return res.status(403).json({
      status: false,
      message:
        "Access denied. You can only update your own profile or you must be an admin.",
    });

  if (req.body.role && currentUser.role !== "admin")
    return res.status(403).json({
      status: false,
      message: "Access denied. Only admins can change user roles.",
    });

  if (req.body.password) {
    const bcrypt = require("bcryptjs");
    req.body.password = bcrypt.hashSync(req.body.password, 10);
  }

  const user = await User.findByIdAndUpdate(targetUserId, req.body, {
    new: true,
    runValidators: true,
  }).select("-password");

  if (!user)
    return res.status(404).json({ status: false, message: "User not found" });

  return res.status(200).json({
    status: true,
    message: "User updated successfully",
    data: user,
  });
};
