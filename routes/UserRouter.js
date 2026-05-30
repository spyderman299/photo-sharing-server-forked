const express = require("express");
const mongoose = require("mongoose");
const User = require("../db/userModel");
const { requireLogin } = require("../lib/auth");

const router = express.Router();

// POST /user  -> Register a new user (Problem 4). PUBLIC (no login required).
// Body: { login_name, password, first_name, last_name, location, description, occupation }
router.post("/", async (request, response) => {
  const {
    login_name,
    password,
    first_name,
    last_name,
    location,
    description,
    occupation,
  } = request.body;

  if (!login_name || login_name.trim() === "") {
    return response.status(400).send("login_name is required.");
  }
  if (!password || password.trim() === "") {
    return response.status(400).send("password must not be empty.");
  }
  if (!first_name || first_name.trim() === "") {
    return response.status(400).send("first_name must not be empty.");
  }
  if (!last_name || last_name.trim() === "") {
    return response.status(400).send("last_name must not be empty.");
  }

  try {
    const existing = await User.findOne({ login_name });
    if (existing) {
      return response
        .status(400)
        .send("That login name is already taken. Please choose another.");
    }

    const newUser = await User.create({
      login_name,
      password,
      first_name,
      last_name,
      location: location || "",
      description: description || "",
      occupation: occupation || "",
    });

    // Return only what the app needs (tests require login_name).
    return response.status(200).json({
      _id: newUser._id,
      login_name: newUser.login_name,
      first_name: newUser.first_name,
    });
  } catch (error) {
    return response.status(400).send("Registration failed.");
  }
});

// GET /user/list -> Sidebar list. Only _id, first_name, last_name. PROTECTED.
router.get("/list", requireLogin, async (request, response) => {
  try {
    const users = await User.find({}, "_id first_name last_name").lean();
    return response.status(200).json(users);
  } catch (error) {
    return response.status(500).send("Server error.");
  }
});

// GET /user/:id -> Detail view fields (no password, no login_name). PROTECTED.
router.get("/:id", requireLogin, async (request, response) => {
  const userId = request.params.id;
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return response.status(400).send("Invalid user id.");
  }
  try {
    const user = await User.findById(
      userId,
      "_id first_name last_name location description occupation"
    ).lean();
    if (!user) {
      return response.status(400).send("User not found.");
    }
    return response.status(200).json(user);
  } catch (error) {
    return response.status(400).send("Invalid user id.");
  }
});

module.exports = router;
