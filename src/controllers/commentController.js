import { Paper } from '../models/paper.js';
import { User } from '../models/user.js';
import { PaperComment } from '../models/paperComment.js';
import { page_limit } from '../utils/config.js';
import { Op } from 'sequelize';

// GET /paper/:id/comments
const getComments = async (req, res) => {
  let cursor = req.query.cursor;
  const limit = Number(req.query.limit || page_limit);
  const paperId = req.params.id;

  if (!paperId) {
    return res.status(400).json({ message: "Missing paperId in query" });
  }

  if (isNaN(limit) || limit < 1) {
    return res.status(400).json({ message: "Invalid limit value" });
  }

  // If there's no cursor provided, use a very early date
  if (!cursor) {
    cursor = new Date('1970-01-01').toISOString();
  } else if (isNaN(new Date(cursor))) {
    return res.status(400).json({ message: "Invalid cursor format" });
  }

  try {
    const paper = await Paper.findByPk(paperId);
    if (!paper) {
      return res.status(404).json({ message: "Paper not found" });
    }

    const comments = await PaperComment.findAll({
      where: {
        paperId: paper.id,
        createdAt: {
          [Op.gt]: new Date(cursor)
        }
      },
      limit,
      order: [['createdAt', 'ASC']] // Ascending order
    });

    let nextCursor = comments.length === limit ? comments[comments.length - 1].createdAt.toISOString() : null;

    res.json({
      data: comments,
      cursor: nextCursor
    });
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