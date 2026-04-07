import {
  createEventService,
  getEventsService,
  updateEventService,
} from "./event.service.js";

import { getMonthlyCalendarService } from "./event.calender.service.js";

export const createEvent = async (req, res) => {
  try {
    if (!req.body.organization) {
      return res.status(400).json({ message: "Organization is required" });
    }

    const event = await createEventService(req.body, req.user._id);

    res.status(201).json(event);

  } catch (err) {
    console.error(err);
    res.status(err.statusCode || 400).json({ message: err.message });
  }
};


export const getEvents = async (req, res) => {
  try {
    const events = await getEventsService(req.query);
    res.status(200).json(events);
  } catch (err) {
    console.error(err);
    res.status(err.statusCode || 400).json({ message: err.message });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const event = await updateEventService(
      req.params.id,
      req.body,
      req.user._id
    );

    res.status(200).json(event);
  } catch (err) {
    console.error(err);
    res.status(err.statusCode || 400).json({ message: err.message });
  }
};

export const getMonthlyCalendar = async (req, res) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({
        message: "Month and Year are required"
      });
    }

    const data = await getMonthlyCalendarService(
      Number(month),
      Number(year)
    );

    res.status(200).json(data);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};      