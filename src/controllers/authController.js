import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

import User from "../models/user.js"

/**
 * @param {Request} req 
 * @param {Response} res 
 */
const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email } });
  if (!user) return res.status(404).json({ message: "User not found" });
  const isPasswordCorrect = bcrypt.compareSync(password, user.password);
  if (!isPasswordCorrect) return res.status(400).json({ message: "Invalid credentials" });
  const token = jwt.sign({ id: user.id }, process.env.JWT_AT_SECRET, { expiresIn: process.env.JWT_AT_EXPIRES_IN });
  const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_RT_SECRET, { expiresIn: process.env.JWT_RT_EXPIRES_IN });
  res.json({ token, refreshToken });
}

const signup = async (req, res) => {
  const { name, email, login, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const user = await User.create({ name, email, login, password: hashedPassword });
  const token = jwt.sign({ id: user.id }, process.env.JWT_AT_SECRET, { expiresIn: process.env.JWT_AT_EXPIRES_IN });
  const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_RT_SECRET, { expiresIn: process.env.JWT_RT_EXPIRES_IN });
  res.json({
    token,
    refreshToken,
    user: await User.findOne({ where: { id: user.id } })
  });
}

const token = async (req, res) => {
  const { token } = req.body;
  if (!token || !refreshTokens.includes(token)) {
      return res.sendStatus(403);
  }

  jwt.verify(token, refreshTokenSecret, (err, user) => {
      if (err) return res.sendStatus(403);
      const accessToken = jwt.sign({ username: user.username }, accessTokenSecret, { expiresIn: '20m' });

      res.json({ accessToken });
  });
}

export { login, signup, token }