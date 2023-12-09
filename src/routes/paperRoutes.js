import express from 'express';
import { Paper } from '../models/paper.js';
import { createComment, createLike, createPaper, createPaperClip, deleteLike, deletePaper, deletePaperClip, findPaperByAuthorId, findPaperById, publishPaper, updatePaper } from '../controllers/paperController.js';

const router = express.Router();

/**
 * @TESTF
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
router.patch('/:id/comment/:id', updateComment);
router.delete('/:id/comment/:id', deleteComment);

router.get('/:id', findPaperById);
router.patch('/:id', updatePaper);
router.delete('/:id', deletePaper);

export default router;
