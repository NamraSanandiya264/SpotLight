import Organization from "./organization.model.js";
import OrganizationMember from "./orgMember.model.js";
import JoinRequest from "./joinRequest.model.js";


// ✅ Create Organization
export const createOrganizationService = async (
  data,
  userId
) => {

  const organization = await Organization.create({
    ...data,
    createdBy: userId
  });

  return organization;
};


// ✅ Join Organization
export const joinOrganizationService = async (
  orgId,
  userId
) => {

  const org = await Organization.findById(orgId);

  if (!org)
    throw new Error("Organization not found");

  const exists =
    await OrganizationMember.findOne({
      user: userId,
      organization: orgId,
    });

  if (exists)
    throw new Error("Already a member");

  return await OrganizationMember.create({
    user: userId,
    organization: orgId,
    role: "member",
  });
};




// 1. Total(core + deputy + convenor) ≤ numofCoreMembers

// 2. Convenor:
//    - Can assign: core → convenor , core -> deputy, core -> member
//    - Can assign member -> core 
//    - Old convenor → member , old deputy -> member

// 3. Only one convenor and one deputy allowed

// 4. When assigning roles:
//    - Always check total core limit

export const updateMemberRoleService = async (
  orgId,
  targetUserId,
  newRole,
  currentUserId
) => {
  const org = await Organization.findById(orgId);
  if (!org) throw new Error("Organization not found");

  // 1. Verify caller belongs to the organization
  const currentUser = await OrganizationMember.findOne({
    user: currentUserId,
    organization: orgId,
  });
  if (!currentUser) throw new Error("Not part of organization");

  // 2. STRICT RULE: Only the Convenor can change anyone's role
  if (currentUser.role !== "convenor") {
    throw new Error("Access denied: Only the Convenor can modify member roles.");
  }

  // 3. Find the target user whose role is being changed
  const targetUser = await OrganizationMember.findOne({
    user: targetUserId,
    organization: orgId,
  });
  if (!targetUser) throw new Error("Target member not found");

  // If their role isn't changing, return early
  if (targetUser.role === newRole) return targetUser;

  // 4. Calculate core count changes beforehand to validate limits safely
  const currentCoreCount = await OrganizationMember.countDocuments({
    organization: orgId,
    role: { $in: ["core", "deputy", "convenor"] }
  });

  const wasCoreTier = ["core", "deputy", "convenor"].includes(targetUser.role);
  const willBeCoreTier = ["core", "deputy", "convenor"].includes(newRole);

  let anticipatedCoreCount = currentCoreCount;
  if (!wasCoreTier && willBeCoreTier) anticipatedCoreCount += 1;
  if (wasCoreTier && !willBeCoreTier) anticipatedCoreCount -= 1;

  // Track if leadership changes will automatically demote an old leader to a "member"
  let existingLeaderToDemote = null;

  // HANDLING CONVENOR SWAP
  if (newRole === "convenor") {
    existingLeaderToDemote = await OrganizationMember.findOne({
      organization: orgId,
      role: "convenor"
    });
    // If we swap a general member to convenor, the old convenor becomes a member.
    // Net core count change: +1 (new) -1 (old) = 0 change. Adjust count prediction:
    if (existingLeaderToDemote && !wasCoreTier) {
      anticipatedCoreCount -= 1; 
    }
  }

  // HANDLING DEPUTY SWAP
  if (newRole === "deputy") {
    existingLeaderToDemote = await OrganizationMember.findOne({
      organization: orgId,
      role: "deputy"
    });
    // If we swap a general member to deputy, the old deputy becomes a member.
    // Net core count change: +1 (new) -1 (old) = 0 change. Adjust count prediction:
    if (existingLeaderToDemote && !wasCoreTier) {
      anticipatedCoreCount -= 1;
    }
  }

  // 5. Enforce Core Capacity Limit Check
  if (willBeCoreTier && anticipatedCoreCount > org.numofCoreMembers) {
    throw new Error(`Core limit reached: Maximum allowed tier members is ${org.numofCoreMembers}.`);
  }

  // 6. Execute Database Updates
  
  // Demote previous leader if a leadership position was reassigned
  if (existingLeaderToDemote && existingLeaderToDemote.user.toString() !== targetUserId) {
    existingLeaderToDemote.role = "member";
    await existingLeaderToDemote.save();
  }

  // Apply new role to target user
  targetUser.role = newRole;
  await targetUser.save();

  return targetUser;
};

export const getAllOrganizationsService =
async()=>{

  const organizations =
    await Organization.find()
    .select(
      "name type photos description"
    );

  return organizations;
};

export const getOrganizationByIdService =
async(orgId)=>{

  const organization =
    await Organization.findById(
      orgId
    );

  if(!organization){
    throw new Error(
      "Organization not found"
    );
  }

  const members =
    await OrganizationMember
    .find({
      organization:orgId
    })
    .populate(
      "user",
      "name studentID"
    );

  const formattedMembers =
    members.map((m)=>({

      userId:m.user._id,

      name:m.user.name,

      studentID:
      m.user.studentID,

      role:m.role

    }));


  return {

    organization:{

      _id:
      organization._id,

      name:
      organization.name,

      type:
      organization.type,

      description:
      organization.description,

      photos:
      organization.photos

    },

    members:
    formattedMembers

  };

};

