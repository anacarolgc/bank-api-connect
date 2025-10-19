import { Router } from 'express';
import { UserController } from '../controllers/usercontroller';
import { authenticate } from '../middleware/auth';
import { body } from 'express-validator';

const router = Router();
const controller = new UserController();

// Validações
const registerValidation = [
  body('name').notEmpty().withMessage('Nome é obrigatório'),
  body('email').isEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres'),
];

const loginValidation = [
  body('email').isEmail().withMessage('Email inválido'),
  body('password').notEmpty().withMessage('Senha é obrigatória'),
];

// Rotas públicas
router.post('/register', registerValidation, controller.register);
router.post('/login', loginValidation, controller.login);

// Rotas protegidas
router.get('/', authenticate, controller.getAll);
router.get('/:id', authenticate, controller.getById);
router.put('/:id', authenticate, controller.update);
router.delete('/:id', authenticate, controller.delete);

export default router;