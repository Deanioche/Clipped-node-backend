import { DataTypes, UUIDV4, NOW } from 'sequelize';
import sequelize from '../utils/db.js';

const Dm = sequelize.define('dm', {
  id: { type: DataTypes.UUID, defaultValue: UUIDV4, primaryKey: true, allowNull: false, },
  content: { type: DataTypes.TEXT, allowNull: true, },
  senderId: { type: DataTypes.UUID, allowNull: false, },
  receiverId: { type: DataTypes.UUID, allowNull: false, },
}, {
  underscored: true,
  freezeTableName: true,
  updatedAt: false,
});

export { Dm }