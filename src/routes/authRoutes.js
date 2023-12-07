import express from 'express';

import { login, signup, token } from '../controllers/authController.js'
const router = express.Router();

router.post('/login', login);
router.post('/signup', signup);
router.post('/token', token);

export default router;
