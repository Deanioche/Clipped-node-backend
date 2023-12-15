import express from 'express';
import { config } from 'dotenv';
import get404 from './routes/error.js';

import sequelize from './utils/db.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import tagRoutes from './routes/tagRoutes.js';
import clipRoutes from './routes/clipRoutes.js';
import paperRoutes from './routes/paperRoutes.js';
import authenticateJWT from './utils/authenticateJWT.js';
import './utils/associations.js';

config();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

try {
  // public routes
  app.use('/auth', authRoutes);
  
  // protected routes
  app.use('/user', userRoutes); // except PATCH /user/me
  app.use('/tag', authenticateJWT, tagRoutes);
  app.use('/clip', authenticateJWT, clipRoutes);
  app.use('/paper', authenticateJWT, paperRoutes);

  // not found
  app.use(get404);
} catch (error) {
  console.error('🔥🔥 Error:', error);
}

sequelize.sync().then(() => {
  console.log('🔥 All tables created successfully!');
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);

  });
}).catch((error) => {
  console.error('🔥🔥 Error creating tables:', error);
});