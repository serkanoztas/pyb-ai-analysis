import express from "express";

import {
    getUsers,
    createUser,
    updateUser,
    resetUserPassword,
    deleteUser,
} from "../controllers/userController.js";

import {
    protect,
    authorizeRoles,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.use(authorizeRoles("admin"));
router.get("/", getUsers);
router.post("/", createUser);
router.put("/:id", updateUser);
router.patch("/:id/password", resetUserPassword);
router.delete("/:id", deleteUser);

export default router;
