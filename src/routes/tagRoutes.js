import express from 'express';
import { createTag, getTagsByUserId, updateTag } from '../controllers/tagController.js';

const router = express.Router();

router.get('/', getTagsByUserId);
router.post('/', createTag);
router.patch('/:id', updateTag);

export default router;
