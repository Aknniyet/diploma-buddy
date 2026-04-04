import express from 'express';
import { getUsefulInfo } from '../controllers/infoController.js';

const router = express.Router();

router.get('/', getUsefulInfo);

export default router;
