import Event from "./event.model.js";
import OrganizationMember from "../organizations/orgMember.model.js";
import Organization from "../organizations/organization.model.js";
import Booking from "../booking/booking.model.js"; 
import { checkRoomConflict } from "../booking/booking.service.js";

// Validates if user is a leader in the organization
const verifyEventAccess = async (userId, orgId) => {
  const member = await OrganizationMember.findOne({ user: userId, organization: orgId });
  if (!member || !["convenor", "deputy", "core"].includes(member.role)) {
    throw new Error("Unauthorized: Only Leaders and Core members can manage events.");
  }
  return true;
};

// Converts HH:MM string to total minutes for comparison
const parseTimeToMinutes = (timeString) => {
  const [hours, minutes] = timeString.split(":").map(Number);
  return hours * 60 + minutes;
};

// Create Event
export const createEvent = async (req, res) => {
  try {
    const { eventName, date, startTime, endTime, venue, organizationId, description } = req.body;
    
    await verifyEventAccess(req.user._id, organizationId);

    if (!eventName?.trim() || !date || !startTime || !endTime || !venue || !organizationId) {
      return res.status(400).json({ success: false, message: "All fields except description are mandatory." });
    }

    const inputDate = new Date(date);
    const todayMidnight = new Date();
    todayMidnight.setUTCHours(0, 0, 0, 0); 
    inputDate.setUTCHours(0, 0, 0, 0);

    if (inputDate < todayMidnight) {
      return res.status(400).json({ success: false, message: "Invalid Date: Cannot schedule events in the past." });
    }

    if (parseTimeToMinutes(startTime) >= parseTimeToMinutes(endTime)) {
      return res.status(400).json({ success: false, message: "Invalid Timing: End Time must occur after Start Time." });
    }

    // Check room availability
    const isConflicted = await checkRoomConflict(venue, inputDate, startTime, endTime);
    if (isConflicted) {
      return res.status(400).json({ 
        success: false, 
        message: "Venue Conflict: This room is already requested or booked during this time." 
      });
    }

    // Generate a pending room booking ticket
    const automatedBooking = await Booking.create({
      room_id: venue,
      user_id: req.user._id,
      date: inputDate,
      start_time: startTime,
      end_time: endTime,
      purpose: `Event: ${eventName}`,
      status: "pending" 
    });

    // Create the event as a draft linked to the booking
    const event = await Event.create({
      eventName,
      date: inputDate,
      startTime,
      endTime,
      venue,
      organization: organizationId,
      bookingRef: automatedBooking._id,
      description,
      createdBy: req.user._id,
      isPublished: false
    });

    res.status(201).json({ success: true, message: "Event created and room requested successfully!", event });
  } catch (err) {
    res.status(403).json({ success: false, message: err.message });
  }
};

