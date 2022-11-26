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
	const newsId = req.body.id ?? nanoid();

	let mediaUrl = undefined;

	if (req.file) {
		await bucket.upload(req.file.path, {
			destination: `storage/${req.file.originalname}`,
		});
		
		const fileRef = bucket.file(`storage/${req.file.originalname}`);
		await fileRef.makePublic();
		mediaUrl = fileRef.publicUrl();
	}

	const newsInfo: any = {
        id: newsId,
        title: req.body.title,
        postContent: req.body.postContent,
        media: mediaUrl ?? "", 
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

router.get('/:id', verifyCookies, verifyUserAccountStatus, async(req: Request, res: Response)=>{
	const id = req.params.id;
	const news = await repository.findById(id);

	if (news === undefined) {
		return res.status(404).json({ message: 'The requested resource was not found', status: 404, type: 'not_found' });
	}

	res.render('Forms/editNews', { user, news });
});

	return res.render('news', { user, news });
});


export default router;
