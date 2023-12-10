import express from 'express';
import { Tag } from '../models/tag.js';

const router = express.Router();

// get http GET /tag?userId=xxx
router.get('/', async (req, res) => {
  try {
    const tags = await Tag.findAll({
      where: {
        userId: req.user.id,
      }
    });
    res.json(tags);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
});

router.post('/', async (req, res) => {
  try {
    const color = req.body.color;
    if (!color) {
      return res.status(400).json({ message: "color is missing" });
    }

    const name = req.body.name;
    if (!name) {
      return res.status(400).json({ message: "name is missing" });
    }

    const tag = await Tag.create({ color, name, userId: req.user.id });
    res.json(tag);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const tag = await Tag.findByPk(req.params.id);
    if (!tag)
      return res.status(404).json({ message: "Tag not found" });

    if (tag.userId !== req.user.id)
      return res.status(403).json({ message: "Forbidden" });

    const color = req.body.color;
    if (!color) {
      return res.status(400).json({ message: "color is missing" });
    }

    const name = req.body.name;
    if (!name) {
      return res.status(400).json({ message: "name is missing" });
    }

    await tag.update({ color, name });
    res.json(tag);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
});

export default router;
