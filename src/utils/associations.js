import { Follow } from "../models/follow.js";
import { Clip } from "../models/clip.js";
// import { Paper, PaperClip, PaperImage, PaperLike } from "../models/paper.js";
import { Paper } from "../models/paper.js";
import { User } from "../models/user.js";
import { Tag } from "../models/tag.js";

Paper.belongsTo(User, { foreignKey: 'author_id', as: 'author', onDelete: 'CASCADE' });

Follow.belongsTo(User, { as: 'Follower', foreignKey: 'follower_id', onDelete: 'CASCADE' });
Follow.belongsTo(User, { as: 'Following', foreignKey: 'following_id', onDelete: 'CASCADE' });

Clip.belongsTo(User, { foreignKey: 'user_id', onDelete: 'CASCADE' });

Clip.belongsToMany(Tag, { through: 'clip_tag', foreignKey: 'clip_id', timestamps: false });
Tag.belongsToMany(Clip, { through: 'clip_tag', foreignKey: 'tag_id'});
Clip.belongsToMany(Paper, { through: 'clip_paper', foreignKey: 'clip_id', timestamps: false });
Paper.belongsToMany(Clip, { through: 'clip_paper', foreignKey: 'paper_id', timestamps: false });

