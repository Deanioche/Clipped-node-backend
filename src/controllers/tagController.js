import { Tag } from "../models/tag.js";
import { page_limit } from "../utils/config.js";
import { Op } from "sequelize";

// GET /tag?userId=xxx
const getTagsByUserId = async (req, res) => {
  let cursor = req.query.cursor;
  const limit = Number(req.query.limit || page_limit);
  const userId = req.query.userId;

  if (!userId) {
    return res.status(400).json({ message: "userId is required" });
  }

  if (isNaN(limit) || limit < 1) {
    return res.status(400).json({ message: "Invalid limit value" });
  }

  if (!cursor) {
    cursor = new Date('1970-01-01').toISOString();
  } else if (isNaN(new Date(cursor))) {
    return res.status(400).json({ message: "Invalid cursor format" });
  }

  try {
    const tags = await Tag.findAll({
      where: {
        userId,
        createdAt: {
          [Op.gt]: new Date(cursor)
        }
      },
      limit,
      order: [['createdAt', 'ASC']]
    });

    let nextCursor = tags.length === limit ? tags[tags.length - 1].createdAt.toISOString() : null;

    res.json({
      data: tags.map(tag => {
        return {
          id: tag.id,
          createdAt: tag.createdAt,
          updatedAt: tag.updatedAt,
        }
      }),
      cursor: nextCursor
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

// POST /tag
const createTag = async (req, res) => {
  try {
    const color = req.body.color;
    if (!color) {
      return res.status(400).json({ message: "color is missing" });
    }

    const name = req.body.name;
    if (!name) {
      return res.status(400).json({ message: "name is missing" });
    }

    const tag = await Tag.create({ color, name, userId: req.user.id });
    res.json(tag);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
}

// PUT /tag/:id
const updateTag = async (req, res) => {
  try {
    const tag = await Tag.findByPk(req.params.id);
    if (!tag)
      return res.status(404).json({ message: "Tag not found" });

    if (tag.userId !== req.user.id)
      return res.status(403).json({ message: "Forbidden" });

    const color = req.body.color;
    if (!color) {
      return res.status(400).json({ message: "color is missing" });
    }

    const name = req.body.name;
    if (!name) {
      return res.status(400).json({ message: "name is missing" });
    }

    await tag.update({ color, name });
    res.json(tag);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
}

export { getTagsByUserId, createTag, updateTag };