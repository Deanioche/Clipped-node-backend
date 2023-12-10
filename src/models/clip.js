import { DataTypes, UUIDV4, NOW } from 'sequelize';
import sequelize from '../utils/db.js';

const Clip = sequelize.define('clip', {
  id: { type: DataTypes.UUID, defaultValue: UUIDV4, primaryKey: true, allowNull: false, },
  userId: { type: DataTypes.UUID, allowNull: false, },
  title: { type: DataTypes.STRING, allowNull: false, },
  content: { type: DataTypes.TEXT, allowNull: true, },
  startedAt: { type: DataTypes.DATE, defaultValue: NOW, allowNull: false, },
  endedAt: { type: DataTypes.DATE, defaultValue: NOW, allowNull: false, },
  publishedAt: { type: DataTypes.DATE, defaultValue: NOW, allowNull: false, },
}, {
  underscored: true,
  freezeTableName: true,
});

const Clip_link = sequelize.define('clip_link', {
  id : { type: DataTypes.UUID, defaultValue: UUIDV4, primaryKey: true, allowNull: false, },
  clipId: { type: DataTypes.UUID, allowNull: false, },
  link: { type: DataTypes.STRING, allowNull: false, },
}, {
  underscored: true,
  timestamps: false,
  freezeTableName: true,
});

export { Clip, Clip_link }