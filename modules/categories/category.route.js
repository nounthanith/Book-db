const { Router } = require("express");
const { create, getAll, getById, update, remove } = require("./category.controller");
const auth = require("../../middleware/auth");

const router = Router();

router.post("/category", auth, create);
router.get("/category", auth, getAll);
router.get("/category/:id", auth, getById);
router.put("/category/:id", auth, update);
router.delete("/category/:id", auth, remove);

module.exports = router;