import { User } from './../models/user';
import { NextFunction, Request, Response } from 'express';

export default function verifyCookies(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.cookies['auth']) {
    next();
  } else {
    res.redirect('/login');
  }
}

export function verifyUserAccountStatus(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user: User = req.cookies['auth']['user'];
  if (user.isActive) {
    next();
  } else {
    res.redirect('/unauthorized');
  }
} 