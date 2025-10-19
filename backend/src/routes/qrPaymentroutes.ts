import { Router } from 'express';
import { QrPaymentController } from '../controllers/qrPaymentcontroller';
import { authenticate } from '../middleware/auth';
import { body } from 'express-validator';

const router = Router();
const controller = new QrPaymentController();

const createValidation = [
  body('amount').isFloat({ min: 0.01 }).withMessage('Valor inválido'),
  body('merchantId').notEmpty().withMessage('Merchant ID é obrigatório'),
];

router.use(authenticate);

router.post('/', createValidation, controller.create);
router.get('/', controller.getAll);
router.get('/code/:code', controller.getByCode);
router.get('/:id', controller.getById);
router.patch('/:id/status', controller.updateStatus);
router.delete('/:id', controller.delete);

export default router;