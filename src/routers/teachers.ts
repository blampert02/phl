import { User } from './../models/user';
import express, { Request, Response } from 'express';
import verifyCookies, { verifyUserAccountStatus } from '../middlewares/verifyCookies';
import { createUser } from '../models/user';
import repository from '../repositories/user';
import { signUp, deleteAccountById, signUpV2 } from '../auth';
import EventEmitter from 'events';
import { readExcelFile } from '../excelTeachers';
import { notify } from '../pusher';
import multer from 'multer';

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });
const eventEmitter = new EventEmitter();

//Importing excel file process

eventEmitter.on('import', async (buffer: Buffer) => {
	try {
		await notify('importing', { status: 'loading' });
		const teachers = await readExcelFile(buffer, 'teacher');

		const teachersWithSameEmail = teachers.filter(teacher => {
			const sameEmail = teachers.filter(teacher2 => teacher2.email === teacher.email);
			return sameEmail.length > 1;
		});

		if (teachersWithSameEmail.length > 0) {
			eventEmitter.emit('error', 'There are teachers with same email');
			return;
		}

		eventEmitter.emit('authenticate-teachers', teachers);
	} catch (e: any) {
		eventEmitter.emit('error', e.message);
	}
});

eventEmitter.on('authenticate-teachers', async (teachers: User[]) => {
	let emitValue = true;
	teachers.forEach(async teacher => {
		try {
			const authRecord = await signUpV2(teacher.email, teacher.password, 'teacher', teacher);
			teacher.id = authRecord.uid;
			await repository.save(teacher);
		} catch (e: any) {
			if (emitValue) {
				eventEmitter.emit('error', e.message);
			}
			emitValue = false;
		}
	});
	await notify('importing', { status: 'done' });
});

eventEmitter.on('error', async (message: string) => {
	await notify('importing', { status: 'error', message });
	console.log('An error has occurred:', message);
});

router.post('/excel', upload.single('file_data'), async (req: Request, res: Response) => {
	if (!req.file) return res.redirect('/teachers');

	const fileExtension = req.file.originalname.split('.').pop();

	if (fileExtension !== 'xlsx' && fileExtension !== 'xls') {
		return res.redirect('/teachers');
	}

	eventEmitter.emit('import', req.file.buffer);

	return res.redirect('/teachers');
});

router.get('/add', verifyCookies, verifyUserAccountStatus, (req: Request, res: Response) => {

	const user = req.cookies['auth']['user'];
	res.render('Forms/addTeachersForm', { user });

});

router.get('/:id', verifyCookies, verifyUserAccountStatus, async (req: Request, res: Response) => {

	const id = req.params.id;
	const user = await repository.findByIdAndType(id, 'teacher');

	if (user === undefined) {
		return res.status(404).json({ message: 'The requested resource was not found', status: 404, type: 'not_found' });
	}
	res.render('Forms/editTeacherForm', { user });
});

router.post('/', async (req: Request, res: Response) => {

	await signUp(req.body.email, req.body.password, 'teacher', req.body);
	res.redirect('/teachers');

});

router.post('/delete', async (req: Request, res: Response) => {

	const id = <string>req.query.id;
	await repository.deleteById(id);
	await deleteAccountById(id);
	res.redirect('/teachers');

});

router.post('/:id', verifyCookies, verifyUserAccountStatus, async (req: Request, res: Response) => {

	const id = req.params.id;
	const userInfo = createUser(id, 'teacher', req.body);
	await repository.update(id, userInfo);
	return res.redirect('/teachers');
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
		const filteredTeachers = await repository.findByQuery(query, 'teacher');
		return res.render('teachers', { user, teachers: filteredTeachers });
	}

	let teachers = await repository.fetchAllByType('teacher');

	teachers = teachers.map(teacher => {
		return {
			...teacher,
			deletePath: `/teachers/delete?id=${teacher.id}`,
			editPath: `/teachers/${teacher.id}`
		};
	});

	res.render('teachers', { user, teachers });
});

export default router;
