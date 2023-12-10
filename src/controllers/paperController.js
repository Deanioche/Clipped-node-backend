import { Tag } from '../models/tag.js';
import { Clip } from '../models/clip.js';
import { Paper } from '../models/paper.js';
import { User } from '../models/user.js';
import { PaperComment } from '../models/paperComment.js';

const findPaperByAuthorId = async (req, res) => {
  try {
    const papers = await Paper.findAll({
      where: {
        authorId: req.query.authorId,
      }
    });
    res.json(papers);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

const findPaperById = async (req, res) => {
  try {
    const paper = await Paper.findByPk(req.params.id);
    if (!paper) {
      return res.status(404).json({ message: "Paper not found" });
    }
    res.json(paper);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

// POST /paper
const createPaper = async (req, res) => {
  try {
    const paper = await Paper.create({
      ...req.body,
      authorId: req.user.id,
      publish: req.body.publish
    });

    res.json(paper);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

const updatePaper = async (req, res) => {
  try {
    const paper = await Paper.findByPk(req.params.id);
    if (!paper) {
      return res.status(404).json({ message: "Paper not found" });
    }
    if (paper.authorId !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }
    await paper.update(req.body);
    res.json(paper);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

const publishPaper = async (req, res) => {
  try {
    const paper = await Paper.findByPk(req.params.id);
    if (!paper) {
      return res.status(404).json({ message: "Paper not found" });
    }
    if (paper.authorId !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }
    if (paper.publishedAt) {
      return res.status(400).json({ message: "Paper already published" });
    }
    await paper.update({ publishedAt: new Date() });
    res.json(paper);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
}

const deletePaper = async (req, res) => {
  try {
    const paper = await Paper.findByPk(req.params.id);
    if (!paper) {
      return res.status(404).json({ message: "Paper not found" });
    }
    if (paper.authorId !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }
    await paper.destroy();
    res.json({ message: "Paper deleted" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

const createLike = async (req, res) => {
  try {
    const paper = await Paper.findByPk(req.params.id);
    if (!paper)
      return res.status(404).json({ message: "Paper not found" });

    const user = await User.findByPk(req.user.id);
    if (!user)
      return res.status(404).json({ message: "User not found" });

    const alreadyLiked = await paper.hasPaperLike(user);
    if (alreadyLiked)
      return res.status(400).json({ message: "Already liked" });

    const newLike = await paper.addPaperLike(user);
    return res.json(newLike);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

const deleteLike = async (req, res) => {
  try {
    const paper = await Paper.findByPk(req.params.id);
    if (!paper)
      return res.status(404).json({ message: "Paper not found" });

    const user = await User.findByPk(req.user.id);
    if (!user)
      return res.status(404).json({ message: "User not found" });

    const alreadyLiked = await paper.hasPaperLike(user);
    if (!alreadyLiked)
      return res.status(400).json({ message: "Not liked yet" });

    const deletedLike = await paper.removePaperLike(user);
    return res.json(deletedLike);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

const createPaperClip = async (req, res) => {
  try {
    const paper = await Paper.findByPk(req.params.id);
    if (!paper)
      return res.status(404).json({ message: "Paper not found" });

    const user = await User.findByPk(req.user.id);
    if (!user)
      return res.status(404).json({ message: "User not found" });

    const alreadyClipped = await paper.hasBookmark(user);
    if (alreadyClipped)
      return res.status(400).json({ message: "Already clipped" });

    const newClip = await paper.addBookmark(user);
    return res.json(newClip);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

const deletePaperClip = async (req, res) => {
  try {
    const paper = await Paper.findByPk(req.params.id);
    if (!paper)
      return res.status(404).json({ message: "Paper not found" });

    const user = await User.findByPk(req.user.id);
    if (!user)
      return res.status(404).json({ message: "User not found" });

    const alreadyClipped = await paper.hasBookmark(user);
    if (!alreadyClipped)
      return res.status(400).json({ message: "Not clipped yet" });

    const deletedClip = await paper.removeBookmark(user);
    return res.json(deletedClip);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

export {
  createPaper,
  findPaperByAuthorId,
  findPaperById,
  updatePaper,
  publishPaper,
  deletePaper,
  createLike,
  deleteLike,
  createPaperClip,
  deletePaperClip,
};