import { Router } from 'express';
import { PaymentController } from '../controllers/paymentcontroller';
import { authenticate } from '../middleware/auth';
import { body } from 'express-validator';

const router = Router();
const controller = new PaymentController();

const createValidation = [
  body('amount').isFloat({ min: 0.01 }).withMessage('Valor inválido'),
  body('currency').isIn(['BRL', 'USD', 'EUR']).withMessage('Moeda inválida'),
  body('merchantId').notEmpty().withMessage('Merchant ID é obrigatório'),
];

router.use(authenticate);

router.post('/', createValidation, controller.create);
router.get('/', controller.getAll);
router.get('/my-payments', controller.getByUser);
router.get('/merchant/:merchantId', controller.getByMerchant);
router.get('/:id', controller.getById);
router.patch('/:id/status', controller.updateStatus);
router.delete('/:id', controller.delete);

export default router;