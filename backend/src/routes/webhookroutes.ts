import { Router } from 'express';
import { WebhookController } from '../controllers/webhookcontroller';
import { authenticate } from '../middleware/auth';

const router = Router();
const controller = new WebhookController();

router.use(authenticate);

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/:id/retry', controller.retry);
router.get('/:webhookEventId/attempts', controller.getAttempts);
router.post('/attempts', controller.createAttempt);
router.delete('/:id', controller.delete);

export default router;