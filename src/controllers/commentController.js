import { Paper } from '../models/paper.js';
import { User } from '../models/user.js';
import { PaperComment } from '../models/paperComment.js';
import { page_limit } from '../utils/config.js';
import { Op } from 'sequelize';

// GET /paper/:id/comments
const getComments = async (req, res) => {
  const cursor = req.query.cursor;
  const limit = Number(req.query.limit || page_limit);
  const paperId = req.params.id;

  if (!paperId) {
    return res.status(400).json({ message: "Missing paperId in query" });
  }

  if (isNaN(limit) || limit < 1) {
    return res.status(400).json({ message: "Invalid limit value" });
  }

  let whereCondition = { paperId };

  if (cursor) {
    const [cursorDateStr, cursorId] = cursor.split(",");
    const cursorDate = new Date(cursorDateStr);
    if (isNaN(cursorDate)) {
      return res.status(400).json({ message: "Invalid cursor format (date)" });
    }
    if (!validateUuid(cursorId)) {
      return res.status(400).json({ message: "Invalid cursor format (id)" });
    }
    whereCondition = {
      ...whereCondition,
      [Op.or]: [
        { createdAt: { [Op.gt]: cursorDate } },
        {
          [Op.and]: [
            { createdAt: cursorDate },
            { id: { [Op.gt]: cursorId } }
          ]
        }
      ]
    };
  } else {
    whereCondition.createdAt = { [Op.gt]: new Date('1970-01-01') };
  }

  try {
    const paper = await Paper.findByPk(paperId);
    if (!paper) {
      return res.status(404).json({ message: "Paper not found" });
    }

    const comments = await PaperComment.findAll({
      where: whereCondition,
      limit,
      order: [['createdAt', 'ASC'], ['id', 'ASC']],
    });

    let nextCursor = comments.length === limit ? comments[comments.length - 1].createdAt.toISOString() + "," + comments[comments.length - 1].id : null;

    res.json({
      data: comments,
      cursor: nextCursor
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

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