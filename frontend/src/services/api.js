import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5001/api", // backend URL
});

// Add token interceptor
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// ==========================================
// 🏢 ROOMS & BOOKINGS APIs
// ==========================================
export const getAllRooms = () => 
  API.get("/rooms");

export const checkAvailability = (data) =>
  API.post("/bookings/check", data);

export const createBooking = (data) =>
  API.post("/bookings", data);

export const getMyBookings = () =>
  API.get("/bookings/my");

export const getBookings = () => 
  API.get("/bookings"); // for core committee view

export const updateBookingStatus = (id, status) => 
  API.patch(`/bookings/${id}/status`, { status });

// ==========================================
// 📅 EVENTS & CALENDAR APIs
// ==========================================
export const getMonthlyCalendar = (month, year) => 
  API.get(`/events/calendar?month=${month}&year=${year}`);

export const createEvent = (eventData) => 
  API.post("/events/create", eventData);

// 🚀 Default export of the axios instance
export default API;