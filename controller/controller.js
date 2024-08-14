const Book = require(`../models/book`);
const User = require(`../models/user`);
require(`dotenv`).config();
const Joi = require('joi');
const bcrypt= require(`bcrypt`);
const JWT = require("jsonwebtoken");
const {validator,createBookSchema,borrowBookSchema,signInSchema,registerSchema}= require(`../middleware/validator`);


//for password salting and hashing , its time to define it

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET

//i havent implemented or written the code for token


module.exports.signUpLogin = async(req,res)=>{
    res.render(`index`);
}


module.exports.register = async (req, res) => {
    try {

      //since i imported the validation schemas , i guess i will have to use them...remember that it will start with error , then you will compare the req.body with the schema you imported

      const {error}=validator(registerSchema)(req.body);

      if (error){
        return res.status(400).json({message:`validation error while registering: ${error.details.map(x=>x.message).join(`, `)}`});
      }

      const { firstName, email, password } = req.body;
      //firstly, trim the password before hashing
      const trimmedPassword = password.trim();
  
      // Hash the password
      const hashedPassword = await bcrypt.hash(trimmedPassword, SALT_ROUNDS);
  
      // Create a new user with hashed password
      const newUser = new User({ firstName, email, password: hashedPassword });
  
      await newUser.save();
      return res.status(200).json({ message: 'User registered successfully' });
    } catch (err) {
      return res.status(400).json({ message: 'Unable to register', error: err.message });
    }
  };
  

module.exports.login = async(req,res)=>{
  try {

    const {error}= validator(signInSchema)(req.body);

    if(error){
      return res.status(400).json({message:`validation error in signin: ${error.details.map(x=>x.message).join(`, `)}`})
    }

    const {email, password}= req.body;

//now to find the specific user
const user = await User.findOne({email});
if(!user){
   return res.status(400).json({message: `user not found`});
}
//after finding the user, now lets check if the password passed is correct by comparing it with user.password
const validPassword= await bcrypt.compare(password, user.password);

if(!validPassword){
    return res.status(401).json({message:`incorrect password`})
}

//now we have to create a JWT token for each logged in user

const TOKEN = JWT.sign({userId: user._id, email: user.email }, JWT_SECRET, {expiresIn: `20m`});

//apparently, i'm meant to send the token i created to the client side by sending it with the json
return res.status(200).json({message: `login successful`, token:TOKEN});

  } catch (err) {
    return res.status(500).json({message:`Error occured during login`, error: err.message})
  }
}




module.exports.getUsers=async(req,res)=>{
    try {
        const users = await User.find();
        return res.status(200).json({users})
    } catch (err) {
        console.error(err);
       return res.status(500).json({message:"error occured while returning users", err})
    }
}

module.exports.createBook= async(req,res)=>{
  try {
   
    const {error}= createBookSchema.validate(req.body);

    if(error){
      return res.status(400).json({
        message:`validation error: ${error.details.map(z=>z.message).join(`, `)}`
      })
    }


    const {title, author, isbn}= req.body; 

    const newbook = new Book ({title, author, isbn});

    //let me try and validate the book before saving it

    await newbook.validate();

    await newbook.save();

    return res.status(201).json({message: `book created successfully`})

  } catch (err) {
    //log the error in the console for debugging purposes
   
    console.error(err);

    return res.status(500).json({message:`error occured while creating the book`, error: err.message})
  }
};



module.exports.getBooks= async(req,res)=>{
  try {
    const books = await Book.find();
    return res.status(200).json({books})
  } catch (err) {
    console.error(err);
    return res.status(500).json({message:`error getting books`,err})

  }
}

module.exports.borrowBook = async(req,res)=>{
  try {
    
    const userId= req.user.userId;
   

    const { error: validationError } = borrowBookSchema.validate(req.body);
    if (validationError) {
      return res.status(400).json({ message: validationError.details[0].message });
    }
   
    //we want to assume that since we are using postman, the id will be sent in the body, so we will retrieve it from the body
    const {bookId} = req.body;
    //next is to try and populate the user's borrowed books but we will have to first find the user we are using from the id passed in the req.user._id

    const user= await User.findById(userId).populate(`borrowedBooks`);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
  }
  //once the user is found, we also check if he has not exceeded the total number of books he has to borrow
    if(user.borrowedBooks.length>=3){
      return res.status(400).json({ message: 'You cannot borrow more than 3 books' });
    
    }


    // once that is passed, we try to check for the book
    const book = await Book.findById(bookId);

    console.log(book.title);

    const checkBorrowedBefore = user.borrowedBooks.some(x=>x._id.toString()===bookId); //i added this line so that a book cannot be borrowed twice and the method SOME returns a boolean and has same function as FIND , so it helps me to check if the id(in the database which has to be converted to string) matches with the id provided in the req.body

    if(checkBorrowedBefore){
      return res.status(400).json({message:`this book is in your borrowed list`})
    }

    if(!book){
      return res.status(404).json({message:`the requested book is not found`})
    }
    //once we have gotten it , the next thing to do is to add the id of the book borrowed to the user and converting it to string since our joi is requiring a string

     user.borrowedBooks.push(book._id.toString());


    //the next thing is to save it to the database
    await user.save();

     // now its time to populate the respnse so that it only shows the title of the book in the borrowed section
       
     const populateUserTitle = await User.findById(userId).populate({
      path: `borrowedBooks`,
      select:`title`, // this makes sure that it is only the title that is displayed when the response it to be sent back. note that this will not show in the database
     })


    return res.status(200).json({ message: 'Book borrowed successfully',  borrowedBooks: populateUserTitle.borrowedBooks.map(book => book.title) });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'An error occurred while borrowing the book', error: err.message }); 
  }
}


module.exports.returnBook = async(req,res)=>{
  try {
    const userId = req.user.userId;
    //nex we have to validate the id that is being sent in the req.body

    const { error: validationError } = borrowBookSchema.validate(req.body);
    if (validationError) {
      return res.status(400).json({ message: validationError.details[0].message });
    }
    // next we destructure the bookId out of the req.body and save it as bookId
    
    const {bookId} = req.body; 

    

    const user= await User.findById(userId).populate(`borrowedBooks`);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
  }

  

  //now that we have the user, we want to check if the user has borrowed book before

  const bookIndex= user.borrowedBooks.findIndex(book=> book._id.toString() ===bookId) //since we know that we want to compare the id in the mongodb with the one given in our req.body, and we know their data type is different (one being an object Id and the other being a string) so we will have to convert to objectid to a string

// the findIndex will return -1 if it doesnt find the criteria and it will return the index if it does

  if(bookIndex===-1){
  return res.status(400).json({ message: 'This book is not in your borrowed list' });
  }

  user.borrowedBooks.splice(bookIndex, 1);

  await user.save();

  return res.status(200).json({ message: 'Book returned successfully', borrowedBooks: user.borrowedBooks });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'An error occurred while returning the book', error: err.message });
  }
}