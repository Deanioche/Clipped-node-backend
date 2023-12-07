import { DataTypes, UUIDV4, NOW } from 'sequelize';
import sequelize from '../utils/db.js';

const Clip = sequelize.define('clip', {
  id: { type: DataTypes.UUID, defaultValue: UUIDV4, primaryKey: true, allowNull: false, },
  user_id: { type: DataTypes.UUID, allowNull: false, },
  title: { type: DataTypes.STRING, allowNull: false, },
  content: { type: DataTypes.STRING, allowNull: true, },
  started_at: { type: DataTypes.DATE, defaultValue: NOW, allowNull: false, },
  ended_at: { type: DataTypes.DATE, defaultValue: NOW, allowNull: false, },
  created_at: { type: DataTypes.DATE, defaultValue: NOW, allowNull: false, },
  updated_at: { type: DataTypes.DATE, defaultValue: NOW, allowNull: false, },
  published_at: { type: DataTypes.DATE, defaultValue: NOW, allowNull: false, },
});

export { Clip }