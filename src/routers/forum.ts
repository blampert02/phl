import express, { Request, Response } from 'express';
import verifyCookies, { verifyUserAccountStatus } from '../middlewares/verifyCookies';
import repository from '../repositories/forum';
import repositoryUser from '../repositories/user';

const router = express.Router();

router.get('/', verifyCookies, verifyUserAccountStatus, async (req: Request, res: Response) => {
  const user = req.cookies['auth']['user'];
  let posts = await repository.fetchPosts();

  res.render('forum', { user, posts });
});

router.post('/delete', async (req: Request, res: Response) => {
  const id = <string>req.body.id;
  await repository.deleteById(id);

  res.redirect('/forum');
});

router.post('/messages/delete', async (req: Request, res: Response) => {
  console.log('POST!!!');
  const messageId = <string>req.body.id;
  const postId = <string>req.body.postId;
  console.log('RECEIVED', req.body);
  await repository.deleteMessageById(postId, messageId);

  res.redirect('/forum');
});


export default router;
