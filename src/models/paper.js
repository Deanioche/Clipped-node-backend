import { DataTypes, UUIDV4 } from 'sequelize';
import sequelize from '../utils/db.js';

const Paper = sequelize.define('paper', {
  id: { type: DataTypes.UUID, defaultValue: UUIDV4, primaryKey: true, allowNull: false, },
  title: { type: DataTypes.STRING, allowNull: false },
  authorId: { type: DataTypes.UUID, allowNull: false },
  content: { type: DataTypes.TEXT, allowNull: false },
  hashtags: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
  publishedAt: { type: DataTypes.DATE }
}, {
  underscored: true,
  freezeTableName: true,
});

export { Paper }