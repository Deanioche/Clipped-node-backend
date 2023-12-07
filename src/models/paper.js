import { DataTypes, UUIDV4, NOW } from 'sequelize';
import sequelize from '../utils/db.js';

const Paper = sequelize.define('paper', {
  id: { type: DataTypes.UUID, defaultValue: UUIDV4, primaryKey: true, allowNull: false, },
  title: { type: DataTypes.STRING, allowNull: false },
  author_id: { type: DataTypes.UUID, allowNull: false },
  content: { type: DataTypes.STRING, allowNull: false },
  hashtags: { type: DataTypes.STRING, allowNull: false },
  created_at: { type: DataTypes.DATE, allowNull: false },
  updated_at: { type: DataTypes.DATE, allowNull: false },
  published_at: { type: DataTypes.DATE }
});

// const PaperImage = sequelize.define('paperImage', {
//   id: { type: DataTypes.UUID, defaultValue: UUIDV4, primaryKey: true, allowNull: false, },
//   paper_id: { type: DataTypes.UUID, allowNull: false },
//   url: { type: DataTypes.STRING, allowNull: false },
// });

// const PaperLike = sequelize.define('paperLike', {
//   id: { type: DataTypes.UUID, defaultValue: UUIDV4, primaryKey: true, allowNull: false, },
//   paper_id: { type: DataTypes.UUID, allowNull: false },
//   user_id: { type: DataTypes.UUID, allowNull: false },
// });

// const PaperClip = sequelize.define('paperClip', {
//   id: { type: DataTypes.UUID, defaultValue: UUIDV4, primaryKey: true, allowNull: false, },
//   paper_id: { type: DataTypes.UUID, allowNull: false },
//   user_id: { type: DataTypes.UUID, allowNull: false },
// });

// const PaperComment = sequelize.define('paperComment', {
//   id: { type: DataTypes.UUID, defaultValue: UUIDV4, primaryKey: true, allowNull: false, },
//   paper_id: { type: DataTypes.UUID, allowNull: false },
//   user_id: { type: DataTypes.UUID, allowNull: false },
//   content: { type: DataTypes.STRING, allowNull: false },
//   created_at: { type: DataTypes.DATE, defaultValue: NOW, allowNull: false },
//   updated_at: { type: DataTypes.DATE, defaultValue: NOW, allowNull: false },
// });

// export { Paper, PaperImage, PaperLike, PaperClip, PaperComment }
// export { Paper, PaperComment }
export { Paper }