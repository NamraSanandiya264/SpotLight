import Notice from "./notice.model.js";

// @desc    Get all active, unexpired notices
// @route   GET /api/notices
export const getNotices = async (req, res) => {
  try {
    const currentDate = new Date();

    // Fetch notices that haven't expired
    const notices = await Notice.find({
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: null },
        { expiresAt: { $gt: currentDate } }
      ]
    })
      .sort({ createdAt: -1 })
      .populate("author", "name email");

    res.status(200).json({ success: true, notices });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new notice (Publishes immediately)
// @route   POST /api/notices
export const createNotice = async (req, res) => {
  try {
    if (req.user.role !== "sbg_core") {
      return res.status(403).json({ success: false, message: "Unauthorized." });
    }

    const { title, content, expiresAt } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: "Title and content are required." });
    }

    const newNotice = await Notice.create({
      title,
      content,
      author: req.user._id || req.user.id,
      isActive: true, // Always true now
      expiresAt: expiresAt ? new Date(expiresAt) : undefined
    });

    res.status(201).json({ success: true, notice: newNotice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a notice
// @route   DELETE /api/notices/:id
export const deleteNotice = async (req, res) => {
  try {
    if (req.user.role !== "sbg_core") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const notice = await Notice.findByIdAndDelete(req.params.id);
    
    if (!notice) {
      return res.status(404).json({ success: false, message: "Notice not found" });
    }

    res.status(200).json({ success: true, message: "Notice deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};