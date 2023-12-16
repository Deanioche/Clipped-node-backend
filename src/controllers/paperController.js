import { Paper } from '../models/paper.js';
import { User } from '../models/user.js';
import { page_limit } from '../utils/config.js';
import { Op } from 'sequelize';
import { validateUuid } from '../utils/validateUuid.js';

// GET /paper/:id/comments
const findPaperByAuthorId = async (req, res) => {
  const cursor = req.query.cursor;
  const limit = Number(req.query.limit || page_limit);
  const authorId = req.query.authorId;

  if (!authorId) {
    return res.status(400).json({ message: "Missing authorId in query" });
  }

  if (isNaN(limit) || limit < 1) {
    return res.status(400).json({ message: "Invalid limit value" });
  }

  let whereCondition = { authorId };

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
        { createdAt: { [Op.lt]: cursorDate } },
        {
          [Op.and]: [
            { createdAt: cursorDate },
            { id: { [Op.gt]: cursorId } }
          ]
        }
      ]
    };
  }

  try {
    const papers = await Paper.findAll({
      where: whereCondition,
      limit,
      order: [['createdAt', 'DESC'], ['id', 'ASC']],
    });

    let nextCursor = papers.length === limit ? papers[papers.length - 1].createdAt.toISOString() + "," + papers[papers.length - 1].id : null;

    res.json({
      data: papers,
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
    if (!ids || ids.length === 0) {
      return res.status(400).json({ message: "Invalid request" });
    }

    const papers = await Paper.findAll({
      where: {
        id: ids,
      }
    });

    const invalidPapers = papers.filter(paper => paper.authorId !== req.user.id);
    if (invalidPapers.length > 0) {
      return res.status(403).json({ message: "Forbidden: You do not have permission to delete one or more of the requested papers" });
    }

    const delResult = await Paper.destroy({
      where: {
        id: ids,
        authorId: req.user.id
      }
    });

    const deleteMessage = delResult <= 1 ? `${delResult} paper has been deleted` : `${delResult} papers have been deleted`;
    res.json({ message: deleteMessage });
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