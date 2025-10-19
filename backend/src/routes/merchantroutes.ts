import { Router } from 'express';
import { MerchantController } from '../controllers/merchantcontroller';
import { authenticate } from '../middleware/auth';
import { body } from 'express-validator';

const router = Router();
const controller = new MerchantController();

const createValidation = [
  body('name').notEmpty().withMessage('Nome é obrigatório'),
];

router.use(authenticate);

router.post('/', createValidation, controller.create);
router.get('/', controller.getAll);
router.get('/my-merchants', controller.getByUser);
router.get('/:id', controller.getById);
router.put('/:id', controller.update);
router.post('/:id/regenerate-api-key', controller.regenerateApiKey);
router.delete('/:id', controller.delete);

export default router;