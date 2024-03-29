import jwt from 'jsonwebtoken';
import { config } from 'dotenv';

config();

const authBeforeName = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.JWT_AT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ message: "Access token is not valid or expired" });
      }
      req.user = user;
      next();
    });
  } else {
    res.status(401).send({ message: "Access token is required" });
  }
};

export default authBeforeName;
