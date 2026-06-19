import express from 'express';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticate);

router.get('/voices', (_req, res) => {
  res.status(501).json({ error: 'TTS voices endpoint is no longer available' });
});

router.post('/preview', (_req, res) => {
  res.status(501).json({ error: 'TTS preview endpoint is no longer available' });
});

export default router;
