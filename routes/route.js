const { Router } = require('express');
const controller = require('../controller/controller');
const { validateRegister, validateSignIn,returnBook,createBook,borrowBook } = require('../middleware/validatorMiddleware');
const authenticateToken= require(`../middleware/authMiddleware`);

const routes = Router();

routes.get('/', controller.signUpLogin);
routes.post('/register', validateRegister, controller.register);
routes.post('/login', validateSignIn, controller.login); 
routes.get('/users', authenticateToken, controller.getUsers);
routes.post(`/createBook`,authenticateToken,createBook,controller.createBook);
routes.get(`/books`,authenticateToken, controller.getBooks);
routes.post(`/borrow`, authenticateToken,borrowBook, controller.borrowBook);
routes.post(`/returnBook`, authenticateToken,returnBook, controller.returnBook);

module.exports = routes;

