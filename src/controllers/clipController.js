import { Tag } from '../models/tag.js';
import { Clip, Clip_link } from '../models/clip.js';
import { Paper } from '../models/paper.js';
import { User } from '../models/user.js';

const findFilteredClips = async (req, res) => {
  const { userId, tagId } = req.query;

  if (!userId && !tagId) {
    return res.status(400).json({ message: "userId or tagId is required" });
  }

  let whereClause = {};
  let include = [
    { model: Tag, attributes: ['id'], through: { attributes: [] } },
    { model: Paper, attributes: [] },
    { model: Clip_link, attributes: [] }
  ];

  if (userId) {
    whereClause.userId = userId;
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found:", userId });
    }
  }

  try {
    let clips;
    if (tagId) {
      // tagId가 주어진 경우, Tag 모델을 통해 Clip을 찾습니다.
      const tag = await Tag.findByPk(tagId, {
        include: [{
          model: Clip,
          where: whereClause,
          include: include.slice(1) // Tag를 제외한 나머지 모델 포함
        }]
      });

      if (!tag) {
        return res.status(404).json({ message: "Tag not found", tagId });
      }

      clips = tag.clips;
    } else {
      // userId만 주어진 경우
      clips = await Clip.findAll({
        where: whereClause,
        include: include
      });
    }

    clips.sort((a, b) => b.createdAt - a.createdAt);
    res.json(clips);

  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

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

export {
  findFilteredClips,
  findClipById,
  createClip
};