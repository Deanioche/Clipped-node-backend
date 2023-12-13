import Sequelize from 'sequelize';
import { config } from 'dotenv';

config();
const env = process.env;

const sequelize = new Sequelize({
  database: env.DB_NAME,
  username: env.DB_USER,
  password: env.DB_PASSWORD,
  host: env.DB_HOST || 'localhost',
  dialect: 'mysql',
  logging: false,
  timezone: '+09:00',
});

sequelize
  .authenticate()
  .then(() => {
    console.log('✅ Connection has been established successfully.');
  })
  .catch((error) => {
    console.error('❌ Unable to connect to the database:', error);
  });

export default sequelize;
