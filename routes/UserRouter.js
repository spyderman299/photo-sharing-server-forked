const express = require("express");
const User = require("../db/userModel");
const router = express.Router();

// API 1: Lấy danh sách người dùng (Chỉ lấy ID, Tên, Họ để làm thanh Menu)
router.get("/list", async (request, response) => {
  try {
    const users = await User.find({}).lean();
    response.status(200).json(users);
  } catch (error) {
    response.status(500).send("Lỗi Server");
  }
});

// API 2: Lấy chi tiết thông tin của 1 người dùng dựa vào ID
router.get("/:id", async (request, response) => {
  const userId = request.params.id;
  try {
    const user = await User.findById(userId).lean();
    if (!user) {
      return response.status(400).send("Không tìm thấy người dùng!");
    }
    response.status(200).json(user);
  } catch (error) {
    response.status(400).send("ID không hợp lệ!");
  }
});

module.exports = router;