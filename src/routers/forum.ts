import express, { Request, Response } from 'express';
import verifyCookies, { verifyUserAccountStatus } from '../middlewares/verifyCookies';
import repository from '../repositories/forum';
import { Message } from '../models/forum'
import { nanoid } from 'nanoid';

const router = express.Router();

router.get('/', verifyCookies, verifyUserAccountStatus, async (req: Request, res: Response) => {
  const user = req.cookies['auth']['user'];
  let posts: any[] = await repository.fetchPosts();
  posts.sort((x, y) => {
    return y.timestamp.toDate() - x.timestamp.toDate();
  });
  posts = posts.map(post => {
    return {
      ...post,
      timestamp: post.timestamp.toDate()
    }
  });

  
  res.render('forum', { user, posts });
});

router.post('/delete', async (req: Request, res: Response) => {
  const id = <string>req.body.id;
  await repository.deleteById(id);

  res.redirect('/forum');
});

router.post('/messages/add', async (req: Request, res: Response) =>{
  const user = req.cookies['auth']['user'];
  const postId = <string>req.body.postId;
  const messageId = req.body.id ?? nanoid();

  console.log(req.body);
  

  const messageInfo: Message ={
    id: messageId,
    comment: req.body.comment,
    main_tittle: req.body.main_tittle,
    senderId: user.id, 
    timestamp: new Date(),
    userImage: req.body.userImage,
    sender_firstName: user.firstName,
    sender_lastName:user.lastName,
  };

  await repository.updateMessage(postId, messageInfo);

	return res.redirect('/forum');
});

router.post('/post/add', async (req: Request, res: Response) =>{
  const user = req.cookies['auth']['user'];
  const postId = req.body.id ?? nanoid();
  console.log(req.body);
  
  const postInfo: any ={
    id: postId,
    comment: req.body.comment,
    senderId: user.id, 
    timestamp: new Date(),
    sender_firstName: user.firstName,
    sender_lastName:user.lastName,
  };

  await repository.updatePost(postInfo);

	return res.redirect('/forum');
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
