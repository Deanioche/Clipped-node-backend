import express from 'express';
import { me, findUserById, updateMe } from '../controllers/userController.js';
import { User } from '../models/user.js';
import { addFollow, deleteFollow, findFollowers, findFollowings } from '../controllers/followController.js';
import authenticateJWT from '../utils/authenticateJWT.js';
import authBeforeName from '../utils/authBeforeName.js';

const router = express.Router();

// for test
// return all users
router.get('/', authBeforeName, (req, res) => {
  User.findAll().then((users) => {
    users.forEach((user) => {
      console.log({
        id: user.id,
        name: user.name,
        email: user.email,
        login: user.login
      });
    });
    res.json(users)
  });
});

router.get('/me', authenticateJWT, me);
router.patch('/me', authBeforeName, updateMe);
router.get('/:id/following', authenticateJWT, findFollowings);
router.get('/:id/follower', authenticateJWT, findFollowers);
router.post('/:id/follow', authenticateJWT, addFollow);
router.delete('/:id/follow', authenticateJWT, deleteFollow);

router.get('/:id', authenticateJWT, findUserById);

export default router;
