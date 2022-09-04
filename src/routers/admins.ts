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
	res.render('Forms/addAdminForm', { user });

});

router.get('/:id', verifyCookies, verifyUserAccountStatus, async (req: Request, res: Response) => {

	const id = req.params.id;
	const user = await repository.findByIdAndType(id, 'admin');

	if (user === undefined) {
		return res.status(404).json({ message: 'The requested resource was not found', status: 404, type: 'not_found' });
	}
	res.render('editAdminForm', { user });
});

router.post('/', async (req: Request, res: Response) => {

	await signUp(req.body.email, req.body.password, 'admin', req.body);
	res.redirect('/admins');

});

router.post('/delete', async (req: Request, res: Response) => {

	const id = <string>req.query.id;
	await repository.deleteById(id);
	await deleteAccountById(id);
	res.redirect('/admins');

});

router.post('/:id', verifyCookies, verifyUserAccountStatus, async (req: Request, res: Response) => {

	const id = req.params.id;
	const userInfo = createUser(id, 'admin', req.body);
	await repository.update(id, userInfo);
	return res.redirect('/admins');
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
		const filteredAdmins = await repository.findByQuery(query, 'admin');
		return res.render('admins', { user, admins: filteredAdmins });
	}

	let admins = await repository.fetchAllByType('admin');

	admins = admins.map(admin => {
		return {
			...admin,
			deletePath: `/admins/delete?id=${admin.id}`,
			editPath: `/admins/${admin.id}`
		};
	});

	res.render('admins', { user, admins });
});

export default router;