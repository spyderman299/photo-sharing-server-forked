const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const dbConnect = require("./db/dbConnect");
const UserRouter = require("./routes/UserRouter");
const PhotoRouter = require("./routes/PhotoRouter");
const AdminRouter = require("./routes/AdminRouter");
const SchemaInfo = require("./db/schemaInfo");

const app = express();

dbConnect();

app.use(cors());
app.use(express.json());

// Serve photos (seed images + uploaded ones) from the images directory.
app.use("/images", express.static(path.join(__dirname, "images")));

app.get("/", (request, response) => {
  response.send({ message: "Hello from photo-sharing app API!" });
});

// PUBLIC test endpoint.
app.get("/test/info", async (request, response) => {
  try {
    const info = await SchemaInfo.findOne({}).lean();
    return response.status(200).json(info || {});
  } catch (error) {
    return response.status(500).send("Server error.");
  }
});

// PUBLIC auth endpoints (login / logout do their own checks).
app.use("/admin", AdminRouter);

// Routers. Registration (POST /user) inside UserRouter is public; the GET
// routes there and everything in PhotoRouter are protected per-route with
// the requireLogin middleware (returns 401 when not logged in).
app.use("/user", UserRouter);
app.use("/", PhotoRouter);

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`server listening on port ${PORT}`);
});
