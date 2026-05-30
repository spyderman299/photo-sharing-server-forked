const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  // Identifier the user types when logging in (Final Project - Problem 1)
  login_name: { type: String },
  // Password for the account (Final Project - Problem 4).
  // NOTE: stored as plain text because the assignment asks for a string field
  // that "stores the password". In a real app this MUST be hashed (e.g. bcrypt).
  password: { type: String },
  first_name: { type: String },
  last_name: { type: String },
  location: { type: String },
  description: { type: String },
  occupation: { type: String },
});

module.exports = mongoose.models.Users || mongoose.model("Users", userSchema);
