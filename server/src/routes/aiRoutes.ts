
import { Router } from 'express';
import { handleClinicalQuery } from '../controllers/aiController';

const router = Router();

router.post('/rag', handleClinicalQuery);

export default router;
