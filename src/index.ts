import './firebase';
import mongoose from 'mongoose';
import express, { Application, Request, Response } from 'express';
import morgan from 'morgan';
import dotenv from 'dotenv-safe';
import chalk from 'chalk';
import Path from 'path';
import cookieParser from 'cookie-parser';
import verifyCookies, { verifyUserAccountStatus } from './middlewares/verifyCookies';
import studentRouter from './routers/students';
import teacherRouter from './routers/teachers';
import filesRouter from './routers/files';
import repository from './repositories/user';
import { AddressInfo } from 'net';
import { synchronize } from './data-sync';
import fileRepository from './repositories/file';
import cors from 'cors';

const app = express();

app.set('views', Path.join(__dirname, './views'));
app.set('view engine', 'ejs');
app.use(express.static(Path.join(__dirname, './public')));
app.use(express.static(__dirname + '/public'));
app.use(express.json());
app.use(morgan('dev'));
app.use(cookieParser());
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use('/students', studentRouter);
app.use('/teachers', teacherRouter);
app.use('/files', filesRouter);

const dotEnvResult = dotenv.config();

if (dotEnvResult.error) {
	console.error('The environment variables could not be loaded ❌');
	console.error(dotEnvResult.error.message);
}

console.log('Environment variables has been loaded successfully ✔');

mongoose
	.connect(process.env.MONGO_DB_URL!)
	.then(() => {
		console.log('Connected to MongoDB successfully ✔');
	})
	.catch(e => {
		console.error('Something went wrong during establishing a connection to MongoDB ❌');
		console.error(e.message);
	});

app.get('/', verifyCookies, verifyUserAccountStatus, (req: Request, res: Response) => {
	const user = req.cookies['auth']['user'];
	res.render('index', { user });
});

app.get('/privacy', (_req: Request, res: Response) => {
	return res.render('privacy');
});

app.get('/login', (req: Request, res: Response) => {
	if (req.cookies['auth']) {
		res.redirect('/');
	} else {
		res.render('login');
	}
});

app.post('/authenticate', async (req: Request, res: Response) => {
	const {
		username,
		password,
	}: {
		username: string;
		password: string;
	} = req.body;

	const user = await repository.findByUsernameAndPassword(username, password);

	if (user !== undefined) {
		console.log('LOGIN SUCCESS :D');
		res.cookie('auth', { user });
		return res.redirect('/');
	}
	console.log('LOGIN FAILED :C');

	return res.redirect('/login');
});

app.get('/logout', (req: Request, res: Response) => {
	if (req.cookies['auth']) {
		res.clearCookie('auth');
		res.redirect('/login');
	}

	res.redirect('/login');
});

app.get('/unauthorized', verifyCookies, (req: Request, res: Response) => {
	const user = req.cookies['auth']['user'];

	if (user.isActive) {
		return res.redirect('/');
	}

	return res.render('unauthorized');
});

app.get('/files-all', async (req: Request, res: Response) => {
	const files = await fileRepository.findAll();
	return res.json(files);
});

const server = app.listen(process.env.PORT, () => {
	const { address, port } = server.address() as AddressInfo;
	console.log(chalk.blue(`Server up and running on http://${address}:${port} 🚀`));
});

console.table(dotEnvResult.parsed);
