const mongoose = require(`mongoose`);
const Book = require(`./book`);
const User = require(`./user`);

const librarySchema = new mongoose.Schema({
    name: String,
    books: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: Book
    }],
    members: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: User
    }]
  });

  //so like the assignment said, we have to create an object method, so to do that we will have to create an instance of the object

  librarySchema.methods.registerMembers = async function(userDetail) {
    this.members.push(userDetail._id); // collects only the _id from the user and saves it in the members property
    await this.save();
  };


  //now for the add new book method

  librarySchema.methods.addNewBook = async function(bookDetail) {
    this.books.push(bookDetail._id); 
    await this.save();
  };

  //now for the borrowBook method

//   librarySchema.methods.borrowBook = async function(userId, ISBN) {
//     // we first populate the user's borrowed books
//     const userNow = await user.findById(userId).populate('borrowedBooks');
    
//     // Check if the user has borrowed 3 or more books
//     if (userNow.borrowedBooks.length >= 3) {
//       return false; // User cannot borrow more than 3 books
//     }
  
//     // Next is to find the book by ISBN
//     const bookNow = await book.findOne({ isbn: ISBN });
    
//     // Check if the book exists and is not borrowed
//     if (bookNow && !bookNow.isBorrowed()) {
//       book.borrowed = true; // Mark the book as borrowed
//       await book.save();
      
//       user.borrowedBooks.push(book._id); // Add the book to the user's borrowed books
//       await user.save();
  
//       return true; // Successfully borrowed the book
//     }
  
//     return false; // Book is either not found or already borrowed
//   };


  const Library = mongoose.model('Library', librarySchema);
   module.exports = Library;