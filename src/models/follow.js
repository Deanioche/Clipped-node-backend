import { DataTypes, UUIDV4, NOW } from 'sequelize';
import sequelize from '../utils/db.js';

const Follow = sequelize.define('follow', {
  id: { type: DataTypes.UUID, defaultValue: UUIDV4, primaryKey: true, allowNull: false, },
  follower_id: { type: DataTypes.UUID, allowNull: false, },
  following_id: { type: DataTypes.UUID, allowNull: false, },
  created_at: { type: DataTypes.DATE, defaultValue: NOW, allowNull: false, },
  updated_at: { type: DataTypes.DATE, defaultValue: NOW, allowNull: false, },
});

export { Follow }