const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const Photo = require("../db/photoModel");
const { requireLogin } = require("../lib/auth");

const router = express.Router();

const IMAGES_DIR = path.join(__dirname, "..", "images");

// Multer: save uploads into the images dir under a unique generated name.
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, IMAGES_DIR),
  filename: (req, file, cb) => {
    const unique = crypto.randomBytes(16).toString("hex");
    const ext = path.extname(file.originalname) || ".jpg";
    cb(null, `U${Date.now()}_${unique}${ext}`);
  },
});
const upload = multer({ storage });

// Build the clean API shape for a single photo (comments expose `user`, not `user_id`).
function shapePhoto(p) {
  return {
    _id: p._id,
    user_id: p.user_id,
    file_name: p.file_name,
    date_time: p.date_time,
    comments: (p.comments || []).map((c) => ({
      _id: c._id,
      comment: c.comment,
      date_time: c.date_time,
      user: c.user_id
        ? {
            _id: c.user_id._id,
            first_name: c.user_id.first_name,
            last_name: c.user_id.last_name,
          }
        : null,
    })),
  };
}

// GET /photosOfUser/:id -> all photos of a user with populated comment authors.
router.get("/photosOfUser/:id", requireLogin, async (request, response) => {
  const userId = request.params.id;
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return response.status(400).send("Invalid user id.");
  }
  try {
    const photos = await Photo.find({ user_id: userId })
      .populate({ path: "comments.user_id", select: "_id first_name last_name" })
      .lean();
    // A valid user with no photos returns [] (not an error).
    return response.status(200).json(photos.map(shapePhoto));
  } catch (error) {
    return response.status(400).send("Could not fetch photos.");
  }
});

// POST /commentsOfPhoto/:photo_id -> add a comment by the logged-in user.
// Body: { comment }
router.post("/commentsOfPhoto/:photo_id", requireLogin, async (request, response) => {
  const photoId = request.params.photo_id;
  const { comment } = request.body;

  if (!comment || comment.trim() === "") {
    return response.status(400).send("Comment must not be empty.");
  }
  if (!mongoose.Types.ObjectId.isValid(photoId)) {
    return response.status(400).send("Invalid photo id.");
  }

  try {
    const photo = await Photo.findById(photoId);
    if (!photo) {
      return response.status(400).send("Photo not found.");
    }
    photo.comments.push({
      comment: comment,
      date_time: new Date(),
      user_id: request.user._id,
    });
    await photo.save();

    // Return the updated photo (with populated authors) so the UI can refresh.
    const updated = await Photo.findById(photoId)
      .populate({ path: "comments.user_id", select: "_id first_name last_name" })
      .lean();
    return response.status(200).json(shapePhoto(updated));
  } catch (error) {
    return response.status(400).send("Could not add comment.");
  }
});

// POST /photos/new -> upload a new photo for the logged-in user.
// The file must be sent as multipart/form-data under the field "uploadedphoto".
router.post(
  "/photos/new",
  requireLogin,
  upload.single("uploadedphoto"),
  async (request, response) => {
    if (!request.file) {
      return response.status(400).send("No photo file in the request.");
    }
    try {
      const photo = await Photo.create({
        file_name: request.file.filename,
        date_time: new Date(),
        user_id: request.user._id,
        comments: [],
      });
      return response.status(200).json({
        _id: photo._id,
        user_id: photo.user_id,
        file_name: photo.file_name,
        date_time: photo.date_time,
        comments: [],
      });
    } catch (error) {
      return response.status(400).send("Could not save photo.");
    }
  }
);

module.exports = router;
