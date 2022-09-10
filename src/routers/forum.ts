import express, { Request, Response } from 'express';
import verifyCookies, { verifyUserAccountStatus } from '../middlewares/verifyCookies';

const router = express.Router();


router.get('/', verifyCookies, verifyUserAccountStatus, (req: Request, res: Response) => {
    const user = req.cookies['auth']['user'];
    res.render('forum', { user });
  });

export default router;
