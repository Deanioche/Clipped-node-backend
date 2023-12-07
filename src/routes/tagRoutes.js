import express from 'express';
import { Tag } from '../models/tag.js';

const router = express.Router();

// get http GET /tag?userId=xxx
router.get('/', async (req, res) => {
  if (!req.query.userId) {
    return res.status(400).json({ message: "userId is missing" });
  }
  const tags = await Tag.findAll({ where: { userId: req.query.userId } });
  res.json(tags);
});

router.post('/', async (req, res) => {
  console.log(req.body);
  const tag = await Tag.create({...req.body, userId: req.user.id});
  res.send('POST /tag' + JSON.stringify(tag));
});

router.patch('/:id', (req, res) => {
  console.log(req.params);
  console.log(req.body);
  res.send('PATCH /tag');
});

export default router;
