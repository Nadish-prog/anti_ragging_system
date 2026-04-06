const express = require("express");
const router = express.Router();
const userController = require("../controllers/users.controller");
const { requireAuth, requireRole } = require("../middlewares/auth.middleware");

router.get("/search", requireAuth, userController.searchUsers);

router.get("/faculty", requireAuth, requireRole("ADMIN"), userController.getFacultyMembers);

router.get("/", requireAuth, requireRole("ADMIN"), userController.getAllUsers);

router.post("/:id/reset-password", requireAuth, requireRole("ADMIN"), userController.resetUserPassword);

module.exports = router;
