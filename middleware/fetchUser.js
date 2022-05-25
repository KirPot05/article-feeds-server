import jwt from 'jsonwebtoken';


// MiddleWare for fetching User data from DB
const fetchUser = (req, res, next) => {
    
    // Setting header 
    const token = req.header('auth-token');

    if(!token){
        return res.status(401).json({error, msg: "Please authenticate using valid token"});
    }

    try {
        // JWT verification 
        const data = jwt.verify(token, process.env.JWT_SECRET);
        req.user = data.userData;
        
        next();

    } catch (error) {
        res.status(401).json({message: error.message});
    }

}

export default fetchUser;