import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';

export class WebhookController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, merchantId, eventType } = req.query;

      const where: any = {};
      if (status) where.status = status;
      if (merchantId) where.merchantId = merchantId;
      if (eventType) where.eventType = eventType;

      const webhooks = await prisma.webhookEvent.findMany({
        where,
        include: {
          merchant: {
            select: {
              id: true,
              name: true,
            },
          },
          payment: {
            select: {
              id: true,
              amount: true,
              status: true,
            },
          },
          attempts: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      res.json(webhooks);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const webhook = await prisma.webhookEvent.findUnique({
        where: { id },
        include: {
          merchant: true,
          payment: true,
          attempts: {
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      });

      if (!webhook) {
        return res.status(404).json({ error: 'Webhook não encontrado' });
      }

      res.json(webhook);
    } catch (error) {
      next(error);
    }
  }

  async retry(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const webhook = await prisma.webhookEvent.update({
        where: { id },
        data: {
          status: 'RETRYING',
          nextAttemptAt: new Date(),
        },
      });

      res.json(webhook);
    } catch (error) {
      next(error);
    }
  }

  async createAttempt(req: Request, res: Response, next: NextFunction) {
    try {
      const { webhookEventId, status, responseCode, responseBody } = req.body;

      const attempt = await prisma.webhookAttempt.create({
        data: {
          webhookEventId,
          status,
          responseCode,
          responseBody,
        },
      });

      // Atualizar status do webhook baseado na tentativa
      const webhookStatus = status === 'SUCCESS' ? 'SUCCESS' : 'FAILED';
      await prisma.webhookEvent.update({
        where: { id: webhookEventId },
        data: { status: webhookStatus },
      });

      res.status(201).json(attempt);
    } catch (error) {
      next(error);
    }
  }

  async getAttempts(req: Request, res: Response, next: NextFunction) {
    try {
      const { webhookEventId } = req.params;

      const attempts = await prisma.webhookAttempt.findMany({
        where: { webhookEventId },
        orderBy: {
          createdAt: 'desc',
        },
      });

      res.json(attempts);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      await prisma.webhookEvent.delete({
        where: { id },
      });

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}