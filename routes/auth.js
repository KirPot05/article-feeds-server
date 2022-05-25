import { Router } from 'express';
const router = Router();
import { body, validationResult } from 'express-validator';
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import jsonwebtoken from 'jsonwebtoken';
import dotenv from "dotenv";
import fetchUser from '../middleware/fetchUser.js';


// For importing environment variables into the router file
dotenv.config();


// Destructuring stuff from the libraries
const {genSalt, hash, compare} = bcrypt;
const {sign} = jsonwebtoken;



// Create User Endpoint
router.post('/createUser',

    // Sent data validation 
    [
        body('name').isLength({ min: 3 }),
        body('email').isEmail(),
        body('password').isLength({ min: 5 })],

    async (req, res) => {

        // Validation results error handling
        const errors = validationResult(req);
        let success = false;
        if (!errors.isEmpty()) {
            return res.status(400).json({ success, errors: errors.array() });
        }


        try {
            // checking if user already with specified email exists
            let userData = await User.findOne({ email: req.body.email });

            const salt = await genSalt(10);
            const secPassword = await hash(req.body.password, salt);

            // If user does not exist, new user to be created
            if (userData == null) {
                userData = {
                    name: req.body.name,
                    email: req.body.email,
                    password: secPassword
                }

                // Passing the above user data and creating a document in MongoDB collection 
                userData = await User.create(userData);

                const data = {
                    userData: {
                       id: userData.id
                    }
                }

                const authToken = sign(data, process.env.JWT_SECRET);
                success = true;
                // Passing created user's data as response
                res.json({ success, authToken});

            } else {
                // error handling - if user already exists throws an error
                throw new Error("User Already exists");
            }
        }

        catch (error) {
            console.error(error.message);
            res.status(500).json({success, err: error.message });
        }


    });



router.post('/login',

    // Sent data validation 
    [
        body('email').isEmail(),
        body('password').exists()
    ],

    async (req, res) => {

        // Validation results error handling
        const errors = validationResult(req);
        let success = false;
        if (!errors.isEmpty()) {
            return res.status(400).json({ success, errors: errors.array() });
        }

        const {email, password} = req.body;

        try {
            let userData = await User.findOne({email});

            if(!userData){
                return res.status(500).json({success, error: "Please enter valid credentials"});
            }
            
            // Compares hashed password in DB and entered password
            const isCorrectPassword = await compare(password, userData.password);
    

            if(!isCorrectPassword){
                return res.status(500).json({error: "Please enter valid credentials"});
            }

            // Returns Logged in user's id
            const data = {
                userData: {
                   id: userData.id
                }
            }

            // Signs and generates an authentication token
            const authToken = sign(data, process.env.JWT_SECRET);
            success = true;
            // Passing created user's data {authenticated token} as response
            res.json({success, authToken});


        } catch (error) {
            console.error(error.message);
            res.status(500).json({ success,  err: "Internal Server Error" });
        }

    });


router.post('/getUser', fetchUser, async (req, res) => {

    try {
        // Retrieving the user id with the help of middleware
        const userId = req.user.id;

        // Fetching user details from DB
        const user = await User.findById(userId).select('-password');
        

        // Sending the fetched user details as response
        res.json(user);


    } catch (error) {
        console.error(error.message);
        res.status(500).send({message: "Internal Server Error"});
    }


});




export default router;