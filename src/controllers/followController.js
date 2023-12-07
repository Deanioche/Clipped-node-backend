import { User } from "../models/user.js"
import { Follow } from "../models/follow.js";

const findFollowings = async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  const followings = await Follow.findAll({
    where: {
      followerId: user.id
    },
    include: [
      {
        model: User,
        as: 'Following'
      }
    ]
  });

  followings.sort((a, b) => {
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  res.json(followings);
}

const findFollowers = async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  // find all followers of the user
  const followers = await Follow.findAll({
    where: {
      followingId: user.id
    },
    include: [
      {
        model: User,
        as: 'Follower'
      }
    ]
  });

  followers.sort((a, b) => {
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  res.json(followers);
}

const addFollow = async (req, res) => {
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
}

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