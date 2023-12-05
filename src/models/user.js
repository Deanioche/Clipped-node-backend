import { Sequelize, DataTypes, UUIDV4, NOW } from 'sequelize';
import sequelize from '../utils/db.js';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  login: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  oneline: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  hashtags: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  profile_image: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  school: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  major: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  entry_year: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  job: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  join_method: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'email',
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: NOW,
    allowNull: false,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: NOW,
    allowNull: false,
  },
});

export default User;

// `sequelize.define` also returns the model
// console.log(User === sequelize.models.User); // true

// import sequelize from "../db/db";
// // import { UUIDV4 } from "sequelize";

// const User = sequelize.define('user', {
//   // id: {
//   //   type: DataTypes.INTEGER,
//   //   primaryKey: true,
//   //   defaultValue: UUIDV4,
//   // },
//   email: {
//     type: Sequelize.STRING,
//     allowNull: false,
//     unique: true,
//   },
//   name: {
//     type: DataTypes.STRING,
//     allowNull: false
//   },
//   password: {
//     type: Sequelize.STRING,
//     allowNull: false,
//   },
//   timestamps: true,
// });

// export default User;