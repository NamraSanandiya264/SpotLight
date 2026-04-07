import {
  createOrganizationService,
  joinOrganizationService,
  updateMemberRoleService,
  getAllOrganizationsService,
} from "../organizations/organization.service.js";

export const createOrganization = async (req, res) => {
  try {
    const org = await createOrganizationService(req.body);
    res.status(201).json(org);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const joinOrganization = async (req, res) => {
  try {
    const member = await joinOrganizationService(
      req.params.orgId,
      req.user._id
    );
    res.status(201).json(member);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateMemberRole = async (req, res) => {
  try {
    const member = await updateMemberRoleService(
      req.params.orgId,
      req.params.userId,
      req.body.role,
      req.user._id
    );

    res.json(member);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getAllOrganizations = async (req, res) => {
  try {
    const orgs = await getAllOrganizationsService();
    res.status(200).json(orgs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};