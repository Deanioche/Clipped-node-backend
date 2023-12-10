import { Paper } from '../models/paper.js';
import { User } from '../models/user.js';
import { page_limit } from '../utils/config.js';
import { Op } from 'sequelize';

// GET /paper/:id/comments
const findPaperByAuthorId = async (req, res) => {
  let cursor = req.query.cursor;
  const limit = Number(req.query.limit || page_limit);
  const authorId = req.query.authorId;

  // authorId 검증
  if (!authorId) {
    return res.status(400).json({ message: "Missing authorId in query" });
  }

  // limit 검증
  if (isNaN(limit) || limit < 1) {
    return res.status(400).json({ message: "Invalid limit value" });
  }

  // cursor 검증 및 설정
  if (cursor) {
    if (isNaN(new Date(cursor))) {
      return res.status(400).json({ message: "Invalid cursor format" });
    }
  } else {
    // cursor가 제공되지 않은 경우, 현재 시간을 기준으로 설정
    cursor = new Date().toISOString();
  }

  try {
    const papers = await Paper.findAll({
      where: {
        authorId,
        createdAt: {
          [Op.lt]: new Date(cursor)  // cursor보다 이전 시간을 가진 항목을 찾습니다.
        }
      },
      limit,
      order: [['createdAt', 'DESC']] // 최신 항목부터 가져옵니다.
    });

    const nextCursor = papers.length > 0 ? papers[papers.length - 1].createdAt.toISOString() : null;

    res.json({
      data: papers.map(paper => ({
        id: paper.id,
        // authorId: paper.authorId,
        // title: paper.title,
        createdAt: paper.createdAt,
      })),
      cursor: nextCursor
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

// GET /paper/:id
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

// DELETE /paper
const deletePaperByIds = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids) {
      return res.status(400).json({ message: "Invalid request" });
    }
    const papers = await Paper.findAll({
      where: {
        id: ids,
        authorId: req.user.id,
      }
    });
    if (papers.length !== ids.length) {
      return res.status(400).json({ message: "Invalid request" });
    }
    for (let i = 0; i < papers.length; i++) {
      if (papers[i].authorId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
    }
    await Paper.destroy({
      where: {
        id: ids,
      }
    });
    res.json({ message: "Papers deleted" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
}

// POST /paper
const createPaper = async (req, res) => {
  try {
    const paper = await Paper.create({
      ...req.body,
      authorId: req.user.id,
    });

    res.json(paper);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

// PUT /paper/:id
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

// PUT /paper/:id
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

// DELETE /paper/:id
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

// POST /paper/:id/like
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

// DELETE /paper/:id/like
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

// POST /paper/:id/clip
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

// DELETE /paper/:id/clip
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
  deletePaperByIds,
  updatePaper,
  publishPaper,
  deletePaper,
  createLike,
  deleteLike,
  createPaperClip,
  deletePaperClip,
};