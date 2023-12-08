import { DataTypes, UUIDV4, NOW } from 'sequelize';
import sequelize from '../utils/db.js';

const PaperComment = sequelize.define('paper_comment', {
  id: { type: DataTypes.UUID, defaultValue: UUIDV4, primaryKey: true, allowNull: false, },
  content: { type: DataTypes.TEXT, allowNull: false, },
  userId: { type: DataTypes.UUID, allowNull: false, },
  paperId: { type: DataTypes.UUID, allowNull: false, },
}, {
  underscored: true,
  freezeTableName: true,
});

export { PaperComment }