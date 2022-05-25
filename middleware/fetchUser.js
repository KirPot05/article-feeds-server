import jwt from 'jsonwebtoken';
import { failed_response } from '../utils/resoponseType.js';


// MiddleWare for fetching User data from DB
const fetchUser = (req, res, next) => {
    
    // Setting header 
    const token = req.header('auth-token');

    if(token == null || token === ""){
        return res.json(failed_response(401, "Please authenticate using valid token"));
    }

    try {
        // User verification 
        const data = jwt.verify(token, process.env.JWT_SECRET);

        req.user = data.id;
        
        next();

    } catch (error) {
        res.status(401).json(failed_response(401, error.message));
    }

}

export default fetchUser;