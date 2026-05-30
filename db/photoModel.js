const mongoose = require("mongoose");

// Schema cho Comment
const commentSchema = new mongoose.Schema({
  comment: String,
  date_time: { type: Date, default: Date.now },
  // THÊM ref: "Users" VÀO ĐÂY
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
});

// Schema cho Photo
const photoSchema = new mongoose.Schema({
  file_name: { type: String },
  date_time: { type: Date, default: Date.now },
  // THÊM ref: "Users" VÀO ĐÂY
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
  comments: [commentSchema],
});

// Nhớ sửa thành mongoose.models (có chữ s) cho chuẩn nhé ông
const Photo = mongoose.models.Photos || mongoose.model("Photos", photoSchema);

module.exports = Photo;
