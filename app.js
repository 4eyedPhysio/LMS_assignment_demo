const express = require(`express`);

require(`dotenv`).config();
const routes= require(`./routes/route`);
const path=require(`path`);
const cookieParser = require('cookie-parser');
const rateLimit = require(`express-rate-limit`);
const redis = require(`./integration/redis`);
const connectDB = require(`./DB`);


//first i want to set my rate limiter
const limiter = rateLimit({
    windowMs: 10*60*1000 , //per windows in millisecs
    limit: 100, //here i set it to 100request
    standardHeaders: `draft-7`,
    legacyHeaders: false
});

const app = express();
//connect to database
connectDB();

app.set(`view engine`, `ejs`);
app.set(`views`, path.join(__dirname, `views`));


app.use(limiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(routes); // i made sure my routes is the last of them


const PORT = process.env.PORT || 4000;

app.listen(PORT,()=>{
  console.log(`server is running on port ${PORT}`)
});

    