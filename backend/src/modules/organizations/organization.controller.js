import {
  createOrganizationService,
  getAllOrganizationsService,
  getOrganizationByIdService,
  joinOrganizationService,
  updateOrganizationProfileService,
  updateMemberRoleService,
  createJoinRequestService, 
  getPendingRequestsService, 
  processJoinRequestService,
  removeMemberService,
} from "./organization.service.js";

import Organization from "./organization.model.js"; 
import OrganizationMember from "./orgMember.model.js"; 
import JoinRequest from "./joinRequest.model.js";

// =============================
// Create Organization
// =============================
export const createOrganization = async (req, res) => {
  try {
    const organization =
      await createOrganizationService(
        req.body,
        req.user._id
      );

    res.status(201).json({
      success: true,
      organization,
    });

  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};


// =============================
// Get All Organizations
// =============================
export const getAllOrganizations = async (req, res) => {
  try {
    const organizations =
      await getAllOrganizationsService();

    res.status(200).json({
      success: true,
      organizations,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


export const getOrganizationById = async (req, res) => {
  try {
    const orgId = req.params.id;
    const userId = req.user._id;

    const organization = await Organization.findById(orgId);
    if (!organization) {
      return res.status(404).json({ success: false, message: "Organization record not found." });
    }

    // 🌟 THE FIX: Populate the associated User data fields (name and studentID) right out of the DB reference link
    const membersRaw = await OrganizationMember.find({ organization: orgId }).populate("user", "name studentID");

    // Map the populated array fields cleanly to the data keys expected by your frontend file model loop
    const members = membersRaw.map(m => ({
      userId: m.user?._id || m.user,
      name: m.user?.name || "Unknown User",       // Falls back to "Unknown" if user document was deleted
      studentID: m.user?.studentID || "No ID",    // Maps user collection student ID field accurately
      role: m.role
    }));

    // Check if the current user has an active pending request
    let hasPendingRequest = false;
    try {
      if (JoinRequest) {
        const pendingRecord = await JoinRequest.findOne({
          organization: orgId,
          user: userId,
          status: "pending"
        });
        hasPendingRequest = !!pendingRecord;
      }
    } catch (qErr) {
      hasPendingRequest = false; 
    }

    res.status(200).json({
      success: true,
      organization,
      members,
      hasPendingRequest
    });

  } catch (err) {
    console.error("Crash in getOrganizationById:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};


// =============================
// Join Organization (NEW)
// =============================
export const joinOrganization = async (req, res) => {
  try {
    const membership = await joinOrganizationService(
      req.params.id,   // organization ID from URL
      req.user._id     // logged-in user ID from protect middleware
    );

    res.status(201).json({
      success: true,
      message: "Successfully joined the organization",
      membership,
    });

  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message, // Catches "Already a member" or "Organization not found"
    });
  }
};


export const updateOrganizationProfile = async (req, res) => {
  try {
    const updateData = { description: req.body.description };

    if (!req.file && !req.body.description) {
      throw new Error("No image file received by the server. Check your Form Data keys.");
    }

    if (req.file) {
      updateData.photoPath = `/uploads/organizations/${req.file.filename}`;
    }

    const updatedOrg = await updateOrganizationProfileService(
      req.params.id,
      req.user._id,
      updateData
    );

    res.status(200).json({
      success: true,
      organization: updatedOrg
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

export const updateMemberRole = async (req, res) => {
  try {
    const { targetUserId, newRole } = req.body;

    if (!targetUserId || !newRole) {
      return res.status(400).json({
        success: false,
        message: "Missing targetUserId or newRole field in request body."
      });
    }

    const updatedMember = await updateMemberRoleService(
      req.params.id,       // Organization ID from URL parameter
      targetUserId,        // Target user ID to alter
      newRole,             // New role string assignment
      req.user._id         // Logged-in user's ID from auth token
    );

    res.status(200).json({
      success: true,
      message: `Successfully changed member role to ${newRole}`,
      member: updatedMember
    });

  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};
// =============================
// Submit a Join Request
// =============================
export const createJoinRequest = async (req, res) => {
  try {
    const request = await createJoinRequestService(req.params.id, req.user._id);
    res.status(201).json({ 
      success: true, 
      message: "Join request submitted successfully!", 
      request 
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// =============================
// Get All Pending Requests (Deputy/Convenor)
// =============================
export const getPendingRequests = async (req, res) => {
  try {
    const requests = await getPendingRequestsService(req.params.id, req.user._id);
    res.status(200).json({ success: true, requests });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// =============================
// Approve/Reject a Request (Deputy/Convenor)
// =============================
export const processJoinRequest = async (req, res) => {
  try {
    const { action } = req.body; // Expects "approved" or "rejected"

    const result = await processJoinRequestService(
      req.params.requestId, 
      action, 
      req.user._id
    );

    res.status(200).json({ 
      success: true, 
      message: `Request successfully ${action}!`,
      ...result 
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const removeMember = async (req, res) => {
  try {
    await removeMemberService(
      req.params.id,        // Organization ID
      req.body.targetUserId, // Member to remove
      req.user._id          // Caller authenticated user ID
    );

    res.status(200).json({
      success: true,
      message: "Member successfully removed from the organization."
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};
