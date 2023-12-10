import { Tag } from '../models/tag.js';
import { Paper } from '../models/paper.js';
import { User } from '../models/user.js';
import { PaperComment } from '../models/paperComment.js';
import { page_limit } from '../utils/config.js';

// GET /paper/:id/comments
const getComments = async (req, res) => {
  const { page = 1, limit = page_limit } = req.query;

  if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
    return res.status(400).json({ message: "Invalid query" });
  }

  try {
    const paper = await Paper.findByPk(req.params.id);
    if (!paper)
      return res.status(404).json({ message: "Paper not found" });

    const comments = await PaperComment.findAll({
      where: {
        paperId: paper.id,
      }
    });

    // sort asc
    comments.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    // pagination
    const offset = (page - 1) * limit;
    return res.json(comments.slice(offset, offset + limit));
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
}

// POST /paper/:id/comments
const createComment = async (req, res) => {
  try {
    const paper = await Paper.findByPk(req.params.id);
    if (!paper)
      return res.status(404).json({ message: "Paper not found" });

    const user = await User.findByPk(req.user.id);
    if (!user)
      return res.status(404).json({ message: "User not found" });

    const comment = await PaperComment.create({
      content: req.body.content,
      paperId: paper.id,
      userId: user.id,
    });
    return res.json(comment);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
}


// PUT /paper/:paperId/comments/:commentId
const updateComment = async (req, res) => {
  try {
    const paper = await Paper.findByPk(req.params.paperId);
    if (!paper)
      return res.status(404).json({ message: "Paper not found" });

    const user = await User.findByPk(req.user.id);
    if (!user)
      return res.status(404).json({ message: "User not found" });

    const comment = await PaperComment.findByPk(req.params.commentId);
    if (!comment)
      return res.status(404).json({ message: "Comment not found" });

    if (comment.userId !== user.id)
      return res.status(403).json({ message: "Forbidden" });

    const newComment = await comment.update(req.body);
    return res.json(newComment);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
}

// DELETE /paper/:paperId/comments/:commentId
const deleteComment = async (req, res) => {
  try {
    const paper = await Paper.findByPk(req.params.paperId);
    if (!paper)
      return res.status(404).json({ message: "Paper not found" });

    const user = await User.findByPk(req.user.id);
    if (!user)
      return res.status(404).json({ message: "User not found" });

    const comment = await PaperComment.findByPk(req.params.commentId);
    if (!comment)
      return res.status(404).json({ message: "Comment not found" });

    if (comment.userId !== user.id)
      return res.status(403).json({ message: "Forbidden" });

    await comment.destroy();
    return res.json({ message: "Comment deleted" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
}

export {
  getComments,
  createComment,
  updateComment,
  deleteComment,
};