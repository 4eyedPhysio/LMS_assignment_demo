require(`dotenv`).config();
const JWT = require(`jsonwebtoken`);

const JWT_SECRET = process.env.JWT_SECRET;

const authenticateToken = async(req, res, next)=>{

    const authHeader= req.headers[`authorization`]; //this line defines the authorization header from the request, which should contain the jwt token

   


    const token = authHeader && authHeader.split(` `)[1]; // the first authHeader checks if the authHeader exist and if it doesnt, it returns undefined while the split helps to split the authorization bearer into array of substrings using space as the breaker and the [1] helps return the the jwt which will be the second in the substring of array

   


    if(!token) return res.status(401).json({message:`unauthorized`});

    JWT.verify(token, JWT_SECRET, (err,user)=>{
        if(err) return res.status(403).json({message:`forbidden`});
        //once there's no error in the token, we have to then attach it to the user, so it can be accessed subsequently by other routes handlers

        req.user= user;
        next();
        
    });
};

module.exports = authenticateToken;