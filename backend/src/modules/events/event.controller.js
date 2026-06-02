import Event from "./event.model.js";
import OrganizationMember from "../organizations/orgMember.model.js";
import Organization from "../organizations/organization.model.js";

// Helper function to validate authorization roles
const verifyEventAccess = async (userId, orgId) => {
  const member = await OrganizationMember.findOne({ user: userId, organization: orgId });
  
  if (!member || !["convenor", "deputy", "core"].includes(member.role)) {
    throw new Error("Unauthorized: Only Leaders and Core Committee members can manage events.");
  }
  return true;
};

// 🌟 HELPER: Convert "HH:MM" string to total minutes for absolute arithmetic comparison
const parseTimeToMinutes = (timeString) => {
  const [hours, minutes] = timeString.split(":").map(Number);
  return hours * 60 + minutes;
};

// 🔒 1. Create Event with Server-Side Validation
export const createEvent = async (req, res) => {
  try {
    const { eventName, date, startTime, endTime, venue, organizationId, description } = req.body;
    
    // A. Check authority alignment permissions
    await verifyEventAccess(req.user._id, organizationId);

    // B. VALIDATION: Check for empty mandatory fields
    if (!eventName?.trim() || !date || !startTime || !endTime || !venue?.trim() || !organizationId) {
      return res.status(400).json({ success: false, message: "All fields except description are mandatory to fill." });
    }

    // C. VALIDATION: Block scheduling events in the past
    const inputDate = new Date(date);
    const todayMidnight = new Date();
    todayMidnight.setHours(0, 0, 0, 0); // Normalize to current day midnight local clock boundary

    if (inputDate < todayMidnight) {
      return res.status(400).json({ success: false, message: "Invalid Date: Cannot schedule events in the past." });
    }

    // D. VALIDATION: Enforce Chronological Logical Ordering
    const startMinutes = parseTimeToMinutes(startTime);
    const endMinutes = parseTimeToMinutes(endTime);

    if (startMinutes >= endMinutes) {
      return res.status(400).json({ success: false, message: "Invalid Timing: The Event End Time must occur after the scheduled Start Time." });
    }

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

// 🔒 2. Update/Edit Event with Server-Side Validation
export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { eventName, date, startTime, endTime, venue, description } = req.body;

    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });

    await verifyEventAccess(req.user._id, event.organization);

    // If updating time parameters, perform cross-field evaluation validation
    const absoluteStartTime = startTime || event.startTime;
    const absoluteEndTime = endTime || event.endTime;
    
    if (parseTimeToMinutes(absoluteStartTime) >= parseTimeToMinutes(absoluteEndTime)) {
      return res.status(400).json({ success: false, message: "Invalid Timing: The Event End Time must occur after the scheduled Start Time." });
    }

    // If updating the date parameter, ensure it isn't shifted into a past date history
    if (date) {
      const inputDate = new Date(date);
      const todayMidnight = new Date();
      todayMidnight.setHours(0, 0, 0, 0);
      if (inputDate < todayMidnight) {
        return res.status(400).json({ success: false, message: "Invalid Date: Cannot shift scheduled events into the past." });
      }
    }

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

export const publishEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });

    const member = await OrganizationMember.findOne({ user: req.user._id, organization: event.organization });
    if (!member || !["convenor", "deputy", "core"].includes(member.role)) {
      return res.status(403).json({ success: false, message: "Unauthorized to publish this event." });
    }

    event.isPublished = true;
    await event.save();

    res.status(200).json({ success: true, message: "Event published to the Campus Calendar successfully!", event });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getMonthlyCalendarData = async (req, res) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({ success: false, message: "Month and Year are required queries." });
    }

    const paddedMonth = String(month).padStart(2, "0");
    const totalDaysInMonth = new Date(year, month, 0).getDate();

    const startOfMonth = new Date(`${year}-${paddedMonth}-01T00:00:00+05:30`);
    const endOfMonth = new Date(`${year}-${paddedMonth}-${totalDaysInMonth}T23:59:59+05:30`);

    const events = await Event.find({
      isPublished: true,
      date: { $gte: startOfMonth, $lte: endOfMonth }
    }).populate("organization", "name");

    const groupedEvents = {};
    
    events.forEach(event => {
      const localDateStr = event.date.toLocaleDateString("en-CA", {
        timeZone: "Asia/Kolkata" 
      });
      
      if (!groupedEvents[localDateStr]) {
        groupedEvents[localDateStr] = [];
      }
      groupedEvents[localDateStr].push(event);
    });

    res.status(200).json({
      success: true,
      events: groupedEvents 
    });

  } catch (err) {
    console.error("Error fetching calendar data:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// 🌟 ADD TO THE BOTTOM OF YOUR EXISTING event.controller.js
export const getEventsByDay = async (req, res) => {
  try {
    const { date } = req.query; // Expecting 'YYYY-MM-DD' from the frontend call

    if (!date) {
      return res.status(400).json({ success: false, message: "Target lookup date parameter is missing." });
    }

    // Set a explicit timezone boundary window for the target day in Indian Standard Time (IST)
    const startOfDay = new Date(`${date}T00:00:00+05:30`);
    const endOfDay = new Date(`${date}T23:59:59+05:30`);

    const events = await Event.find({
      isPublished: true,
      date: { $gte: startOfDay, $lte: endOfDay }
    })
    .populate("organization", "name")
    .sort({ startTime: 1 }); // Sort chronologically throughout the day

    res.status(200).json({ success: true, events });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};