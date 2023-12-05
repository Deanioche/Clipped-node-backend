import express from 'express';
import { config } from 'dotenv';
import get404 from './controllers/error.js';
import sequelize from './utils/db.js';

import authRoutes from './routes/authRoutes.js';
import authenticateJWT from './utils/authenticateJWT.js';

config();
const app = express();

app.use('/auth', authRoutes);

// protected routes
app.use('/profile', authenticateJWT, (res, req) => {
  res.send('Profile');
});

// not found
app.use(get404);

// sequelize.sync({ force: true }).then(() => {
sequelize.sync({}).then(() => {
  console.log('🔥 All tables created successfully!');
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });

}).catch((error) => {
  console.error('🔥🔥 Error creating tables:', error);
});

