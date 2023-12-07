import { DataTypes, UUIDV4, NOW } from 'sequelize';
import sequelize from '../utils/db.js';

const User = sequelize.define('user', {
  id: { type: DataTypes.UUID, defaultValue: UUIDV4, primaryKey: true, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true, },
  name: { type: DataTypes.STRING, allowNull: false },
  login: { type: DataTypes.STRING, allowNull: false, unique: true, },
  password: { type: DataTypes.STRING, allowNull: false, },
  // Optional fields
  username: { type: DataTypes.STRING, allowNull: true, },
  oneline: { type: DataTypes.STRING, allowNull: true, },
  hashtags: { type: DataTypes.STRING, allowNull: true, },
  profileImage: { type: DataTypes.STRING, allowNull: true, },
  school: { type: DataTypes.STRING, allowNull: true, },
  major: { type: DataTypes.STRING, allowNull: true, },
  entryYear: { type: DataTypes.STRING, allowNull: true, },
  job: { type: DataTypes.STRING, allowNull: true, },
  // Required fields
  joinMethod: { type: DataTypes.STRING, allowNull: false, defaultValue: 'email', },
}, {
  underscored: true,
});

export { User }