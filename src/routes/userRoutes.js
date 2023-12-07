import express from 'express';
import { me, findUserById, updateMe } from '../controllers/userController.js';
import { User } from '../models/user.js';
import { addFollow, deleteFollow, findFollowers, findFollowings } from '../controllers/followController.js';

const router = express.Router();


// for test
router.get('/', (req, res) => {
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

router.get('/me', me);
router.patch('/me', updateMe);
router.get('/:id/following', findFollowings);
router.get('/:id/follower', findFollowers);
router.post('/:id/follow', addFollow);
router.delete('/:id/follow', deleteFollow);

router.get('/:id', findUserById);

export default router;
