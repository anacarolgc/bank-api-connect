import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';

export class PaymentMethodController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { type, description, merchantId } = req.body;

      const paymentMethod = await prisma.paymentMethod.create({
        data: {
          type,
          description,
          merchantId,
        },
      });

      res.status(201).json(paymentMethod);
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { merchantId } = req.query;

      const where = merchantId ? { merchantId: merchantId as string } : {};

      const paymentMethods = await prisma.paymentMethod.findMany({
        where,
        include: {
          merchant: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              payments: true,
            },
          },
        },
      });

      res.json(paymentMethods);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const paymentMethod = await prisma.paymentMethod.findUnique({
        where: { id },
        include: {
          merchant: true,
          _count: {
            select: {
              payments: true,
            },
          },
        },
      });

      if (!paymentMethod) {
        return res.status(404).json({ error: 'Método de pagamento não encontrado' });
      }

      res.json(paymentMethod);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { type, description } = req.body;

      const paymentMethod = await prisma.paymentMethod.update({
        where: { id },
        data: { type, description },
      });

      res.json(paymentMethod);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      await prisma.paymentMethod.delete({
        where: { id },
      });

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}