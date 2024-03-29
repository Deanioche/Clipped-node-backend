import { Tag } from '../models/tag.js';
import { Clip, Clip_link } from '../models/clip.js';
import { Paper } from '../models/paper.js';
import { page_limit } from '../utils/config.js';
import { Op } from 'sequelize';
import { validateUuid } from '../utils/validateUuid.js';

// GET /clip
const findClipsByFilter = async (req, res) => {
  try {
    let { cursor, limit, userId, tagId } = req.query;
    limit = Number(limit || page_limit);

    if (!userId && !tagId) {
      return res.status(400).json({ message: "userId or tagId is required" });
    }
    if (isNaN(limit) || limit < 1) {
      return res.status(400).json({ message: "Invalid limit value" });
    }

    let whereClause = {};

    if (cursor) {
      const [cursorDateStr, cursorId] = cursor.split(",");
      const cursorDate = new Date(cursorDateStr);
      if (isNaN(cursorDate)) {
        return res.status(400).json({ message: "Invalid cursor format (date)" });
      }
      if (!validateUuid(cursorId)) {
        return res.status(400).json({ message: "Invalid cursor format (id)" });
      }
      whereClause = {
        [Op.or]: [
          { startedAt: { [Op.gt]: cursorDate } },
          {
            [Op.and]: [
              { startedAt: cursorDate },
              { id: { [Op.gt]: cursorId } }
            ]
          }
        ]
      };
    } else {
      whereClause.startedAt = { [Op.gt]: new Date('1970-01-01') };
    }

    if (userId) {
      whereClause.userId = userId;
    }

    let clips = [];
    if (tagId) {
      clips = await fetchClipsWithTag(tagId, whereClause, limit);
    } else {
      clips = await Clip.findAll({
        where: whereClause,
        order: [['startedAt', 'ASC'], ['id', 'ASC']],
        limit
      });
    }

    let nextCursor = clips.length === limit ? clips[clips.length - 1].startedAt.toISOString() + "," + clips[clips.length - 1].id : null;

    res.json({
      data: clips,
      cursor: nextCursor
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

async function fetchClipsWithTag(tagId, whereClause, limit) {
  const tag = await Tag.findByPk(tagId, {
    include: [{
      model: Clip,
      attributes: ['id', 'startedAt'],
    }]
  });
  if (!tag) {
    throw new Error("Tag not found");
  }

  const clipIds = tag.clips.map(clip => clip.id);

  if (clipIds.length === 0) {
    return [];
  }

  whereClause.id = { [Op.in]: clipIds };

  const clips = await Clip.findAll({
    where: whereClause,
    order: [['startedAt', 'ASC'], ['id', 'ASC']],
    limit: limit
  });

  return clips;
}


// GET /clip/:id
const findClipById = async (req, res) => {
  try {
    const clip = await Clip.findByPk(req.params.id);
    if (!clip) {
      return res.status(404).json({ message: "Clip not found" });
    }
    res.json(clip);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}

// POST /clip
const createClip = async (req, res) => {
  try {
    if (!req.body.title) {
      return res.status(400).json({ message: "title is required" });
    }

    if (!req.body.content) {
      return res.status(400).json({ message: "content is required" });
    }

    const clip = await Clip.create({
      ...req.body,
      userId: req.user.id,
    });

    const { tags, papers, links } = req.body;

    if (tags && tags.length > 0) {
      const tagInstances = await Tag.findAll({
        where: { id: tags }
      });
      await clip.addTags(tagInstances);
    }

    if (papers && papers.length > 0) {
      const paperInstances = await Paper.findAll({
        where: { id: papers }
      });
      await clip.addPapers(paperInstances);
    }

    if (links && links.length > 0) {
      for (let link of links) {
        if (!link.match(/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w.-]*)*\/?$/)) {
          return res.status(400).json({ message: "Invalid url" });
        }
        await Clip_link.create({ clipId: clip.id, link });
      }
    }

    const result = await Clip.findOne({
      where: { id: clip.id },
      include: [Tag, Paper, Clip_link]
    });
    res.json(result);

  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}

// PATCH /clip/:id
const updateClip = async (req, res) => {
  try {
    const clip = await Clip.findByPk(req.params.id);
    if (!clip) {
      return res.status(404).json({ message: "Clip not found" });
    }
    if (clip.userId !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }
    await clip.update(req.body);
    res.json(clip);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}

// DELETE /clip/:id
const deleteClip = async (req, res) => {
  try {
    const clip = await Clip.findByPk(req.params.id);
    if (!clip) {
      return res.status(404).json({ message: "Clip not found" });
    }
    if (clip.userId !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }
    await clip.destroy();
    res.json({ message: "Clip deleted" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}

// PATCH /clip/:id/publish
const publishClip = async (req, res) => {
  try {
    const clip = await Clip.findByPk(req.params.id);
    if (!clip) {
      return res.status(404).json({ message: "Clip not found" });
    }
    if (clip.userId !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }
    await clip.update({ publishedAt: new Date() });
    res.json(clip);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}

// POST /clip/:id/like
const likeClip = async (req, res) => {
  try {
    const clip = await Clip.findByPk(req.params.id);

    if (!clip) {
      return res.status(404).json({ message: "Clip not found" });
    }
    await clip.addClipLike(req.user.id);
    res.json(clip);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
}

// DELETE /clip/:id/like
const unlikeClip = async (req, res) => {
  try {
    const clip = await Clip.findByPk(req.params.id);
    if (!clip) {
      return res.status(404).json({ message: "Clip not found" });
    }
    await clip.removeClipLike(req.user.id);
    res.json(clip);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}

export {
  findClipsByFilter,
  findClipById,
  createClip,
  updateClip,
  deleteClip,
  publishClip,
  likeClip,
  unlikeClip
};