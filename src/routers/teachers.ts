import express, { Request, Response } from 'express';
import verifyCookies, {
  verifyUserAccountStatus,
} from '../middlewares/verifyCookies';

import repository from '../repositories/user';
import { signUp, deleteAccountById } from '../auth';

const router = express.Router();

router.get(
  '/add',
  verifyCookies,
  verifyUserAccountStatus,
  (req: Request, res: Response) => {
    const user = req.cookies['auth']['user'];
    res.render('addTeachersForm', { user });
  }
);

router.get(
  '/:id',
  verifyCookies,
  verifyUserAccountStatus,
  async (req: Request, res: Response) => {
    const id = req.params.id;
    const user = await repository.findByIdAndType(id, 'teacher');

    if (user === undefined) {
      return res.status(404).json({
        message: 'The requested resource was not found',
        status: 404,
        type: 'not_found',
      });
    }

    res.render('editTeachertForm', { user });
  }
);

router.post('/', async (req: Request, res: Response) => {
  await signUp(req.body.email, req.body.password, 'teacher', req.body);
  res.redirect('/teachers');
});

router.post('/delete', async (req: Request, res: Response) => {
  const id = <string> req.query.id;
  await repository.deleteById(id);
  await deleteAccountById(id);
  res.redirect('/teachers');
});

router.get(
  '/:id',
  verifyCookies,
  verifyUserAccountStatus,
  async (req: Request, res: Response) => {
    const id = req.params.id;
    const user = await repository.findById(id);

    if (user === undefined) {
      return res.status(404).json({
        message: 'The requested resource was not found',
        status: 404,
        type: 'not_found',
      });
    }

    // if (user.type === 'student') {
    //   return res.redirect(`/students/${user.id}`);
    // }

    return res.status(200).json(user);
  }
);

router.get(
  '/',
  verifyCookies,
  verifyUserAccountStatus,
  async (req: Request, res: Response) => {
    const user = req.cookies['auth']['user'];
    let teachers = await repository.fetchAllByType('teacher');

    teachers = teachers.map(teacher => {
      return {
        ...teacher,
        deletePath: `/teachers/delete?id=${teacher.id}`,
        editPath: `/students/${teacher.id}`,
      };
    });

    res.render('teachers', {
      user,
      teachers,
    });
  }
);

export default router;
