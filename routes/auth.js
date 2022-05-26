import { Router } from 'express';
const router = Router();
import { body, validationResult } from 'express-validator';
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import jsonwebtoken from 'jsonwebtoken';
import dotenv from "dotenv";
import fetchUser from '../middleware/fetchUser.js';
import { failed_response, success_response } from '../utils/responseType.js';
import { encryptPassword, getAuthToken, isCorrectPassword } from '../utils/passwordUtil.js';


// For importing environment variables into the router file
dotenv.config();


// Destructuring stuff from the libraries
const { sign } = jsonwebtoken;



// Create User Endpoint
router.post('/createUser',

    // Sent data validation 
    [
        body('firstName').isLength({ min: 3 }),
        body('lastName').isLength({ min: 3 }),
        body('phone').isLength({ max: 10, min: 10 }),
        body('birthDate').exists(),
        body('preferences').isArray(),
        body('email').isEmail(),
        body('password').isLength({ min: 5 })],

    async (req, res) => {

        // Validation results error handling
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json(failed_response(500, "Something went wrong", errors.array()));
        }

        try {

            let userData = await User.findOne({ email: req.body.email });

            if (userData != null) return res.json(failed_response(400, "User already exists"));

            const { firstName, lastName, phone, email, password, birthDate, preferences } = req.body;

            const secPassword = await encryptPassword(password);

            userData = {
                firstName,
                lastName,
                phone,
                email,
                password: secPassword,
                birthDate,
                preferences
            }

            userData = await User.create(userData);

            const data = {
                id: userData.id
            }

            const authToken = getAuthToken(data);
            res.json(success_response(200, "Registration successful", authToken));

        }

        catch (error) {
            console.error(error.message);
            return res.json(failed_response(500, "Internal server error"));
        }


    });



router.post('/login', async (req, res) => {

    const { email, password, phone } = req.body;

    try {
        let userData;
        
        if (email != null && email != "") {
            userData = await User.findOne({ email });
        }

        if (phone != null && phone != "") {
            userData = await User.findOne({ phone });
        }

        if (userData == null) {
            return res.status(500).json(failed_response(500, "User not found"));
        }

        // Compares hashed password in DB and entered password
        const passwordMatches = await isCorrectPassword(password, userData.password);

        if (!passwordMatches) {
            return res.status(500).json({ error: "Please enter valid credentials" });
        }

        // Returns Logged in user's id
        const data = {
            id: userData.id
        }

        // Signs and generates an authentication token
        const authToken = await getAuthToken(data);

        // Passing created user's data {authenticated token} as response
        res.json(success_response(200, "Login successful", authToken));


    } catch (error) {
        console.error(error.message);
        res.status(500).json(failed_response(500, "Internal Server Error"));
    }

});


router.get('/getUser', fetchUser, async (req, res) => {

    try {
        const userId = req.user;
        const user = await User.findById(userId).select('-password');

        // Checking no user condition
        if (user == null) return res.json(failed_response(400, "User not found"));


        res.json(success_response(200, "Fetched user successfully", user));


    } catch (error) {
        console.error(error.message);
        res.status(500).json(failed_response(500, error.message));
    }


});


router.put("/updateUser", fetchUser, async (req, res) => {

    try {

        const fields = req.body;
        if (Object.entries(fields).length === 0) {
            return res.json(failed_response(400, "No fields to update"));
        }

        const userId = req.user;
        let user = await User.findById(userId);

        if (user == null) {
            return res.json(failed_response(400, "User not found"));
        }

        const data = {};
        for (let key in fields) {
            if (data[key] !== "") {
                if (key === 'password') {
                    const newPassword = await encryptPassword(fields[key]);
                    data[key] = newPassword;

                } else {
                    data[key] = fields[key];
                }
            }


        }


        user = await User.findByIdAndUpdate(userId, data);
        if (user == null) {
            return res.json(failed_response(500, "Operation failed"));
        }

        return res.json(success_response(200, "Update successful", user));

    } catch (err) {
        console.error(err.message);
        res.json(failed_response(500, "Internal Server Error"));

    }


});




export default router;