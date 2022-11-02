
import express, { Request, Response } from 'express';
import verifyCookies, { verifyUserAccountStatus } from '../middlewares/verifyCookies';
import repository from '../repositories/news';
import multer from 'multer';
import firebaseAdmin from '../firebase';
import { nanoid } from 'nanoid';

const router = express.Router();
const upload = multer({ dest: './files' });
const bucket = firebaseAdmin.storage().bucket();

router.get('/add', verifyCookies, verifyUserAccountStatus, (req: Request, res: Response) => {
	const user = req.cookies['auth']['user'];

	res.render('Forms/addNews', { user });
});


router.post('/', upload.single('file_data'), verifyCookies, verifyUserAccountStatus, async (req: Request, res: Response) => {
	const user = req.cookies['auth']['user'];

	if (req.file === undefined) {
		console.log('Me sali :D');
		
		return res.redirect('/news');
	}
	// Upload the file to the firebase storage
	await bucket.upload(req.file.path, {
		destination: `storage/${req.file.originalname}`,
	});

	const fileRef = bucket.file(`storage/${req.file.originalname}`);
	await fileRef.makePublic();

	const newsInfo = {
        id: nanoid(),
        title: req.body.title,
        postContent: req.body.postContent,
        media: fileRef.publicUrl(), 
        postedTime: new Date(),
        sender_firstName: user.firstName,
        sender_lastName:user.lastName,
      };

	await repository.update(newsInfo);

	return res.redirect('/news');
});

router.post('/delete', async (req: Request, res: Response) => {
	const id = <string>req.query.id;
	await repository.deleteById(id);
	return res.redirect('/news');
});


router.get('/', verifyCookies, verifyUserAccountStatus, async (req: Request, res: Response) => {
	const user = req.cookies['auth']['user'];
	let news = await repository.fetchAll(); 

	news = news.map(newItem => {
		return {
			...newItem,
			deletePath: `/news/delete?id=${newItem.id}`,
			editPath: `/news/${newItem.id}`,
		};
	});

	return res.render('news', { user, news });
});


export default router;
