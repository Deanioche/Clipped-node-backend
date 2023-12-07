import { DataTypes, UUIDV4, NOW } from 'sequelize';
import sequelize from '../utils/db.js';

const Tag = sequelize.define('tag', {
  id: { type: DataTypes.UUID, defaultValue: UUIDV4, primaryKey: true, allowNull: false, },
  userId: { type: DataTypes.UUID, allowNull: false, },
  name: { type: DataTypes.STRING, allowNull: false, },
  color: { type: DataTypes.STRING, allowNull: false, },
}, {
  underscored: true,
});

export { Tag }