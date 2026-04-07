import Organization from "./organization.model.js";
import OrganizationMember from "./orgMember.model.js";

// ✅ Create Organization
export const createOrganizationService = async (data) => {
  const org = await Organization.create(data);
  return org;
};

// ✅ Join Organization
export const joinOrganizationService = async (orgId, userId) => {
  const org = await Organization.findById(orgId);
  if (!org) throw new Error("Organization not found");

  const exists = await OrganizationMember.findOne({
    user: userId,
    organization: orgId,
  });

  if (exists) throw new Error("Already a member");

  return await OrganizationMember.create({
    user: userId,
    organization: orgId,
    role: "member",
  });
};


// 1. Total(core + deputy + convenor) ≤ numofCoreMembers

// 2. Convenor:
//    - Can assign: core → convenor
//    - Old convenor → core

// 3. Deputy:
//    - Can assign: core → deputy
//    - Old deputy → core

// 4. Only one convenor and one deputy allowed

// 5. When assigning roles:
//    - Always check total core limit


export const updateMemberRoleService = async (
  orgId,
  targetUserId,
  newRole,
  currentUserId
) => {
  const org = await Organization.findById(orgId);
  if (!org) throw new Error("Organization not found");

  const currentUser = await OrganizationMember.findOne({
    user: currentUserId,
    organization: orgId,
  });
  if (!currentUser) throw new Error("Not part of organization");

  const targetUser = await OrganizationMember.findOne({
    user: targetUserId,
    organization: orgId,
  });
  if (!targetUser) throw new Error("Target not found");

  // =====================================================
  // 🔐 AUTHORIZATION
  // =====================================================
  if (newRole === "convenor" && currentUser.role !== "convenor") {
    throw new Error("Only convenor can assign convenor");
  }

  if (newRole === "deputy" && !["convenor", "deputy"].includes(currentUser.role)) {
    throw new Error("Only convenor or deputy can assign deputy");
  }

  if (newRole === "core" || newRole === "member") {
    if (currentUser.role !== "convenor") {
      throw new Error("Only convenor can change core/member roles");
    }
  } 

  // =====================================================
  // 🔥 COUNT CORE + DEPUTY + CONVENOR
  // =====================================================
  const coreCount = await OrganizationMember.countDocuments({
    organization: orgId,
    role: { $in: ["core", "deputy", "convenor"] },
  });

  // =====================================================
  // 🔁 PROMOTE TO CORE
  // =====================================================
  if (newRole === "core") {
    if (coreCount >= org.numofCoreMembers) {
      throw new Error("Core limit reached");
    }
    targetUser.role = "core";
  }

  // =====================================================
  // 🔁 PROMOTE TO DEPUTY
  // =====================================================
  if (newRole === "deputy") {
    const existingDeputy = await OrganizationMember.findOne({
      organization: orgId,
      role: "deputy",
    });

    if (existingDeputy && existingDeputy.user.toString() !== targetUserId) {
      existingDeputy.role = "member"; // revert to member
      await existingDeputy.save();
    }

    // ensure limit
    if (coreCount >= org.numofCoreMembers && targetUser.role === "member") {
      throw new Error("Core limit reached");
    }

    targetUser.role = "deputy";
  }

  // =====================================================
  // 🔁 PROMOTE TO CONVENOR
  // =====================================================
  if (newRole === "convenor") {
    const existingConvenor = await OrganizationMember.findOne({
      organization: orgId,
      role: "convenor",
    });

    if (existingConvenor && existingConvenor.user.toString() !== targetUserId) {
      existingConvenor.role = "member"; // revert to member
      await existingConvenor.save();
    }

    // ensure limit
    if (coreCount >= org.numofCoreMembers && targetUser.role === "member") {
      throw new Error("Core limit reached");
    }

    targetUser.role = "convenor";
  }

  // =====================================================
  // 🔁 DEMOTE TO MEMBER
  // =====================================================
  if (newRole === "member") {
    targetUser.role = "member";
  }

  await targetUser.save();

  return targetUser;
};

// ✅ Get All Organizations with ALL Members
export const getAllOrganizationsService = async () => {
  const organizations = await Organization.find();

  const result = [];

  for (let org of organizations) {
    const members = await OrganizationMember.find({
      organization: org._id,
    }).populate("user", "name studentID");

    const allMembers = members.map((m) => ({
      userId: m.user._id,
      name: m.user.name,
      studentID: m.user.studentID,
      role: m.role,
    }));

    result.push({
      _id: org._id,
      name: org.name,
      type: org.type,
      members: allMembers,
    });
  }

  return result;
};