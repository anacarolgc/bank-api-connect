import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', error);

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Erros conhecidos do Prisma
    switch (error.code) {
      case 'P2002':
        return res.status(409).json({
          error: 'Registro duplicado',
          field: error.meta?.target,
        });
      case 'P2025':
        return res.status(404).json({
          error: 'Registro não encontrado',
        });
      default:
        return res.status(400).json({
          error: 'Erro de banco de dados',
          code: error.code,
        });
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({
      error: 'Dados inválidos',
    });
  }

  // Erro genérico
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? error.message : undefined,
  });
};