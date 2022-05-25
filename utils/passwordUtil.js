import bcrypt from "bcryptjs";
import jsonwebtoken from 'jsonwebtoken';


const { genSalt, hash, compare } = bcrypt;
const { sign } = jsonwebtoken;

export async function encryptPassword(password){
    const salt = await genSalt(10);
    const secPassword = await hash(password, salt);

    return secPassword;
}

export async function isCorrectPassword(userPassword, orgPassword){
    const passwordMatches = await compare(userPassword, orgPassword);
    return passwordMatches;
}

export async function getAuthToken(data){
    const token = sign(data, process.env.JWT_SECRET);
    return token;
}