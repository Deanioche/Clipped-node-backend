import { User } from "../models/user.js"
import { Follow } from "../models/follow.js";
import { page_limit } from "../utils/config.js";
import { Op } from "sequelize";

// GET /user/:id/followings
const findFollowings = async (req, res) => {
  let cursor = req.query.cursor;
  const limit = Number(req.query.limit || page_limit);

  if (isNaN(limit) || limit < 1) {
    return res.status(400).json({ message: "Invalid limit value" });
  }

  if (cursor) {
    if (isNaN(new Date(cursor))) {
      return res.status(400).json({ message: "Invalid cursor format" });
    }
  } else {
    cursor = new Date().toISOString();
  }

  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const followings = await Follow.findAll({
      where: {
        followerId: user.id,
        createdAt: {
          [Op.lt]: new Date(cursor)
        }
      },
      limit,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          as: 'Following'
        }
      ]
    });

    let nextCursor = followings.length === limit ? followings[followings.length - 1].createdAt.toISOString() : null;

    res.json({
      data: followings,
      cursor: nextCursor
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
}

// GET /user/:id/followers
const findFollowers = async (req, res) => {
  let cursor = req.query.cursor;
  const limit = Number(req.query.limit || page_limit);

  if (isNaN(limit) || limit < 1) {
    return res.status(400).json({ message: "Invalid limit value" });
  }

  if (cursor) {
    if (isNaN(new Date(cursor))) {
      return res.status(400).json({ message: "Invalid cursor format" });
    }
  } else {
    cursor = new Date().toISOString();
  }
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const followers = await Follow.findAll({
      where: {
        followingId: user.id,
        createdAt: {
          [Op.lt]: new Date(cursor)
        }
      },
      limit,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          as: 'Follower'
        }
      ]
    });

    let nextCursor = followers.length === limit ? followers[followers.length - 1].createdAt.toISOString() : null;

    res.json({
      data: followers,
      cursor: nextCursor
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
}

// POST /user/:id/follow
const addFollow = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user)
      return res.status(404).json({ message: "User not found" });

    const target = await User.findByPk(req.params.id);
    if (!target)
      return res.status(404).json({ message: "Target user not found" });

    // check if already following
    const existingFollow = await Follow.findOne({
      where: {
        followerId: user.id,
        followingId: target.id
      }
    });
    if (existingFollow)
      return res.status(400).json({ message: "Already following" });

    // add follow
    const follow = await Follow.create({
      followerId: user.id,
      followingId: target.id
    });
    if (!follow)
      return res.status(500).json({ message: "Failed to add follow" });
    res.json(follow);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
}

// DELETE /user/:id/follow
const deleteFollow = async (req, res) => {
  const user = await User.findByPk(req.body.id);
  if (!user)
    return res.status(404).json({ message: "User not found" });

  const target = await User.findByPk(req.params.id);
  if (!target)
    return res.status(404).json({ message: "Target user not found" });

  // check if already following
  const existingFollow = await Follow.findOne({
    where: {
      followerId: user.id,
      followingId: target.id
    }
  });
  if (!existingFollow)
    return res.status(400).json({ message: "Not following" });

  // delete follow
  const follow = await Follow.destroy({
    where: {
      followerId: user.id,
      followingId: target.id
    }
  });
  if (!follow)
    return res.status(500).json({ message: "Failed to delete follow" });
  return res.json({ message: "Successfully deleted follow", data: follow });
}

export { findFollowings, findFollowers, addFollow, deleteFollow }