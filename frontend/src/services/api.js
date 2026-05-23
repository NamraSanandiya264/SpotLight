import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5001/api", // backend URL
});

// Add token 
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

//APIs
export const checkAvailability = (data) =>
  API.post("/bookings/check", data);

export const createBooking = (data) =>
  API.post("/bookings", data);

export const getMyBookings = () =>
  API.get("/bookings/my");
export default API;

export const getAllRooms = () => API.get("/rooms");

export const updateBookingStatus = (id, status) => 
  API.patch(`/bookings/${id}/status`, { status });

export const getBookings = () => API.get("/bookings"); //for core

export const getMonthlyCalendar = (month, year) => 
  API.get(`/events/calendar?month=${month}&year=${year}`);

export const createEvent = (eventData) => 
  API.post("/events", eventData);