import express from 'express';

import { login, signup, token } from '../controllers/authController.js'
const router = express.Router();

router.get('/login', (req, res) => { 
  res.send('Login');
});
router.post('/login', login);
router.post('/signup', signup);
router.post('/token', token);

// router.get('/', (req, res) => {
//   const ress = User.create({
//     name: 'John Doe',
//     email: 'doe@gmail.com',
//     password: bcrypt.hashSync('123456', 10),
//   });
//   res.send(ress);
// });

// router.get('/:id', async (req, res) => {
//   const id = req.params.id;

//   const ress = await User.findAll();
//   // resolve bycripted password
//   ress.forEach((user) => {
//     user.password = bcrypt.compareSync('123456', user.password);
//   });
//   console.log(ress);
//   res.send(JSON.stringify(ress, '\n', 4));
// });

// router.post('/', (req, res) => {
//   res.send('Create a new resource');
// });

// router.put('/:id', (req, res) => {
//   const id = req.params.id;
//   res.send(`Update resource with ID ${id}`);
// });

// router.delete('/:id', (req, res) => {
//   const id = req.params.id;
//   res.send(`Delete resource with ID ${id}`);
// });

export default router;
