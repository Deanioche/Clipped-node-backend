import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { Op, where } from "sequelize"

import { User } from "../models/user.js"
import { validationResult } from "express-validator"

const generateToken = (userId, secret, expiresIn) => {
  return jwt.sign({ id: userId }, secret, { expiresIn });
};

// POST /auth/login
const login = async (req, res) => {
  const { login, password } = req.body;

  try {
    const user = await User.findOne({ where: { login } });
    if (!user)
      return res.status(404).json({ message: "User not found" });

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect)
      return res.status(401).json({ message: "Invalid credentials" });

    const accessToken = generateToken(user.id, process.env.JWT_AT_SECRET, process.env.JWT_AT_EXPIRES_IN);
    const refreshToken = generateToken(user.id, process.env.JWT_RT_SECRET, process.env.JWT_RT_EXPIRES_IN);

    const updatedRes = User.update({ refreshToken }, { where: { id: user.id } });
    if (!updatedRes) {
      throw new Error("Error updating user");
    }

    res.json({ accessToken, refreshToken });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}

// POST /auth/signup
const signup = async (req, res) => {
  const { name, email, login, password } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          { email: email },
          { login: login }
        ]
      }
    });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const user = await User.create({ name, email, login, password: hashedPassword });

    const accessToken = generateToken(user.id, process.env.JWT_AT_SECRET, process.env.JWT_AT_EXPIRES_IN);
    const refreshToken = generateToken(user.id, process.env.JWT_RT_SECRET, process.env.JWT_RT_EXPIRES_IN);

    const updatedRes = User.update({ refreshToken }, { where: { id: user.id } });
    if (!updatedRes) {
      throw new Error("Error updating user");
    }

    res.json({
      accessToken,
      refreshToken,
    });

  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}

// POST /auth/token
const token = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token is required" });
  }

  try {
    const user = await User.findOne({ where: { refreshToken } });
    if (!user) {
      return res.status(403).json({ message: "Refresh token is not valid" });
    }

    const decodedUser = await new Promise((resolve, reject) => {
      jwt.verify(refreshToken, process.env.JWT_RT_SECRET, (err, decoded) => {
        err ? reject(err) : resolve(decoded);
      });
    });

    const accessToken = jwt.sign({ id: decodedUser.id }, process.env.JWT_AT_SECRET, { expiresIn: process.env.JWT_AT_EXPIRES_IN });
    res.json({ accessToken });
  } catch (error) {
    if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
      await User.update({ refreshToken: null }, { where: { id: req.user.id } });
      return res.status(403).json({ message: "Token is invalid" });
    }
    res.status(500).json({ message: "Internal server error" });
  }
}

export { login, signup, token }