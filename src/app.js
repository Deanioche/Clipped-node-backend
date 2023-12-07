import express from 'express';
import { config } from 'dotenv';
import get404 from './routes/error.js';

import sequelize from './utils/db.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import authenticateJWT from './utils/authenticateJWT.js';
import './utils/associations.js';

config();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/auth', authRoutes);

// protected routes
app.use('/user', authenticateJWT, userRoutes);

// not found
app.use(get404);

// sync database and start server
// sequelize.sync({ force: true }).then(() => {
sequelize.sync().then(() => {
  console.log('🔥 All tables created successfully!');
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}).catch((error) => {
  console.error('🔥🔥 Error creating tables:', error);
});

