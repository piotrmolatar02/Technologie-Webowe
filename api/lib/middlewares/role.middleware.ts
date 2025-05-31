import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const permit = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) return res.status(403).json({ error: 'Access denied' });

      const payload: any = jwt.verify(token, process.env.JWT_SECRET!);

      if (!allowedRoles.includes(payload.role)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      next();
    } catch (err) {
      console.error('Authorization error:', err.message);
      return res.status(401).json({ error: 'Unauthorized' });
    }
  };
};
