import mongoose from "mongoose";
import cron from 'node-cron';
import express, { Application, Request, Response } from 'express';
import morgan from 'morgan';
import dotenv from 'dotenv-safe';
import chalk from 'chalk';
import Path from 'path';
import cookieParser from 'cookie-parser';
import verifyCookies, { verifyUserAccountStatus } from './middlewares/verifyCookies';
import './firebase';
import { synchronize } from "./data-sync";
import studentRouter from './routers/students';
import teacherRouter from './routers/teachers';
import filesRouter from './routers/files';

import repository from './repositories/user';

dotenv.config(); 
console.log(process.env.MONGO_DB_URL);

const app: Application = express();

app.set('views', Path.join(__dirname, './views'));
app.set('view engine', 'ejs');
app.use(express.static(Path.join(__dirname, './public')));
app.use(express.static(__dirname + '/public'));
app.use(express.json());
app.use(morgan('dev'));
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

app.use('/students', studentRouter);
app.use('/teachers', teacherRouter);
app.use('/files', filesRouter);


mongoose.connect(process.env.MONGO_DB_URL ?? "")
  .then(() => console.log('Connection has been established successfully'))
  .catch(() => console.log('Unable to connect to mongodb'));

app.get(
  '/',
  verifyCookies,
  verifyUserAccountStatus,
  (req: Request, res: Response) => {
    const user = req.cookies['auth']['user'];
    res.render('index', { user });
  }
);

app.get('/login', (req: Request, res: Response) => {
  if (req.cookies['auth']) {
    res.redirect('/');
  } else {
    res.render('login');
  }
});

app.get('/test', async (_req: Request, res: Response) => {
  await repository.save({
    id: '1',
    firstName: 'blampert',
    lastName: 'swampert',
    email: 'blampert@gmail.com',
    password: 'ilovepotatoes123',
    isActive: true,
    address: 'acahualinca',
    type: 'student',
    city: 'Managua',
    level: 5,
    birthDate: new Date(Date.now()),
  });
  
  const users = await repository.fetchAllByType('student');
  return res.status(200).json(users);
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

cron.schedule('*/0.5 * * * *', async () => {
  await synchronize();
});


app.listen(process.env.PORT, () => {
  console.log(
    chalk.blue(`Server up and running on http:localhost:${process.env.PORT} ✔`)
  );
});
