import { Tag } from '../models/tag.js';
import { Clip, Clip_link } from '../models/clip.js';
import { Paper } from '../models/paper.js';
import { User } from '../models/user.js';
import { page_limit } from '../utils/config.js';
import { Op } from 'sequelize';

// GET /clip
const findClipsByFilter = async (req, res) => {
  try {
    let { cursor, limit, userId, tagId } = req.query;
    limit = Number(limit || page_limit);
    cursor = cursor || new Date('1970-01-01').toISOString();

    if (!userId && !tagId) {
      return res.status(400).json({ message: "userId or tagId is required" });
    }
    if (isNaN(limit) || limit < 1) {
      return res.status(400).json({ message: "Invalid limit value" });
    }

    let whereClause = {
      startedAt: { [Op.gt]: new Date(cursor) }
    };
    if (userId) {
      whereClause.userId = userId;
    }

    let clips = [];
    if (tagId) {
      clips = await fetchClipsWithTag(tagId, whereClause, limit);
    } else {
      clips = await Clip.findAll({
        where: whereClause,
        order: [['startedAt', 'ASC']],
        limit: limit
      });
    }

    let nextCursor = clips.length === limit ? clips[clips.length - 1].startedAt.toISOString() : null;

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
      attributes: ['id'],
    }]
  });
  if (!tag) {
    throw new Error("Tag not found", 404);
  }

  const clipIds = tag.clips.map(clip => clip.id);

  if (clipIds.length === 0) {
    return []; // 해당 태그에 연결된 클립이 없는 경우
  }

  const clips = await Clip.findAll({
    where: {
      ...whereClause,
      id: {
        [Op.in]: clipIds // IN 쿼리를 사용하여 여러 ID에 해당하는 클립 조회
      }
    },
    order: [['startedAt', 'ASC']],
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

    // 클립 생성
    const clip = await Clip.create({
      ...req.body,
      userId: req.user.id,
    });

    // tags와 papers 배열에서 id 추출
    const { tags, papers, links } = req.body;

    // tags가 있으면 관계 설정
    if (tags && tags.length > 0) {
      const tagInstances = await Tag.findAll({
        where: { id: tags }
      });
      await clip.addTags(tagInstances);
    }

    // papers가 있으면 관계 설정
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

    // 최종 클립 데이터 반환
    const result = await Clip.findOne({
      where: { id: clip.id },
      include: [Tag, Paper, Clip_link] // 클립과 연관된 태그와 페이퍼 포함
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