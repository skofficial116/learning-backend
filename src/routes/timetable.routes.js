import { Router } from "express";
import { findEmptyClassrooms, findOccupiedClassrooms } from "../controllers/timetable.controller.js";
const router = Router();

router.route("/findEmptyRooms").post( findEmptyClassrooms);

router.route("/findOccupiedRooms").post(findOccupiedClassrooms)

export default router;
