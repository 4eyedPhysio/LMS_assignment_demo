const mongoose= require(`mongoose`);
require('dotenv').config();
const URI = process.env.URI;
//remember, we are exporting a function


const connectDB = async ()=>{
    //now we use the try catch block incase a problem comes up while connecting to mongoose
    try {
         const conne = await mongoose.connect(URI);
        console.log(`mongoDB connected successfully :  ${conne.connection.host}`)
    } catch (err) {
        console.error(`an error occured ${err.message}`);
        process.exit(1);
    }
}

module.exports = connectDB;