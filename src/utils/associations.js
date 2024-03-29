import { Follow } from "../models/follow.js";
import { Clip, Clip_link } from "../models/clip.js";
import { Paper } from "../models/paper.js";
import { User } from "../models/user.js";
import { Tag } from "../models/tag.js";
import { Dm } from "../models/dm.js";
import { PaperComment } from "../models/paperComment.js";

Paper.belongsTo(User, { foreignKey: 'authorId', as: 'author', onDelete: 'CASCADE' });

Follow.belongsTo(User, { as: 'Follower', foreignKey: 'follower_id', onDelete: 'CASCADE' });
Follow.belongsTo(User, { as: 'Following', foreignKey: 'following_id', onDelete: 'CASCADE' });

Clip.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });
Clip.hasMany(Clip_link, { foreignKey: 'clipId', onDelete: 'CASCADE' });
Clip_link.belongsTo(Clip, { foreignKey: 'clipId', onDelete: 'CASCADE' });

Clip.belongsToMany(Tag, { through: 'clip_tag', foreignKey: 'clip_id', timestamps: false });
Tag.belongsToMany(Clip, { through: 'clip_tag', foreignKey: 'tag_id' });

Clip.belongsToMany(Paper, { through: 'clip_paper', foreignKey: 'clip_id', timestamps: false });
Paper.belongsToMany(Clip, { through: 'clip_paper', foreignKey: 'paper_id', timestamps: false });

Paper.belongsToMany(User, { through: 'paper_clip', foreignKey: 'paper_id', timestamps: false, as: 'bookmark' });
User.belongsToMany(Paper, { through: 'paper_clip', foreignKey: 'user_id', timestamps: false, as: 'bookmark' });

Paper.belongsToMany(User, { through: 'paper_like', foreignKey: 'paper_id', timestamps: false, as: 'paperLike' });
User.belongsToMany(Paper, { through: 'paper_like', foreignKey: 'user_id', timestamps: false, as: 'paperLike' });

Clip.belongsToMany(User, { through: 'clip_like', foreignKey: 'clip_id', timestamps: false, as: 'clipLike' });
User.belongsToMany(Clip, { through: 'clip_like', foreignKey: 'user_id', timestamps: false, as: 'clipLike' });

PaperComment.belongsTo(User, { foreignKey: 'user_id', onDelete: 'CASCADE' });
PaperComment.belongsTo(Paper, { foreignKey: 'paper_id', onDelete: 'CASCADE' });

Dm.belongsTo(User, { foreignKey: 'sender_id', onDelete: 'CASCADE' });
Dm.belongsTo(User, { foreignKey: 'receiver_id', onDelete: 'CASCADE' });