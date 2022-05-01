import express, { Request, Response } from 'express';
import verifyCookies, {
  verifyUserAccountStatus,
} from '../middlewares/verifyCookies';
import multer from 'multer';
import firebaseAdmin from '../firebase';
import { createDirectory, createFile } from '../models/file'

const upload = multer({ dest: './files' });
const router = express.Router();

const bucket = firebaseAdmin.storage().bucket();

import repository from '../repositories/file';

router.get(
  '/*',
  verifyCookies,
  verifyUserAccountStatus,
  async (req: Request, res: Response) => {
    const user = req.cookies['auth']['user'];
    // Check if the requested path is the root directory
    if(req.path === '/') {
      const directory = await repository.findRootDirectory();
      
      if(directory === undefined) {
        const newDirectory = createDirectory('root', 'root');
        await repository.create('directory', '/', newDirectory);
        return res.redirect('/files');
      }

      const directoryWithContent = await repository.findContentByDirectory(directory);
      
      if(directoryWithContent === undefined) {
        return res.render('documents', { user, directoryId: directory.id, directory: directory, path: req.path });
      }

      return res.render('documents', { user, directoryId: directoryWithContent.id, directory: directoryWithContent, path: req.path });
    }
    console.log('path ->' + req.path);
    const directory = await repository.findDirectoryByPath(req.path);

    // Go the the root direction if the requested was not found
    if(directory === undefined) {
      return res.redirect('/files');
    } 
    
    // Find the content of the found directory
    const directoryWithContent = await repository.findContentByDirectory(directory);

    if(directoryWithContent === undefined) {
      return res.render('documents', { user, directoryId: directory.id, directory, path: req.path });
    }
    console.table(directoryWithContent);
    return res.render('documents', { user, directoryId: directoryWithContent.id, directory: directoryWithContent, path: req.path });
  }
);

router.post('/upload', upload.single('file_data'), async (req: Request, res: Response) => {
  // Check if the item to create is a directory
  if(req.body.type === 'directory') {
    const directory = createDirectory(req.body.name, req.body.parentDirectoryId);
    await repository.create('directory', req.body.path, directory);

    return res.redirect('/files' + req.body.path);
  }

  // Redirect to files page if there is not file
  if(req.file === undefined) {
    return res.redirect('/files');
  }

  // Upload the file to the firebase storage
  const uploadResponse = await bucket.upload(req.file.path, {
    destination: `storage/${req.file.originalname}`
  });

  const fileRef = bucket.file(`storage/${req.file.originalname}`);
  await fileRef.makePublic();

  const file = createFile(req.file.originalname, fileRef.publicUrl(), req.body.parentDirectoryId);
  await repository.create('file', req.body.path, file);
  
  return res.redirect('/files' + req.body.path);
});

router.post('/update', async (req: Request, res: Response) => {
  // Check if the item to create is a directory
  if(req.body.type === 'directory') {
    await repository.update(req.body.name, req.body.id);
    return res.redirect('/files' + req.body.path);
  }

  // Redirect to files page if there is not file
  if(req.file === undefined) {
    return res.redirect('/files');
  }

  // Upload the file to the firebase storage
  const uploadResponse = await bucket.upload(req.file.path, {
    destination: `storage/${req.file.originalname}`
  });

  const fileRef = bucket.file(`storage/${req.file.originalname}`);
  await fileRef.makePublic();

  const file = createFile(req.file.originalname, fileRef.publicUrl(), req.body.parentDirectoryId);
  await repository.create('file', req.body.path, file);
  
  return res.redirect('/files' + req.body.path);
});

router.post('/delete', async (req: Request, res: Response) => {
  if(req.body.type === 'file') {
    const filename = await repository.findNameById(req.body.id);
  
    if (!filename) res.redirect(`files${req.body.path}`);

    console.log(`Found filename: ${filename}`);
    const fileRef = bucket.file(`storage/${filename}`);

    await fileRef.delete();
  }

  await repository.delete(req.body.id);

  return res.redirect(`files${req.body.path}`);
});

export default router;