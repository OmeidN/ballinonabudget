import express from "express";
import User from "../db/models/User";
import {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
} from "../utils/auth";

const router = express.Router();

// ✅ POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password || password.length < 6) {
      return res
        .status(400)
        .json({ message: "Email and password required (min 6 chars)." });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already registered." });
    }

    const passwordHash = await hashPassword(password);
    const user = await User.create({ email, passwordHash });

    const token = generateToken(String(user._id));

    res.json({ token, user: user.toJSON() });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "Server error." });
  }
});

// ✅ POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: "Invalid credentials." });

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials." });

    const token = generateToken(String(user._id));

    res.json({ token, user: user.toJSON() });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error." });
  }
});

// ✅ GET /api/auth/me
router.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    const { userId } = verifyToken(token);

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ user: user.toJSON() });
  } catch (err) {
    console.error("Get /me error:", err);
    res.status(401).json({ message: "Unauthorized" });
  }
});

export default router;
