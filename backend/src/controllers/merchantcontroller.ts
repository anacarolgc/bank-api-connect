import { Request, Response, NextFunction } from 'express';
import { randomBytes } from 'crypto';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';

export class MerchantController {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { name } = req.body;
      const userId = req.userId!;

      const apiKey = randomBytes(32).toString('hex');

      const merchant = await prisma.merchant.create({
        data: {
          name,
          apiKey,
          userId,
        },
      });

      res.status(201).json(merchant);
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const merchants = await prisma.merchant.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          _count: {
            select: {
              payments: true,
              methods: true,
              qrPayments: true,
            },
          },
        },
      });

      res.json(merchants);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const merchant = await prisma.merchant.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          methods: true,
          _count: {
            select: {
              payments: true,
              qrPayments: true,
              webhooks: true,
            },
          },
        },
      });

      if (!merchant) {
        return res.status(404).json({ error: 'Merchant não encontrado' });
      }

      res.json(merchant);
    } catch (error) {
      next(error);
    }
  }

  async getByUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;

      const merchants = await prisma.merchant.findMany({
        where: { userId },
        include: {
          _count: {
            select: {
              payments: true,
              methods: true,
              qrPayments: true,
            },
          },
        },
      });

      res.json(merchants);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { name } = req.body;

      const merchant = await prisma.merchant.update({
        where: { id },
        data: { name },
      });

      res.json(merchant);
    } catch (error) {
      next(error);
    }
  }

  async regenerateApiKey(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const apiKey = randomBytes(32).toString('hex');

      const merchant = await prisma.merchant.update({
        where: { id },
        data: { apiKey },
      });

      res.json(merchant);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      await prisma.merchant.delete({
        where: { id },
      });

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}