import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";


const router = Router();

// console.log('user.routes.js ran');

router.route("/register").post(registerUser);


export default router;