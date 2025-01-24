import express from "express";
const router = express.Router();

import {createUser, login} from "../controllers/userController.js"
import authMiddleware from "../middleware/auth.js"
router.route("/create-user").post(createUser)
router.route("/login").post(login)

export default router