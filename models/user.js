const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { isEmail } = require('validator');
const Book = require('./book');
const { validator, registerSchema } = require('../middleware/validator');

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  UniqueID: {
    type: String,
    unique: true,
    default: uuidv4,
  },
  borrowedBooks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: Book,
      // validate: {
      //   validator: function (check) {
      //     return check.length <= 3;
      //   },
      //   message: 'You cannot borrow more than 3 books',
      // },
    },
  ],
  email: {
    type: String,
    required: [true, 'Please enter an email'],
    unique: true,
    lowercase: true,
    validate: [isEmail, 'Please input a valid email address'],
  },
  password: {
    type: String,
    required: [true, 'Please enter your password'],
    minlength: [6, 'Minimum password length is six characters'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

UserSchema.pre('save', async function (next) {
  const user = this.toObject();
  // console.log('Validating user:', user);
// this line of code below compares the user data passed against the registerschema passed and see if it returns an error , if it does, it doesn't save the data to the database 


//but before that, we are using the destructure property to isolate borrowedBooks from the rest of the properties and inserting it in a constant also named borrowed books, doing this makes the validation work since im having trouble accepting objectsId in it as it requires strings for the borrowedBooks
const { borrowedBooks, ...userWithoutBooks } = user;

//here, we validate the userWithoutBooks against the registerSchema
  const { error } = validator(registerSchema)(userWithoutBooks);
  if (error) {
    console.error('Validation error:', error.details);
    return next(new Error(error.details.map((detail) => detail.message).join(', ')));
  }
  //this next line checks if the object has a set unique id and if it doesn't it generates one using  the uuid

  if (!this.UniqueID) {
    this.UniqueID = uuidv4();
  }

  if (!this.isModified('password')) {
    return next();
  }

  // const salt = await bcrypt.genSalt(10);
  // this.password = await bcrypt.hash(this.password, salt);
  next();
});

//we created a method here which is the static login used to authenticate a user when he tries to log in

UserSchema.statics.login = async function (email, password) {
  try {
    const user = await this.findOne({ email });
    if (user) {
      //here we compare the password provided and the password saved during registration in the database
      const compare = await bcrypt.compare(password, user.password);
      if (compare) {
        return user;
      }
      throw new Error('Incorrect password');
    }
    throw new Error('Incorrect email');
  } catch (err) {
    throw err;
  }
};



//so to add those object method given as an assignment, we need to include the instance of them so we can use them anywhere we are using user

UserSchema.method.peakBook = async function(isbn){
  await this.populate(`borrowedBooks`);
  const peak = this.borrowedBooks.find(book=>book.isbn===isbn);
 return peak;
}


//now to go ahead and create the return book instance

UserSchema.method.returnBook = async function(isbn){
  await this.populate(`borrowedBook`);
  //after the borrowedBook has been populated, next  we will have to find the index of the book

  const index = this.borrowedBooks.findIndex(book=>book.isbn===isbn);
  if(index!==-1){
     const returnedbook = this.borrowedBooks.splice(index,1)[0];  //we used splice because it will remove the found index from any space it's in and it will return the book based on the isbn after that, we save it in the database
     await this.save();
     return returnedbook;
  }
  return null;
}



const User = mongoose.model('User', UserSchema);
module.exports = User;
