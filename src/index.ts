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
import moderatorRouter from './routers/moderators';
import adminRouter from './routers/admins';
import forumRouter from './routers/forum';
import filesRouter from './routers/files';
import repository from './repositories/user';
import { AddressInfo } from 'net';
import fileRepository from './repositories/file';
import cors from 'cors';
import { getSurveys, getFormById as getForm } from './models/survey';
import passport from 'passport';
import session from 'express-session';
import { getOAuth2Credentials, isTokenValid, renewToken } from './passport.config';

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

app.use(
  session({
    secret: 'this_is_a_secret',
    resave: true,
    saveUninitialized: true,
    rolling: true, // forces resetting of max age
    cookie: {
      maxAge: 360000,
      secure: false, // this should be true only when you don't want to show it for security reason
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use('/students', studentRouter);
app.use('/moderators', moderatorRouter);
app.use('/admins', adminRouter);
app.use('/teachers', teacherRouter);
app.use('/files', filesRouter);
app.use('/forum', forumRouter);

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

app.get(
  '/google',
  passport.authenticate('google', {
    scope: [
      'profile',
      'email',
      'https://www.googleapis.com/auth/drive',
      ' https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/drive.readonly',
      'https://www.googleapis.com/auth/forms.body',
    ],
  })
);

app.get(
  '/callback',
  passport.authenticate('google', {
    failureRedirect: '/failed',
  }),
  function (req: Request, res: Response) {
    res.redirect('/');
  }
);

app.get('/failed', (req: Request, res: Response) => {
  res.send('Failed');
});

app.get('/success', async (req: Request, res: Response) => {
  const questions = await getForm('1IPzUL0kl5R35zfAIIlWSYNyBKZo4Kadsmt6EaShD4y8');
  console.log(questions);
  return res.send(req.session);
});

app.get('/google/logout', (req: Request, res: Response) => {
  return res.send(req.session);
});

app.get('/privacy', (_req: Request, res: Response) => {
  return res.render('privacy');
});

app.get('/surveys', async (req: Request, res: Response) => {
  const credentials = getOAuth2Credentials();
  if (await isTokenValid(credentials.token)) {
    return res.redirect('/google');
  }
  const surveys = await getSurveys('1IPzUL0kl5R35zfAIIlWSYNyBKZo4Kadsmt6EaShD4y8');
  const user = req.cookies['auth']['user'];

  console.log(surveys);

  return res.render('surveys', { user, surveys: JSON.stringify(surveys) });
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
  const isUserAllowedToLogin = user && (user.type === 'admin' || user.type === 'moderator');

  if (isUserAllowedToLogin) {
    console.log('LOGIN SUCCESS :D');
    res.cookie('auth', { user });
    return res.redirect('/');
  }
  console.error('---->> This user is not allowed to Login or it doesnt exist. <<----');
  return res.redirect('/login');
});

app.get('/logout', (req: Request, res: Response) => {
  if (req.cookies['auth']) {
    res.clearCookie('auth');
    res.redirect('/login');
  }
  // res.redirect('/login');
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

app.get('/test', async (req: Request, res: Response) => {
  const credentials = getOAuth2Credentials();
  const success = await isTokenValid(credentials.token);
  const newToken = await renewToken(credentials.refreshToken);

  return res.status(200).json({
    is_valid: success,
    token: newToken,
  });
});

const server = app.listen(process.env.PORT, () => {
  const { address, port } = server.address() as AddressInfo;
  console.log(chalk.blue(`Server up and running on http://${address}:${port} 🚀`));
});

console.table(dotEnvResult.parsed);
