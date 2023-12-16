import { Tag } from "../models/tag.js";
import { page_limit } from "../utils/config.js";
import { Op } from "sequelize";
import { validateUuid } from "../utils/validateUuid.js";

// GET /tag?userId=xxx
const getTagsByUserId = async (req, res) => {
  const cursor = req.query.cursor;
  const limit = Number(req.query.limit || page_limit);
  const userId = req.query.userId;

  if (!userId) {
    return res.status(400).json({ message: "userId is required" });
  }

  if (isNaN(limit) || limit < 1) {
    return res.status(400).json({ message: "Invalid limit value" });
  }

  let whereCondition = { userId };

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
    const tags = await Tag.findAll({
      where: whereCondition,
      limit,
      order: [['createdAt', 'ASC'], ['id', 'ASC']],
    });

    let nextCursor = tags.length === limit ? tags[tags.length - 1].createdAt.toISOString() + "," + tags[tags.length - 1].id : null;

    res.json({
      data: tags,
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