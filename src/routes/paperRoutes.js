import express from 'express';

const router = express.Router();

router.get('/me', me);
router.patch('/me', updateMe);
router.get('/:id/following', findFollowings);
router.get('/:id/follower', findFollowers);
router.post('/:id/follow', addFollow);
router.delete('/:id/follow', deleteFollow);

router.get('/:id', findUserById);

export default router;
