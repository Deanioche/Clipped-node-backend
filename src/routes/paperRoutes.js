import express from 'express';
import { Paper } from '../models/paper.js';
import { createLike, createPaper, createPaperClip, deleteLike, deletePaper, deletePaperByIds, deletePaperClip, findPaperByAuthorId, findPaperById, publishPaper, updatePaper } from '../controllers/paperController.js';
import { createComment, deleteComment, getComments, updateComment } from '../controllers/commentController.js';

const router = express.Router();

/**
 * @TEST
*/
router.get('/all', async (req, res) => {
  try {
    const papers = await Paper.findAll();
    papers.sort((a, b) => b.createdAt - a.createdAt);
    res.json(papers);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
});

router.get('/', findPaperByAuthorId);
router.post('/', createPaper);
router.delete('/', deletePaperByIds);

// @TODO
router.delete('/', (req, res) => {
  res.status(405).json({ message: "send ids" });
});

router.patch('/:id/publish', publishPaper);

// @TODO
router.post('/:id/like', createLike);
router.delete('/:id/like', deleteLike);

// @TODO
router.post('/:id/clip', createPaperClip);
router.delete('/:id/clip', deletePaperClip);

// @TODO: 4 apis for comment 
router.get('/:id/comment', getComments);
router.post('/:id/comment', createComment);
router.patch('/:paperId/comment/:commentId', updateComment);
router.delete('/:paperId/comment/:commentId', deleteComment);

router.get('/:id', findPaperById);
router.patch('/:id', updatePaper);
router.delete('/:id', deletePaper);

export default router;
