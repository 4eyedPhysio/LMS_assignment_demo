const Joi = require('joi');

// Define the validator function
const validator = (schema) => (payload) =>
  schema.validate(payload, { abortEarly: false });

// Define the sign-in schema
const signInSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(10).required(),
});

// Define the registration schema
const registerSchema = Joi.object({
  firstName: Joi.string().min(3).required(),
  UniqueID: Joi.string().guid({ version: 'uuidv4' }).optional(),
  borrowedBooks: Joi.array()
    .items(Joi.string().regex(/^[0-9a-fA-F]{24}$/))  //this validator wants the name to be in string
    //.max(3)  // this validator is affecting the code in the controller from accepting greater than 3 books so i commented it out but theres a way i can use them both by using the (.when)
    .messages({
      'array.max': 'You cannot borrow more than 3 books',
    }),
  email: Joi.string().email().required().messages({
    'string.email': 'Please input a valid email address',
    'any.required': 'Please enter an email',
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Minimum password length is six characters',
    'any.required': 'Please enter your password',
  }),
  createdAt: Joi.date().default(() => new Date()),
}).options({ stripUnknown: true }); //the options (stripUnknown: true) helps to ignore fields that are not defined in the schema thereby removing it from the request


const createBookSchema= Joi.object({
  title:Joi.string().min(3).max(100).required(),
  author:Joi.string().min(3).max(100).required().messages({"string.min":"the minimum character is 3"}),
  isbn: Joi.string().guid({ version: 'uuidv4' }).optional(),
  borrowed: Joi.boolean()
})

const borrowBookSchema = Joi.object({
  bookId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
    'string.regex.base': 'Invalid book ID format',
    'any.required': 'Book ID is required',
  }),
}).options({ stripUnknown: true });

const returnBookSchema= Joi.object({
  bookId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
    'string.regex.base': 'Invalid book ID format',
    'any.required': 'Book ID is required',
  }),
}).options({ stripUnknown: true });


module.exports = {
  validator,
  returnBookSchema,
  borrowBookSchema,
  createBookSchema,
  signInSchema,
  registerSchema,
};
