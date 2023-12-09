import { Tag } from '../models/tag.js';
import { Clip } from '../models/clip.js';
import { Paper } from '../models/paper.js';
import { User } from '../models/user.js';
import { PaperComment } from '../models/paperComment.js';

const getComments = async (req, res) => {
  try {
    const paper = await Paper.findByPk(req.params.id);
    if (!paper)
      return res.status(404).json({ message: "Paper not found" });

    const comments = await PaperComment.findAll({
      where: {
        paperId: paper.id,
      }
    });
    return res.json(comments);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
}

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