import express from "express";
import UserController from "../controllers/user.controller";

const router = express.Router();

router.post("/login", UserController.login);
router.post("/register", UserController.register);
router.post("/recoverPassword", UserController.recoverPassword);
router.post("/resetPassword", UserController.resetPassword);

export default router;
