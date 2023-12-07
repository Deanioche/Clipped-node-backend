import express from 'express';
import { Tag } from '../models/tag.js';
import { Clip } from '../models/clip.js';
import { Paper } from '../models/paper.js';

const router = express.Router();

// GET /clip?userId=&tagId=
router.get('/', async (req, res) => {
  const { userId, tagId } = req.query;

  // 둘 다 존재하지 않는 경우 오류 메시지 반환
  if (!userId && !tagId) {
    return res.status(400).json({ message: "userId or tagId is required" });
  }

  let whereClause = {};

  // userId가 있는 경우 where 절에 추가
  if (userId) {
    whereClause.userId = userId;
  }

  // tagId가 있는 경우 where 절에 추가
  if (tagId) {
    whereClause.tagId = tagId;
  }

  try {
    const clips = await Clip.findAll({ where: whereClause });
    res.json(clips);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET /clip/:id
router.get('/:id', async (req, res) => {
  try {
    const clip = await Clip.findByPk(req.params.id);
    if (!clip) {
      return res.status(404).json({ message: "Clip not found" });
    }
    res.json(clip);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// POST /clip
router.post('/', async (req, res) => {
  try {
    // 클립 생성
    const clip = await Clip.create({
      ...req.body,
      userId: req.user.id,
      publish: req.body.publish
    });

    // tags와 papers 배열에서 id 추출
    const { tags, papers } = req.body;

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

    // 최종 클립 데이터 반환
    const result = await Clip.findOne({
      where: { id: clip.id },
      include: [Tag, Paper] // 클립과 연관된 태그와 페이퍼 포함
    });
    res.json(result);

  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});


export default router;
