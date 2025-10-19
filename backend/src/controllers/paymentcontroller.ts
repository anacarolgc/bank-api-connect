import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';

export class PaymentController {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { amount, currency, merchantId, paymentMethodId, qrId } = req.body;
      const userId = req.userId!;

      const payment = await prisma.payment.create({
        data: {
          amount,
          currency,
          merchantId,
          userId,
          paymentMethodId,
          qrId,
        },
        include: {
          merchant: true,
          paymentMethod: true,
          qrPayment: true,
        },
      });

      // Criar evento de webhook
      await prisma.webhookEvent.create({
        data: {
          eventType: 'payment.created',
          payload: payment,
          merchantId,
          paymentId: payment.id,
        },
      });

      res.status(201).json(payment);
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, merchantId, startDate, endDate } = req.query;

      const where: any = {};

      if (status) where.status = status;
      if (merchantId) where.merchantId = merchantId;
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate as string);
        if (endDate) where.createdAt.lte = new Date(endDate as string);
      }

      const payments = await prisma.payment.findMany({
        where,
        include: {
          merchant: {
            select: {
              id: true,
              name: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          paymentMethod: true,
          qrPayment: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      res.json(payments);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const payment = await prisma.payment.findUnique({
        where: { id },
        include: {
          merchant: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          paymentMethod: true,
          qrPayment: true,
          webhookEvents: true,
        },
      });

      if (!payment) {
        return res.status(404).json({ error: 'Pagamento não encontrado' });
      }

      res.json(payment);
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const payment = await prisma.payment.update({
        where: { id },
        data: { status },
        include: {
          merchant: true,
        },
      });

      // Criar evento de webhook
      await prisma.webhookEvent.create({
        data: {
          eventType: `payment.${status.toLowerCase()}`,
          payload: payment,
          merchantId: payment.merchantId,
          paymentId: payment.id,
        },
      });

      res.json(payment);
    } catch (error) {
      next(error);
    }
  }

  async getByMerchant(req: Request, res: Response, next: NextFunction) {
    try {
      const { merchantId } = req.params;

      const payments = await prisma.payment.findMany({
        where: { merchantId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          paymentMethod: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      res.json(payments);
    } catch (error) {
      next(error);
    }
  }

  async getByUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;

      const payments = await prisma.payment.findMany({
        where: { userId },
        include: {
          merchant: {
            select: {
              id: true,
              name: true,
            },
          },
          paymentMethod: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      res.json(payments);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      await prisma.payment.delete({
        where: { id },
      });

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}