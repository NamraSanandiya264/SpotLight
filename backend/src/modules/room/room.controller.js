import Room from "./room.model.js";

// ✅ Create Room
export const createRoom = async (req, res) => {
  try {
    const { name , capacity} = req.body;

    const existingRoom = await Room.findOne({ name });

    if (existingRoom) {
     return res.status(400).json({
     success: false,
     message: "Room already exists",
  });
}


    if (!name || !capacity) {
      return res.status(400).json({
      success: false,
      message: "Name and capacity are required",
  });
}

    const room = new Room({
      name,
      capacity,
    });

    await room.save();

    res.status(201).json({
      success: true,
      message: "Room created successfully",
      data: room,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating room",
      error: error.message,
    });
  }
};

// ✅ Get All Rooms
export const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find().lean();

    res.status(200).json({
      success: true,
      count: rooms.length,
      data: rooms,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching rooms",
      error: error.message,
    });
  }
};

// ✅ Get Single Room
export const getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    res.status(200).json({
      success: true,
      data: room,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching room",
      error: error.message,
    });
  }
};

// ✅ Update Room
export const updateRoom = async (req, res) => {
  try {
    const { name, capacity} = req.body;

    // ✅ Validation
    if (!name && !capacity) {
      return res.status(400).json({
        success: false,
        message: "At least one field (name or capacity) is required",
      });
    }

    const room = await Room.findByIdAndUpdate(
      req.params.id,
      { name, capacity }, // ✅ only allowed fields
      { new: true }
    );

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Room updated successfully",
      data: room,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating room",
      error: error.message,
    });
  }
};
// ✅ Delete Room
export const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Room deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting room",
      error: error.message,
    });
  }
};