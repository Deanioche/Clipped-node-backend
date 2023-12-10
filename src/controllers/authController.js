import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { Op } from "sequelize"

import { User } from "../models/user.js"

let refreshTokens = [];

// POST /auth/login
const login = async (req, res) => {
  const { login, password } = req.body;

  const user = await User.findOne({ where: { login } });
  if (!user)
    return res.status(404).json({ message: "User not found" });
  const isPasswordCorrect = bcrypt.compareSync(password, user.password);
  if (!isPasswordCorrect)
    return res.status(400).json({ message: "Invalid credentials" });

  const accessToken = jwt.sign({ id: user.id }, process.env.JWT_AT_SECRET, { expiresIn: process.env.JWT_AT_EXPIRES_IN });
  const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_RT_SECRET, { expiresIn: process.env.JWT_RT_EXPIRES_IN });
  refreshTokens.push(refreshToken);
  res.json({ accessToken, refreshToken });
}

// POST /auth/signup
const signup = async (req, res) => {
  const { name, email, login, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);

  const existingUser = await User.findOne({
    where: {
      [Op.or]: [
        { email: email },
        { login: login }
      ]
    }
  });
  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  const user = await User.create({ name, email, login, password: hashedPassword });
  const accessToken = jwt.sign({ id: user.id }, process.env.JWT_AT_SECRET, { expiresIn: process.env.JWT_AT_EXPIRES_IN });
  const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_RT_SECRET, { expiresIn: process.env.JWT_RT_EXPIRES_IN });
  refreshTokens.push(refreshToken);
  res.json({
    accessToken,
    refreshToken,
  });
}

// POST /auth/token
const token = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token is required" });
  }

  if (!refreshTokens.includes(refreshToken)) {
    return res.status(403).json({ message: "Refresh token is not valid" });
  }

  jwt.verify(refreshToken, process.env.JWT_RT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    const accessToken = jwt.sign({ id: user.id }, process.env.JWT_AT_SECRET, { expiresIn: process.env.JWT_AT_EXPIRES_IN });
    res.json({ accessToken });
  });
}

export { login, signup, token }