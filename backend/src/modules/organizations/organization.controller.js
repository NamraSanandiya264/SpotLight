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
  leaveOrganizationService,
  getMyOrganizationsService,
  setCoverPhotoService,
  removePhotoService,
  updateOrganizationAdminService,
  deleteOrganizationService
} from "./organization.service.js";

import JoinRequest from "./joinRequest.model.js";

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

    const detailData = await getOrganizationByIdService(orgId);

    let hasPendingRequest = false;
    if (JoinRequest) {
      const pendingRecord = await JoinRequest.findOne({
        organization: orgId,
        user: userId,
        status: "pending"
      });
      hasPendingRequest = !!pendingRecord;
    }

    res.status(200).json({
      success: true,
      organization: detailData.organization,
      members: detailData.members,
      hasPendingRequest
    });

  } catch (err) {
    console.error("Crash in getOrganizationById:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};


export const joinOrganization = async (req, res) => {
  try {
    const membership = await joinOrganizationService(
      req.params.id,   
      req.user._id     
    );

    res.status(201).json({
      success: true,
      message: "Successfully joined the organization",
      membership,
    });

  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message, 
    });
  }
};


export const updateOrganizationProfile = async (req, res) => {
  try {
    const updateData = { 
      description: req.body.description,
      name: req.body.name
    };

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
      req.params.id,       
      targetUserId,        
      newRole,             
      req.user._id         
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


export const getPendingRequests = async (req, res) => {
  try {
    const requests = await getPendingRequestsService(req.params.id, req.user._id);
    res.status(200).json({ success: true, requests });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const processJoinRequest = async (req, res) => {
  try {
    const { action } = req.body; 

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
      req.params.id,        
      req.body.targetUserId, 
      req.user._id   
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


export const leaveOrganization = async (req, res) => {
  try {
    const result = await leaveOrganizationService(req.params.id, req.user._id);
    res.status(200).json({
      success: true,
      message: "You have successfully left the organization configuration."
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};


export const getMyOrganizations = async (req, res) => {
  try {
    const organizations = await getMyOrganizationsService(req.user._id);
    
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

export const setCoverPhoto = async (req, res) => {
  try {
    const { photoUrl } = req.body;
    if (!photoUrl) throw new Error("No photo URL provided.");

    const updatedOrg = await setCoverPhotoService(req.params.id, req.user._id, photoUrl);

    res.status(200).json({
      success: true,
      message: "Cover photo updated successfully",
      organization: updatedOrg
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const removePhoto = async (req, res) => {
  try {
    const { photoUrl } = req.body;
    if (!photoUrl) throw new Error("No photo URL provided.");

    const updatedOrg = await removePhotoService(req.params.id, req.user._id, photoUrl);

    res.status(200).json({
      success: true,
      message: "Photo removed successfully",
      organization: updatedOrg
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const updateOrganizationAdmin = async (req, res) => {
  try {
    const updatedOrg = await updateOrganizationAdminService(req.params.id, req.body);
    res.status(200).json({ success: true, organization: updatedOrg });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const deleteOrganization = async (req, res) => {
  try {
    await deleteOrganizationService(req.params.id);
    res.status(200).json({ success: true, message: "Organization deleted successfully." });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};