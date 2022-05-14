import { User } from './../models/user';
import express, { Request, Response } from 'express';
import verifyCookies, { verifyUserAccountStatus } from '../middlewares/verifyCookies';
import repository from '../repositories/user';
import { signUp, deleteAccountById, signUpV2 } from '../auth';
import { createUser } from '../models/user';
import multer from 'multer';
import EventEmitter from 'events';
import { readExcelFile } from '../excelStudents';
import { notify } from '../pusher';

const storage = multer.memoryStorage();
const upload = multer({ storage });
const router = express.Router();

const eventEmitter = new EventEmitter();

//Importing excel file process
eventEmitter.on('import', async (buffer: Buffer) => {
	try {
		await notify('importing', { status: 'loading' });
		const students = await readExcelFile(buffer, 'student');

		const studentsWithSameEmail = students.filter(student => {
			const sameEmail = students.filter(student2 => student2.email === student.email);
			return sameEmail.length > 1;
		});

		if (studentsWithSameEmail.length > 0) {
			eventEmitter.emit('error', 'There are students with same email');
			return;
		}

		eventEmitter.emit('authenticate-students', students);
	} catch (e: any) {
		eventEmitter.emit('error', e.message);
	}
});

eventEmitter.on('authenticate-students', async (students: User[]) => {
	let emitValue = true;
	students.forEach(async student => {
		try {
			const authRecord = await signUpV2(student.email, student.password, 'student', student);
			student.id = authRecord.uid;
			await repository.save(student);
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
	if (!req.file) return res.redirect('/students');

	const fileExtension = req.file.originalname.split('.').pop();

	if (fileExtension !== 'xlsx' && fileExtension !== 'xls') {
		return res.redirect('/students');
	}

	eventEmitter.emit('import', req.file.buffer);

	return res.redirect('/students');
});

router.get('/', verifyCookies, verifyUserAccountStatus, async (req: Request, res: Response) => {
	const user = req.cookies['auth']['user'];
	let students = await repository.fetchAllByType('student');

	students = students.map(student => {
		return {
			...student,
			deletePath: `/students/delete?id=${student.id}`,
			editPath: `/students/${student.id}`,
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
