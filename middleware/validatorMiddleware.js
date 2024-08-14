const {
  validator,returnBookSchema,borrowBookSchema,createBookSchema,signInSchema,registerSchema,
} = require('./validator');

const validateRegister = (req, res, next) => {
  const { error } = validator(registerSchema)(req.body);
  if (error) {
    return res.status(400).send({ error: error.details.map(detail => detail.message).join(', ') });
  }
  next();
};

const validateSignIn = (req, res, next) => {
  const { error } = validator(signInSchema)(req.body);
  if (error) {
    return res.status(400).send({ error: error.details.map(detail => detail.message).join(', ') });
  }
  next();
};

const borrowBook =(req,res,next)=>{
  const {error}= validator(borrowBookSchema)(req.body);
  if(error){
    return res.status(400).send({error:error.details.map(detail=>detail.message).join(`, `)});
  }
  next();
}

const createBook =(req,res,next)=>{
  const {error}= validator(createBookSchema)(req.body);
  if(error){
    return res.status(400).send({error:error.details.map(detail=>detail.message).join(`, `)});
  }
  next();
}


const returnBook =(req,res,next)=>{
  const {error}= validator(returnBookSchema)(req.body);
  if(error){
    return res.status(400).send({error:error.details.map(detail=>detail.message).join(`, `)});
  }
  next();
}

module.exports = { validateRegister, validateSignIn,returnBook,createBook,borrowBook };
