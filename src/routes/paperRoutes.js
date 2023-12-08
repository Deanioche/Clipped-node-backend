import express from 'express';
import { Paper } from '../models/paper.js';
import { createPaper, deletePaper, findPaperByAuthorId, findPaperById, publishPaper, updatePaper } from '../controllers/paperController.js';

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
router.get('/:id', findPaperById);
router.post('/', createPaper);
router.patch('/:id', updatePaper);
router.patch('/:id/publish', publishPaper);
router.delete('/:id', deletePaper);

export default router;
