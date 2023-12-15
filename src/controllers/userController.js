import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { Op } from "sequelize"

import { User } from "../models/user.js"

let refreshTokens = [];

const me = async (req, res) => {
  const user = await User.findByPk(req.user.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  res.json(user);
}

const findUserById = async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  res.json(user);
}

const updateMe = async (req, res) => {
  if (Object.values(req.body).length === 0) {
    return res.status(400).json({ message: "Request body is missing" });
  }
  const user = await User.findByPk(req.user.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (req.body.email) {
    const userWithEmail = await User.findOne({
      where: {
        email: req.body.email,
        id: { [Op.ne]: req.user.id }
      }
    });
    if (userWithEmail) {
      return res.status(400).json({ message: "Email is already taken" });
    }
  }
  res.json(await user.update(req.body));
}

export { me, findUserById, updateMe }