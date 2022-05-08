import express, { Request, Response } from 'express';
import verifyCookies, { verifyUserAccountStatus } from '../middlewares/verifyCookies';

import repository from '../repositories/user';
import { signUp, deleteAccountById } from '../auth';
import { createUser } from '../models/user';
import { nanoid } from 'nanoid';

const router = express.Router();

router.get('/', verifyCookies, verifyUserAccountStatus, async (req: Request, res: Response) => {

  const user = req.cookies['auth']['user'];
  let students = await repository.fetchAllByType('student');

  students = students.map(student => {

    return {
      ...student,
      deletePath: `/students/delete?id=${student.id}`,
      editPath: `/students/${student.id}`
    };
  });

  res.render('students', { user, students });
});

router.post('/delete', async (req: Request, res: Response) => {

  const id = <string>req.query.id;
  console.log('Given ID: ' + id);
  await repository.deleteById(id);
  await deleteAccountById(id);
  return res.redirect('/students');

});

router.post('/:id', verifyCookies, verifyUserAccountStatus, async (req: Request, res: Response) => {

  const id = req.params.id;
  const userInfo = createUser(id, 'student', req.body);
  await repository.update(id, userInfo);
  return res.redirect('/students');
});

router.get('/add', verifyCookies, verifyUserAccountStatus, (req: Request, res: Response) => {

  const user = req.cookies['auth']['user'];
  res.render('addStudentForm', { user });

});

router.get('/edit', verifyCookies, verifyUserAccountStatus, (req: Request, res: Response) => {

  const user = req.cookies['auth']['user'];
  res.render('editStudentForm', { user });

});

router.get('/:id', verifyCookies, verifyUserAccountStatus, async (req: Request, res: Response) => {

  const id = req.params.id;
  const user = await repository.findByIdAndType(id, 'student');

  if (user === undefined) {

    return res.status(404).json({ message: 'The requested resource was not found', status: 404, type: 'not_found' });

  }

  res.render('editStudentForm', { user });

});

router.post('/', async (req: Request, res: Response) => {

  await signUp(req.body.email, req.body.password, 'student', req.body);
  return res.redirect('/students');
});

export default router;
