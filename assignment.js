const express = require('express');
require('dotenv').config();
const connectDB = require('./DB');
const User = require('./models/user');
const Book = require('./models/book');
const Library = require('./models/library');

connectDB();

//this line is to help correct the error that my mongo server keeps retruning so it will keep retrying even though it fails

//explaining the function, modelInstance is the model we want to save in the DB while retries set the amount of time the function will try to save in the DB

async function saveWithRetry(modelInstance, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      await modelInstance.save();
      return;
    } catch (err) {
      if (i === retries - 1) throw err; // checks if its the last retry i.e 2===3-1 then it will throw an error 
      console.log(`Retrying save operation (${i + 1}/${retries})...`); //remember that i is zero base , so we will just allow it to have a +1
    }
  }
}




(async () => {
  try {
    const library = new Library({ name: 'City Library' });
    await saveWithRetry(library);

    const user = new User({ firstName: 'John', email: 'john@example.com', password: 'password123' });
    await saveWithRetry(user);

    const book = new Book({ title: 'Moby Dick', author: 'Herman Melville', isbn: '1234567890' });
    await saveWithRetry(book);

    await library.registerMembers(user);
    await library.addNewBook(book);
    
    // const borrowResult = await library.borrowBook(user._id, '1234567890');
    // console.log(`Borrowed book: ${borrowResult}`);
  } catch (err) {
    console.error('An error occurred:', err.message);
  }
})();
