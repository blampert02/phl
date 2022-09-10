import { User } from '../models/user';
import express, { Request, Response } from 'express';
import verifyCookies, { verifyUserAccountStatus } from '../middlewares/verifyCookies';
import repository from '../repositories/user';
import { signUp, deleteAccountById, signUpV2 } from '../auth';
import { createUser } from '../models/user';
import multer from 'multer';


const storage = multer.memoryStorage();
const upload = multer({ storage });
const router = express.Router();



router.get('/add', verifyCookies, verifyUserAccountStatus, (req: Request, res: Response) => {

	const user = req.cookies['auth']['user'];
	res.render('Forms/addModeratorForm', { user });

});

router.get('/:id', verifyCookies, verifyUserAccountStatus, async (req: Request, res: Response) => {

	const id = req.params.id;
	const user = await repository.findByIdAndType(id, 'moderator');

	if (user === undefined) {
		return res.status(404).json({ message: 'The requested resource was not found', status: 404, type: 'not_found' });
	}
	res.render('Forms/editModeratorForm', { user });
});

router.post('/', async (req: Request, res: Response) => {

	await signUp(req.body.email, req.body.password, 'moderator', req.body);
	res.redirect('/moderators');

});

router.post('/delete', async (req: Request, res: Response) => {

	const id = <string>req.query.id;
	await repository.deleteById(id);
	await deleteAccountById(id);
	res.redirect('/moderators');

});

router.post('/:id', verifyCookies, verifyUserAccountStatus, async (req: Request, res: Response) => {

	const id = req.params.id;
	const userInfo = createUser(id, 'moderator', req.body);
	await repository.update(id, userInfo);
	return res.redirect('/moderators');
});

router.get('/:id', verifyCookies, verifyUserAccountStatus, async (req: Request, res: Response) => {

	const id = req.params.id;
	const user = await repository.findById(id);

	if (user === undefined) {

		return res.status(404).json({ message: 'The requested resource was not found', status: 404, type: 'not_found' });
	}
	return res.status(200).json(user);
});

router.get('/', verifyCookies, verifyUserAccountStatus, async (req: Request, res: Response) => {
	const query = <string>req.query.search;
	const user = req.cookies['auth']['user'];
	
	if (query) {
		const filteredModerators = await repository.findByQuery(query, 'moderator');
		return res.render('moderators', { user, moderators: filteredModerators });
	}

	let moderators = await repository.fetchAllByType('moderator');

	moderators = moderators.map(moderator => {
		return {
			...moderator,
			deletePath: `/moderators/delete?id=${moderator.id}`,
			editPath: `/moderators/${moderator.id}`
		};
	});

	res.render('moderators', { user, moderators });
});

export default router;