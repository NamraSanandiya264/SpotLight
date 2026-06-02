import Notice from "./notice.model.js";

// 📢 A. Get all active notices for the Frontend Feed
export const getActiveNotices = async (req, res) => {
  try {
    // Fetch notices where isActive is true and it hasn't expired yet
    const today = new Date();
    
    const notices = await Notice.find({
      isActive: true,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: today } }
      ]
    }).sort({ createdAt: -1 }); // Newest notices appear at the top

    res.status(200).json({ success: true, notices });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 📢 B. Post a New Notice (Restricted to SBG / Authorized Leaders)
export const createNotice = async (req, res) => {
  try {
    const { title, content, postedBy, durationDays } = req.body;

    if (!title?.trim() || !content?.trim()) {
      return res.status(400).json({ success: false, message: "Title and Content are required." });
    }

    let expiresAt;
    if (durationDays) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + Number(durationDays));
    }

    const notice = await Notice.create({
      title,
      content,
      postedBy: postedBy || "SBG Core",
      expiresAt
    });

    res.status(201).json({ success: true, message: "Notice posted to board successfully!", notice });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};