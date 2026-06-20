import express from "express";

import {
  createOrganization,
  getAllOrganizations,
  getOrganizationById,
  joinOrganization,
  updateOrganizationProfile,
  updateMemberRole,
  createJoinRequest,
  getPendingRequests,
  processJoinRequest, 
  removeMember,
  leaveOrganization,
  getMyOrganizations
} from "./organization.controller.js";

import { uploadImage } from "../../middleware/upload.middleware.js";

import {
  protect,
  authorize
} from "../../middleware/auth.middleware.js";

const router = express.Router();


// only sbg_core
router.post(
  "/",
  protect,
  authorize("sbg_core"),
  createOrganization
);

// everyone logged in
router.get(
  "/",
  protect,
  getAllOrganizations
);
router.get("/my", protect, getMyOrganizations);
// organization detail
router.get(
  "/:id",
  protect,
  getOrganizationById
);

router.post(
  "/:id/join",
  protect,
  joinOrganization
);

router.put(
  "/:id/update-profile",
  protect,
  uploadImage.single("photo"), 
  updateOrganizationProfile
);

router.put(
  "/:id/roles",
  protect,
  updateMemberRole
);

router.post("/:id/request-join", protect, createJoinRequest);
router.get("/:id/pending-requests", protect, getPendingRequests);
router.put("/requests/:requestId", protect, processJoinRequest);

router.delete("/:id/members", protect, removeMember);
router.post("/:id/leave", protect, leaveOrganization);
export default router;