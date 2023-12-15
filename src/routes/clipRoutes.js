import express from 'express';
import { Tag } from '../models/tag.js';
import { Clip } from '../models/clip.js';
import {
  createClip, 
  findClipById, 
  findClipsByFilter, 
  updateClip, 
  deleteClip,
  publishClip,
  likeClip,
  unlikeClip
} from '../controllers/clipController.js';

const router = express.Router();

router.get('/', findClipsByFilter);
router.get('/:id', findClipById);
router.post('/', createClip);
router.patch('/:id', updateClip);
router.delete('/:id', deleteClip);
router.patch('/:id/publish', publishClip);
router.post('/:id/like', likeClip);
router.delete('/:id/like', unlikeClip);

export default router;
