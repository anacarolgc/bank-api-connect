import { Request, Response, NextFunction } from 'express';
import { randomBytes } from 'crypto';
import prisma from '../config/database';

export class QrPaymentController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { amount, merchantId, expiresInMinutes = 30 } = req.body;

      const codeString = randomBytes(16).toString('hex');
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + expiresInMinutes);

      const qrPayment = await prisma.qrPayment.create({
        data: {
          codeString,
          amount,
          merchantId,
          expiresAt,
        },
        include: {
          merchant: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      res.status(201).json(qrPayment);
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, merchantId } = req.query;

      const where: any = {};
      if (status) where.status = status;
      if (merchantId) where.merchantId = merchantId;

      const qrPayments = await prisma.qrPayment.findMany({
        where,
        include: {
          merchant: {
            select: {
              id: true,
              name: true,
            },
          },
          payment: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      res.json(qrPayments);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const qrPayment = await prisma.qrPayment.findUnique({
        where: { id },
        include: {
          merchant: true,
          payment: true,
        },
      });

      if (!qrPayment) {
        return res.status(404).json({ error: 'QR Payment não encontrado' });
      }

      res.json(qrPayment);
    } catch (error) {
      next(error);
    }
  }

  async getByCode(req: Request, res: Response, next: NextFunction) {
    try {
      const { code } = req.params;

      const qrPayment = await prisma.qrPayment.findUnique({
        where: { codeString: code },
        include: {
          merchant: {
            select: {
              id: true,
              name: true,
            },
          },
          payment: true,
        },
      });

      if (!qrPayment) {
        return res.status(404).json({ error: 'QR Code não encontrado' });
      }

      // Verificar se expirou
      if (new Date() > qrPayment.expiresAt) {
        await prisma.qrPayment.update({
          where: { id: qrPayment.id },
          data: { status: 'EXPIRED' },
        });
        return res.status(400).json({ error: 'QR Code expirado' });
      }

      res.json(qrPayment);
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const qrPayment = await prisma.qrPayment.update({
        where: { id },
        data: { status },
      });

      res.json(qrPayment);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      await prisma.qrPayment.delete({
        where: { id },
      });

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}