const { boolean } = require('joi');
const mongoose = require(`mongoose`);
const { v4: uuidv4 } = require('uuid');

const bookSchema = new mongoose.Schema({
    title:{
        type: String,
        require: true
    },
    author:{
        type:String,
        require:true
    },
    isbn:{
        type: String,
        unique: true,
        default: uuidv4,
      },
    borrowed:{
        type: Boolean,
        default:false
      }

})

//according to the assignment, we are meant to create a method for the bookSchema named isBorrowed
 bookSchema.method.isBorrowed = function (){
    return this.borrowed;
 }

const Book = mongoose.model(`book`, bookSchema);
module.exports= Book;