// Update Event
export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { eventName, date, startTime, endTime, venue, description } = req.body;

    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ success: false, message: "Event not found." });

    await verifyEventAccess(req.user._id, event.organization);

    const finalDate = date ? new Date(date) : new Date(event.date);
    finalDate.setUTCHours(0, 0, 0, 0);
    const finalStartTime = startTime || event.startTime;
    const finalEndTime = endTime || event.endTime;
    const finalVenue = venue || event.venue;

    // 1. Detect if logistics (Time, Date, Venue) actually changed
    const dateChanged = date && new Date(date).getTime() !== new Date(event.date).getTime();
    const timeChanged = (startTime && startTime !== event.startTime) || (endTime && endTime !== event.endTime);
    const venueChanged = venue && venue.toString() !== event.venue.toString();
    const logisticsChanged = dateChanged || timeChanged || venueChanged;

    if (logisticsChanged) {
      const todayMidnight = new Date();
      todayMidnight.setUTCHours(0, 0, 0, 0);
      if (finalDate < todayMidnight) {
        return res.status(400).json({ success: false, message: "Cannot shift events into the past." });
      }

      if (parseTimeToMinutes(finalStartTime) >= parseTimeToMinutes(finalEndTime)) {
        return res.status(400).json({ success: false, message: "End Time must occur after Start Time." });
      }

      // 2. Verify new slot is free (excluding the current event's existing booking)
      const existingBooking = await Booking.findOne({
        _id: { $ne: event.bookingRef },
        room_id: finalVenue,
        date: finalDate,
        status: { $in: ["pending", "approved"] },
        $or: [
          { start_time: { $lt: finalEndTime }, end_time: { $gt: finalStartTime } }
        ]
      }).populate("user_id", "name");

      // 3. If unavailable, throw the exact error message requested
      if (existingBooking) {
        const bookedBy = existingBooking.user_id?.name || "another student";
        const purpose = existingBooking.purpose || "a prior reservation";
        return res.status(400).json({ 
          success: false, 
          message: `Update Failed: The room is currently booked by ${bookedBy} for ${purpose}.` 
        });
      }
    }

    // 4. Apply all updates to the Event record
    event.eventName = eventName || event.eventName;
    event.date = finalDate;
    event.startTime = finalStartTime;
    event.endTime = finalEndTime;
    event.venue = finalVenue;
    event.description = description !== undefined ? description : event.description;

    // 5. Sync changes to the Booking Ticket and apply the isEdited flags!
    if (logisticsChanged && event.bookingRef) {
      event.isEdited = true; // Mark event as edited
      
      await Booking.findByIdAndUpdate(event.bookingRef, {
        room_id: finalVenue,
        date: finalDate,
        start_time: finalStartTime,
        end_time: finalEndTime,
        purpose: `Event: ${event.eventName}`,
        isEdited: true // Mark booking as edited
        // Notice we do NOT change the booking status here! It stays approved.
      });
      // Notice we do NOT set event.isPublished = false! It stays live.
      
    } else if (eventName && event.bookingRef) {
      // If only cosmetic (Name) changed, just update the booking purpose text
      await Booking.findByIdAndUpdate(event.bookingRef, { purpose: `Event: ${event.eventName}` });
    }

    await event.save();
    res.status(200).json({ success: true, message: "Event updated successfully!", event });
  } catch (err) {
    res.status(403).json({ success: false, message: err.message });
  }
};

// Fetch Dashboard Data
export const getDeputyEvents = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    const managedMemberships = await OrganizationMember.find({
      user: currentUserId, 
      role: { $in: ["convenor", "deputy", "core"] }
    });
    
    const orgIds = managedMemberships.map(m => m.organization);
    const managedOrgs = await Organization.find({ _id: { $in: orgIds } });
    
    // Populate venue and booking ref to show status on the frontend
    const events = await Event.find({ organization: { $in: orgIds } })
      .populate("organization", "name")
      .populate("venue", "name")
      .populate("bookingRef", "status");

    res.status(200).json({ success: true, events, managedOrgs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete Event
export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ success: false, message: "Event not found." });

    await verifyEventAccess(req.user._id, event.organization);

    if (event.bookingRef) {
      await Booking.findByIdAndDelete(event.bookingRef);
    }

    await Event.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Event and associated room request removed." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Publish Event
export const publishEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id).populate("bookingRef");
    if (!event) return res.status(404).json({ success: false, message: "Event not found." });

    await verifyEventAccess(req.user._id, event.organization);

    // Prevent publishing if the room booking is not yet approved
    if (event.bookingRef && event.bookingRef.status !== "approved") {
      return res.status(403).json({ 
        success: false, 
        message: `Cannot publish: Room booking is currently ${event.bookingRef.status}. Wait for SBG approval.` 
      });
    }

    event.isPublished = true;
    await event.save();

    res.status(200).json({ success: true, message: "Event published to the Campus Calendar!", event });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Public Calendar Fetch
export const getMonthlyCalendarData = async (req, res) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({ success: false, message: "Month and Year are required." });
    }

    const paddedMonth = String(month).padStart(2, "0");
    const totalDaysInMonth = new Date(year, month, 0).getDate();

    const startOfMonth = new Date(`${year}-${paddedMonth}-01T00:00:00+05:30`);
    const endOfMonth = new Date(`${year}-${paddedMonth}-${totalDaysInMonth}T23:59:59+05:30`);

    const events = await Event.find({
      isPublished: true,
      date: { $gte: startOfMonth, $lte: endOfMonth }
    })
    .populate("organization", "name")
    .populate("venue", "name"); 

    const groupedEvents = {};
    
    events.forEach(event => {
      const localDateStr = event.date.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
      
      if (!groupedEvents[localDateStr]) groupedEvents[localDateStr] = [];
      groupedEvents[localDateStr].push(event);
    });

    res.status(200).json({ success: true, events: groupedEvents });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};