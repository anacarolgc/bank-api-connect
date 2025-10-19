import { Router } from 'express';
import { PaymentMethodController } from '../controllers/paymentMethodcontroller';
import { authenticate } from '../middleware/auth';
import { body } from 'express-validator';

const router = Router();
const controller = new PaymentMethodController();

const createValidation = [
  body('type').notEmpty().withMessage('Tipo é obrigatório'),
  body('merchantId').notEmpty().withMessage('Merchant ID é obrigatório'),
];

router.use(authenticate);

router.post('/', createValidation, controller.create);
router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

export default router;