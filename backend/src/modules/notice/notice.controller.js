import Notice from "./notice.model.js";

// Get all active, unexpired notices (latest first)
// @access  Public or Protected
export const getNotices = async (req, res) => {
  try {
    const currentDate = new Date();

    // Fetch notices that are active AND (have no expiration date OR haven't expired yet)
    const notices = await Notice.find({
      isActive: true,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: null },
        { expiresAt: { $gt: currentDate } }
      ]
    })
      .sort({ createdAt: -1 }) // Newest first
      .populate("author", "name email");

    res.status(200).json({ success: true, notices });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create a new notice
// @route   POST /api/notices
// @access Protected (SBG Core Only)
export const createNotice = async (req, res) => {
  try {
    // Security check: Only SBG Core can publish notices
    if (req.user.role !== "sbg_core") {
      return res.status(403).json({ success: false, message: "Unauthorized. SBG Core only." });
    }

    const { title, content, isActive, expiresAt } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: "Title and content are required." });
    }

    const newNotice = await Notice.create({
      title,
      content,
      author: req.user._id || req.user.id,
      isActive: isActive !== undefined ? isActive : true,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined
    });

    res.status(201).json({ success: true, notice: newNotice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};