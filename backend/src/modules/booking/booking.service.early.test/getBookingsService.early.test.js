import Booking from "../booking.model.js";
import { getBookingsService } from '../booking.service';

const originalValidatorModule = jest.requireActual("../../../utils/validators/booking.validator.js");
jest.mock("../../../utils/validators/booking.validator.js", () => ({
  __esModule: true,
  ...originalValidatorModule,
  validateBookingInput: jest.fn(),
}));

describe('getBookingsService() getBookingsService method', () => {
  let populateMock1, populateMock2, findMock;

  beforeEach(() => {
    jest.clearAllMocks();

    populateMock2 = jest.fn();
    populateMock1 = jest.fn();

    populateMock2.mockReturnValue([
      {
        _id: 'booking1',
        user_id: { _id: 'user1', name: 'Alice' },
        room_id: { _id: 'room1', name: 'Conference Room' },
        date: '2024-06-01',
        start_time: '09:00',
        end_time: '10:00',
        purpose: 'Meeting',
      },
      {
        _id: 'booking2',
        user_id: { _id: 'user2', name: 'Bob' },
        room_id: { _id: 'room2', name: 'Board Room' },
        date: '2024-06-02',
        start_time: '11:00',
        end_time: '12:00',
        purpose: 'Presentation',
      },
    ]);

    populateMock1.mockReturnValue({
      populate: populateMock2,
    });

    findMock = jest.spyOn(Booking, 'find').mockReturnValue({
      populate: populateMock1,
    });
  });

  it('should return all bookings with populated user_id and room_id (happy path)', async () => {
    const result = await getBookingsService();

    expect(Booking.find).toHaveBeenCalledTimes(1);
    expect(populateMock1).toHaveBeenCalledWith('user_id');
    expect(populateMock2).toHaveBeenCalledWith('room_id');
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(2);
    expect(result[0]).toHaveProperty('user_id');
    expect(result[0]).toHaveProperty('room_id');
    expect(result[1]).toHaveProperty('user_id');
    expect(result[1]).toHaveProperty('room_id');
  });

  it('should handle bookings with empty array (no bookings found)', async () => {
    populateMock2.mockReturnValue([]);
    const result = await getBookingsService();

    expect(Booking.find).toHaveBeenCalledTimes(1);
    expect(populateMock1).toHaveBeenCalledWith('user_id');
    expect(populateMock2).toHaveBeenCalledWith('room_id');
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(0);
  });

  it('should handle bookings with missing user_id or room_id (edge case)', async () => {
    populateMock2.mockReturnValue([
      {
        _id: 'booking3',
        user_id: null,
        room_id: { _id: 'room3', name: 'Small Room' },
        date: '2024-06-03',
        start_time: '13:00',
        end_time: '14:00',
        purpose: 'Interview',
      },
      {
        _id: 'booking4',
        user_id: { _id: 'user4', name: 'Charlie' },
        room_id: null,
        date: '2024-06-04',
        start_time: '15:00',
        end_time: '16:00',
        purpose: 'Workshop',
      },
    ]);
    const result = await getBookingsService();

    expect(Booking.find).toHaveBeenCalledTimes(1);
    expect(populateMock1).toHaveBeenCalledWith('user_id');
    expect(populateMock2).toHaveBeenCalledWith('room_id');
    expect(result).toHaveLength(2);
    expect(result[0].user_id).toBeNull();
    expect(result[1].room_id).toBeNull();
  });

  it('should propagate errors thrown by Booking.find (edge case)', async () => {
    findMock.mockImplementation(() => {
      throw new Error('Database failure');
    });

    await expect(getBookingsService()).rejects.toThrow('Database failure');
    expect(Booking.find).toHaveBeenCalledTimes(1);
  });

  it('should propagate errors thrown by populate (edge case)', async () => {
    populateMock1.mockImplementation(() => {
      throw new Error('Populate failed');
    });

    await expect(getBookingsService()).rejects.toThrow('Populate failed');
    expect(Booking.find).toHaveBeenCalledTimes(1);
    expect(populateMock1).toHaveBeenCalledWith('user_id');
  });

  it('should propagate errors thrown by second populate (edge case)', async () => {
    populateMock2.mockImplementation(() => {
      throw new Error('Second populate failed');
    });

    await expect(getBookingsService()).rejects.toThrow('Second populate failed');
    expect(Booking.find).toHaveBeenCalledTimes(1);
    expect(populateMock1).toHaveBeenCalledWith('user_id');
    expect(populateMock2).toHaveBeenCalledWith('room_id');
  });
});