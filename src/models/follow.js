import { DataTypes, UUIDV4 } from 'sequelize';
import sequelize from '../utils/db.js';

const Follow = sequelize.define('follow', {
  id: { type: DataTypes.UUID, defaultValue: UUIDV4, primaryKey: true, allowNull: false, },
  followerId: { type: DataTypes.UUID, allowNull: false, },
  followingId: { type: DataTypes.UUID, allowNull: false, },
}, {
  underscored: true,
  freezeTableName: true,
});

export { Follow }