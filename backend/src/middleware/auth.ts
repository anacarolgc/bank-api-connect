import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
 
export interface AuthRequest extends Request {
  userId?: string;
  merchantId?: string;
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};

export const authenticateMerchant = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const apiKey = req.headers['x-api-key'] as string;

    if (!apiKey) {
      return res.status(401).json({ error: 'API Key não fornecida' });
    }

    // A validação da API Key será feita no controller
    req.merchantId = apiKey;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'API Key inválida' });
  }
};