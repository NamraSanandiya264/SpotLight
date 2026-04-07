import Event from "./event.model.js";
import OrganizationMember from "../organizations/orgMember.model.js";
import Organization from "../organizations/organization.model.js";

// ✅ Create Event
export const createEventService = async (data, userId) => {
  
  const organizationId = data.organization;

  const org = await Organization.findById(organizationId);
  if (!org) throw new Error("Organization not found");

  const member = await OrganizationMember.findOne({
    user: userId,
    organization: organizationId,
  });

  if (!member) {
    throw new Error("You are not part of this organization");
  }

  if (!["core", "deputy", "convenor"].includes(member.role)) {
    throw new Error("Only core team can create events");
  }

  const {
    event_name,
    date,
    startTime,
    endTime,
    venue,
    description,
  } = data;

  // normalize date (important)
const startOfDay = new Date(date);
startOfDay.setHours(0, 0);

const endOfDay = new Date(date);
endOfDay.setHours(23, 59);

// only same venue events
const existingEvents = await Event.find({
  venue,
  date: { $gte: startOfDay, $lte: endOfDay },
});

const [sh, sm] = startTime.split(":").map(Number);
const [eh, em] = endTime.split(":").map(Number);

const newStart = sh * 60 + sm;
const newEnd = eh * 60 + em;

for (let e of existingEvents) {
  const [esh, esm] = e.startTime.split(":").map(Number);
  const [eeh, eem] = e.endTime.split(":").map(Number);

  const existingStart = esh * 60 + esm;
  const existingEnd = eeh * 60 + eem;

  // 🔥 ONLY SAME VENUE overlap check
  if (newStart < existingEnd && newEnd > existingStart) {
    throw new Error(`Venue "${venue}" is already booked at this time`);
  }
}
};

export const getEventsService = async (query) => {
  const filter = {};

  // 📅 Filter by date
  if (query.date) {
    const start = new Date(query.date);
    const end = new Date(query.date);
    end.setHours(23, 59);

    filter.date = { $gte: start, $lte: end };
  }

  // 🏢 Filter by organization
  if (query.organization) {
    filter.organization = query.organization;
  }

  const events = await Event.find(filter)
    .populate("organization", "name type")
    .populate("createdBy", "name studentID")
    .sort({ date: 1, startTime: 1 });

  return events;
};

// Update Event
export const updateEventService = async (eventId, data, userId) => {
  const event = await Event.findById(eventId);
  if (!event) throw new Error("Event not found");

  
  const member = await OrganizationMember.findOne({
    user: userId,
    organization: event.organization,
  });

  if (!member) {
    throw new Error("You are not part of this organization");
  }

  if (!["core", "deputy", "convenor"].includes(member.role)) {
    throw new Error("Not authorized to update event");
  }

  

  // ✅ sanitize input
  const {
    event_name,
    date,
    startTime,
    endTime,
    venue,
    description,
  } = data;

const newStart = data.startTime ?? event.startTime;
const newEnd = data.endTime ?? event.endTime;

const [sh, sm] = newStart.split(":").map(Number);
const [eh, em] = newEnd.split(":").map(Number);

const start = sh * 60 + sm;
const end = eh * 60 + em;

if (start >= end) {
  throw new Error("End time must be after start time");
}

  if (event_name !== undefined) event.event_name = event_name;
  if (date !== undefined) event.date = date;
  if (startTime !== undefined) event.startTime = startTime;
  if (endTime !== undefined) event.endTime = endTime;
  if (venue !== undefined) event.venue = venue;
  if (description !== undefined) event.description = description;

  await event.save();

  return event;
};