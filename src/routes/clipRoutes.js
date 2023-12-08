import express from 'express';
import { Tag } from '../models/tag.js';
import { Clip } from '../models/clip.js';
import { Paper } from '../models/paper.js';
import { createClip, findClipById, findFilteredClips } from '../controllers/clipController.js';

const router = express.Router();

router.get('/', findFilteredClips);
router.get('/:id', findClipById);
router.post('/', createClip);

// PATCH /clip/:id
router.patch('/:id', async (req, res) => {
  try {
    const clip = await Clip.findByPk(req.params.id);
    if (!clip) {
      return res.status(404).json({ message: "Clip not found" });
    }
    if (clip.userId !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }
    await clip.update(req.body);
    res.json(clip);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// PATCH /clip/:id/publish
// DELETE /clip/:id
// POST /clip/:id/like
// DELETE /clip/:id/like

export default router;
