import express from "express";
import {
  createOrganization,
  joinOrganization,
  updateMemberRole,
  getAllOrganizations
} from "./organization.controller.js";

import { protect, authorize } from "../../middleware/auth.middleware.js";

const router = express.Router();

// 🔐 only sbg_core can create org
router.post("/", protect, authorize("sbg_core"), createOrganization);

router.post("/:orgId/join", protect, joinOrganization);
router.patch("/:orgId/role/:userId", protect, updateMemberRole);
router.get("/", getAllOrganizations);

export default router;