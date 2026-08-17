import { Router } from 'express';
import {
  createIssue, deleteIssue, getIssue, getStats, listIssues, updateIssue, voteIssue
} from '../controllers/issueController.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';

const router = Router();
router.get('/', requireAuth, listIssues);
router.get('/stats', requireAuth, getStats);
router.get('/:id', requireAuth, getIssue);
router.post('/', requireAuth, createIssue);
router.post('/:id/vote', requireAuth, voteIssue);
router.put('/:id', requireAuth, requireAdmin, updateIssue);
router.delete('/:id', requireAuth, requireAdmin, deleteIssue);
export default router;
