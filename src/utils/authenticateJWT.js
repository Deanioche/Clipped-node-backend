import jwt from 'jsonwebtoken';
import { config } from 'dotenv';
import { User } from '../models/user.js';

config();

const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.JWT_AT_SECRET, async (err, user) => {
      if (err) {
        return res.status(403).json({ message: "Access token is not valid or expired" });
      }
      req.user = user;

      const userData = await User.findByPk(req.user.id);
      if (!userData)
        return res.status(404).json({ message: "User not found" });
      if (!(userData.username))
        return res.status(404).json({ message: "no username" });
      next();
    });
  } else {
    res.status(401).send({ message: "Access token is required" });
  }
};

export default authenticateJWT;