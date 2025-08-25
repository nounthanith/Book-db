const { Router } = require("express");
const { register, login, logout, getProfile, getAllUsers, getUserById, updateUser } = require("./user.controller");
const auth = require("../../middleware/auth");

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", auth, logout);
router.get("/profile", auth, getProfile);
router.put("/profile", auth, (req, res) => {
  req.params.id = req.user._id.toString();
  updateUser(req, res);
});
router.get("/users", auth, getAllUsers);
router.get("/user/:id", auth, getUserById);
router.put("/user/:id", auth, updateUser);

module.exports = router;
