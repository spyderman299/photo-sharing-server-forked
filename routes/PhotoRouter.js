const express = require("express");
const Photo = require("../db/photoModel");
const router = express.Router();

// API: Lấy toàn bộ ảnh và bình luận của 1 user
router.get("/photosOfUser/:id", async (request, response) => {
  const userId = request.params.id;
  try {
    // Tìm ảnh dựa vào user_id
    const photos = await Photo.find({ user_id: userId })
      // Khúc "ăn tiền" nhất đây: Dùng populate để tra cứu tên người đã viết bình luận
      .populate({
        path: "comments.user_id",
        select: "_id first_name last_name"
      })
      .lean();

    if (!photos || photos.length === 0) {
      return response.status(400).send("Không có ảnh hoặc ID không hợp lệ!");
    }
    
    response.status(200).json(photos);
  } catch (error) {
    response.status(400).send("Lỗi lấy dữ liệu ảnh!");
  }
});

module.exports = router;