export const updateOrganizationProfileService = async (orgId, userId, updateData) => {
  const org = await Organization.findById(orgId);
  if (!org) throw new Error("Organization not found");

  const member = await OrganizationMember.findOne({ user: userId, organization: orgId });
  if (!member || !["convenor", "deputy", "core"].includes(member.role)) {
    throw new Error("Unauthorized: Only core members and leaders can edit this profile.");
  }

  const updatedFields = {};
  if (updateData.description !== undefined) {
    updatedFields.description = updateData.description;
  }
  
  // Accept the newly constructed local server file path string
  if (updateData.photoPath) {
    updatedFields.$push = { photos: updateData.photoPath };
  }

  return await Organization.findByIdAndUpdate(
    orgId,
    updatedFields,
    { new: true }
  );
};


// 📩 1. Create a Join Request (Any Student)
export const createJoinRequestService = async (orgId, userId) => {
  // Check if already a member
  const isMember = await OrganizationMember.findOne({ user: userId, organization: orgId });
  if (isMember) throw new Error("You are already a member of this organization.");

  // Check for an active pending request
  const hasPending = await JoinRequest.findOne({ user: userId, organization: orgId, status: "pending" });
  if (hasPending) throw new Error("Your request to join is already pending review.");

  return await JoinRequest.create({ user: userId, organization: orgId });
};

// 📋 2. Get Pending Requests (For Deputy/Convenor view)
export const getPendingRequestsService = async (orgId, currentUserId) => {
  // Verify caller is Deputy or Convenor of this club
  const caller = await OrganizationMember.findOne({ user: currentUserId, organization: orgId });
  if (!caller || !["convenor", "deputy"].includes(caller.role)) {
    throw new Error("Unauthorized: Only leaders and deputies can view pending requests.");
  }

  return await JoinRequest.find({ organization: orgId, status: "pending" }).populate("user", "name studentID");
};

// ⚖️ 3. Process Request (Deputy / Convenor Action)
export const processJoinRequestService = async (requestId, action, currentUserId) => {
  const request = await JoinRequest.findById(requestId);
  if (!request) throw new Error("Request record not found.");

  // Verify caller is Deputy or Convenor
  const caller = await OrganizationMember.findOne({ user: currentUserId, organization: request.organization });
  if (!caller || !["convenor", "deputy"].includes(caller.role)) {
    throw new Error("Unauthorized: Only leaders and deputies can process requests.");
  }

  if (action === "approved") {
    request.status = "approved";
    await request.save();

    // Check if membership entry exists already before adding
    const existingMember = await OrganizationMember.findOne({ user: request.user, organization: request.organization });
    if (!existingMember) {
      await OrganizationMember.create({
        user: request.user,
        organization: request.organization,
        role: "member",
      });
    }
    return { status: "approved" };
  } 
  
  if (action === "rejected") {
    request.status = "rejected";
    await request.save();
    return { status: "rejected" };
  }

  throw new Error("Invalid action code sent.");
};

export const removeMemberService = async (orgId, targetUserId, currentUserId) => {
  // 1. Validate permissions: Only the Convenor can remove members
  const caller = await OrganizationMember.findOne({ user: currentUserId, organization: orgId });
  if (!caller || caller.role !== "convenor") {
    throw new Error("Access denied: Only the Convenor can remove members from the organization.");
  }

  // 2. Prevent the Convenor from accidentally deleting themselves
  if (targetUserId.toString() === currentUserId.toString()) {
    throw new Error("Action denied: You cannot remove yourself. Transfer your Convenor role first.");
  }

  // 3. Atomic operational extraction
  const result = await OrganizationMember.findOneAndDelete({
    user: targetUserId,
    organization: orgId
  });

  if (!result) {
    throw new Error("Target member record not found in this organization.");
  }

  //Clear historic membership join records to prevent stale application lockouts
  await JoinRequest.deleteMany({
    user: targetUserId,
    organization: orgId
  });

  return result;
};

export const leaveOrganizationService = async (orgId, userId) => {
  const membership = await OrganizationMember.findOne({ user: userId, organization: orgId });
  if (!membership) {
    throw new Error("You are not a registered member of this organization.");
  }

  // Business Constraint: If they are the convenor, prevent them from abandoning the club without a leader
  if (membership.role === "convenor") {
    // Check if there is another core member who can be promoted, or force a role transfer first
    const alternativeLeader = await OrganizationMember.findOne({
      organization: orgId,
      user: { $ne: userId },
      role: { $in: ["deputy", "core"] }
    });

    if (!alternativeLeader) {
      throw new Error("Action Denied: As the sole Convenor, you cannot leave until you add or appoint a new leader.");
    }
  }

  // Remove the member
  await OrganizationMember.deleteOne({ _id: membership._id });

  await JoinRequest.deleteMany({ user: userId, organization: orgId });

  return { success: true };
};

export const getMyOrganizationsService = async (userId) => {
  // Find all memberships for this user and populate the organization details
  const memberships = await OrganizationMember.find({ user: userId })
    .populate("organization", "name type");
  
  // Map over the results to just return the organization objects
  return memberships.map(m => m.organization);
};