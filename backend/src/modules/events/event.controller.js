import Event from "./event.model.js";
import OrganizationMember from "../organizations/orgMember.model.js";
import Organization from "../organizations/organization.model.js";


const verifyEventAccess = async (userId, orgId) => {
  const member = await OrganizationMember.findOne({ user: userId, organization: orgId });
  
  // Now allows Convenors, Deputies, and Core Members to pass through
  if (!member || !["convenor", "deputy", "core"].includes(member.role)) {
    throw new Error("Unauthorized: Only Leaders and Core Committee members can manage events.");
  }
  return true;
};

// 📅 1. Create Event (Convenor, Deputy, & Core)
export const createEvent = async (req, res) => {
  try {
    const { eventName, date, startTime, endTime, venue, organizationId, description } = req.body;
    
    // Check against updated access permissions
    await verifyEventAccess(req.user._id, organizationId);

    const event = await Event.create({
      eventName,
      date,
      startTime,
      endTime,
      venue,
      organization: organizationId,
      description,
      createdBy: req.user._id
    });

    res.status(201).json({ success: true, message: "Event created successfully!", event });
  } catch (err) {
    res.status(403).json({ success: false, message: err.message });
  }
};

// 📝 2. Update/Edit Event (Convenor, Deputy, & Core)
export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { eventName, date, startTime, endTime, venue, description } = req.body;

    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });

    // Verify authorized core/leader alignment before allowing modifications
    await verifyEventAccess(req.user._id, event.organization);

    event.eventName = eventName || event.eventName;
    event.date = date || event.date;
    event.startTime = startTime || event.startTime;
    event.endTime = endTime || event.endTime;
    event.venue = venue || event.venue;
    event.description = description || event.description;

    await event.save();
    res.status(200).json({ success: true, message: "Event updated successfully!", event });
  } catch (err) {
    res.status(403).json({ success: false, message: err.message });
  }
};

export const getDeputyEvents = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const targetRoles = ["convenor", "deputy", "core"];

    console.log(`[Event Debug] Fetching rosters for User ID: ${currentUserId}`);

    const managedMemberships = await OrganizationMember.find({
      $or: [
        { userId: currentUserId },
        { user: currentUserId }
      ],  
      role: { $in: targetRoles }
    });

    console.log(`[Event Debug] Found ${managedMemberships.length} matching organizational ties.`);
    
    const orgIds = managedMemberships.map(m => m.organization);
    const managedOrgs = await Organization.find({ _id: { $in: orgIds } });
    const events = await Event.find({ organization: { $in: orgIds } }).populate("organization", "name");

    res.status(200).json({ 
      success: true, 
      events, 
      managedOrgs 
    });

  } catch (err) {
    console.error("Crash in getDeputyEvents endpoint:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });

    // Re-use your helper check to make sure they have rights to this club's events
    const member = await OrganizationMember.findOne({ user: req.user._id, organization: event.organization });
    if (!member || !["convenor", "deputy", "core"].includes(member.role)) {
      return res.status(403).json({ success: false, message: "Unauthorized to delete this event." });
    }

    await Event.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Event removed successfully!" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};