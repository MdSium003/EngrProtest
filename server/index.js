// server/index.js
require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const pool = require("./db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --- Image Upload Setup (Multer) ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// --- Admin Auth Routes ---
// Admin Registration (for setup)
app.post("/api/admin/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const newAdmin = await pool.query(
      "INSERT INTO admins (username, password_hash) VALUES ($1, $2) RETURNING *",
      [username, passwordHash]
    );
    res.json(newAdmin.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Admin Login
app.post("/api/admin/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await pool.query("SELECT * FROM admins WHERE username = $1", [
      username,
    ]);
    if (admin.rows.length === 0) {
      return res.status(401).json("Invalid credentials");
    }
    const validPassword = await bcrypt.compare(
      password,
      admin.rows[0].password_hash
    );
    if (!validPassword) {
      return res.status(401).json("Invalid credentials");
    }
    const token = jwt.sign({ id: admin.rows[0].id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ token });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// --- Auth Middleware ---
const auth = (req, res, next) => {
  const token = req.header("x-auth-token");
  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (e) {
    res.status(400).json({ msg: "Token is not valid" });
  }
};

// --- Facebook Post Routes ---
app.post("/api/posts", async (req, res) => {
  try {
    const { facebook_link } = req.body;
    const newPost = await pool.query(
      "INSERT INTO posts (facebook_link) VALUES ($1) RETURNING *",
      [facebook_link]
    );
    res.json(newPost.rows[0]);
  } catch (err) {
    console.error(err.message);
  }
});

app.get("/api/posts", async (req, res) => {
  try {
    const allPosts = await pool.query(
      "SELECT * FROM posts WHERE approved = TRUE ORDER BY id DESC"
    );
    res.json(allPosts.rows);
  } catch (err) {
    console.error(err.message);
  }
});

app.get("/api/posts/pending", auth, async (req, res) => {
  try {
    const pendingPosts = await pool.query(
      "SELECT * FROM posts WHERE approved = FALSE ORDER BY id DESC"
    );
    res.json(pendingPosts.rows);
  } catch (err) {
    console.error(err.message);
  }
});

app.put("/api/posts/approve/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("UPDATE posts SET approved = TRUE WHERE id = $1", [id]);
    res.json("Post approved");
  } catch (err) {
    console.error(err.message);
  }
});

// --- Image Routes ---
app.post("/api/images", auth, upload.single("image"), async (req, res) => {
  try {
    const { caption, image_url } = req.body;
    let imageUrl = image_url;
    if (!imageUrl) {
      if (!req.file) {
        return res.status(400).json({ error: "Provide image_url or upload an image file" });
      }
      imageUrl = `/uploads/${req.file.filename}`;
    }
    const newImage = await pool.query(
      "INSERT INTO images (image_url, caption) VALUES ($1, $2) RETURNING *",
      [imageUrl, caption]
    );
    res.json(newImage.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to save image" });
  }
});

app.get("/api/images", async (req, res) => {
  try {
    const allImages = await pool.query("SELECT * FROM images ORDER BY id DESC");
    res.json(allImages.rows);
  } catch (err) {
    console.error(err.message);
  }
});

// --- Video Routes ---
app.post("/api/videos", auth, async (req, res) => {
  try {
    const { video_url, title } = req.body;
    const newVideo = await pool.query(
      "INSERT INTO videos (video_url, title) VALUES ($1, $2) RETURNING *",
      [video_url, title]
    );
    res.json(newVideo.rows[0]);
  } catch (err) {
    console.error(err.message);
  }
});

app.get("/api/videos", async (req, res) => {
  try {
    const allVideos = await pool.query("SELECT * FROM videos ORDER BY id DESC");
    res.json(allVideos.rows);
  } catch (err) {
    console.error(err.message);
  }
});

// --- Injured People Routes ---
app.post("/api/injured", upload.single("picture"), async (req, res) => {
  try {
    const { name, details } = req.body;
    const pictureUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const newEntry = await pool.query(
      "INSERT INTO injured (name, details, picture_url) VALUES ($1, $2, $3) RETURNING *",
      [name, details, pictureUrl]
    );
    res.json(newEntry.rows[0]);
  } catch (err) {
    console.error(err.message);
  }
});

app.get("/api/injured", async (req, res) => {
  try {
    const allInjured = await pool.query(
      "SELECT * FROM injured WHERE approved = TRUE ORDER BY id DESC"
    );
    res.json(allInjured.rows);
  } catch (err) {
    console.error(err.message);
  }
});

app.get("/api/injured/pending", auth, async (req, res) => {
  try {
    const pendingInjured = await pool.query(
      "SELECT * FROM injured WHERE approved = FALSE ORDER BY id DESC"
    );
    res.json(pendingInjured.rows);
  } catch (err) {
    console.error(err.message);
  }
});

app.put("/api/injured/approve/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("UPDATE injured SET approved = TRUE WHERE id = $1", [id]);
    res.json("Injured person's entry approved");
  } catch (err) {
    console.error(err.message);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
