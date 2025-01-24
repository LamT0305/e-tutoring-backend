import express from "express";
import {createRole , getAllRoles, getRoleById } from "../controllers/roleController.js";

const router = express.Router();

router.route("/").get(getAllRoles).post(createRole)
router.route("/:id").get(getRoleById)

export default router