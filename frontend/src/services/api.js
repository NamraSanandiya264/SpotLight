import axios from "axios";

const backendUrl = import.meta.env.BACKEND_URL;
if (!backendUrl) {
  throw new Error("BACKEND_URL is not defined in environment variables.");
}
const API = axios.create({
  baseURL: `${backendUrl}/api`,
});

// Add token interceptor
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export const getAllRooms = () => API.get("/rooms");

export const checkAvailability = (data) => API.post("/bookings/check", data);

export const createBooking = (data) => API.post("/bookings", data);

export const getMyBookings = () => API.get("/bookings/my");

export const getBookings = () => API.get("/bookings"); 

export const updateBookingStatus = (id, status) => API.patch(`/bookings/${id}/status`, { status });

export const getMonthlyCalendar = (month, year) => API.get(`/events/calendar?month=${month}&year=${year}`);

export const createEvent = (eventData) => API.post("/events/create", eventData);

export const cancelBooking = (id) => API.patch(`/bookings/${id}/cancel`);
export const getMyOrganizations = () => API.get("/organizations/my");


export const createOrganization = (data) => API.post("/organizations", data);

export const joinOrganization = (orgId) => 
  API.post(`/organizations/${orgId}/join`);

export const getAllOrganizations = () => 
  API.get("/organizations");

export const getOrganizationById = (orgId) => 
  API.get(`/organizations/${orgId}`);

export const updateMemberRole = (
  orgId,
  targetUserId,
  newRole
) => API.patch(`/organizations/${orgId}/members/${targetUserId}/role`, { role: newRole });

export const updateOrganizationAdmin = (id, data) => API.put(`/organizations/${id}/admin`, data);
export const deleteOrganization = (id) => API.delete(`/organizations/${id}`);

export const getEventsByDay = (dateString) => API.get(`/events/day?date=${dateString}`);

export default API;



