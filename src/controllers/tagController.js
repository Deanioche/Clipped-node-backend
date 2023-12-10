import { Tag } from "../models/tag.js";
import { page_limit } from "../utils/config.js";

// get http GET /tag?userId=xxx
const getTagsByUserId = async (req, res) => {
  let { userId, page = 1, limit = page_limit } = req.query;
  page = Number(page);
  limit = Number(limit);

  if (!userId) {
    return res.status(400).json({ message: "userId is required" });
  }

  if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
    return res.status(400).json({ message: "Invalid query" });
  }

  try {
    const tags = await Tag.findAll({
      where: {
        userId,
      }
    });

    // sort asc
    tags.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    // pagination
    const offset = (page - 1) * limit;
    res.json(tags.slice(offset, offset + limit));
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