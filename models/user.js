import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({

    firstName:{
        type: String, 
        required: true
    },

    lastName:{
        type: String, 
        required: true
    },

    phone: {
        type: String, 
        required: true
    },

    email: {
        type: String, 
        required: true
    },

    birthDate: {
        type: Date,
        required: true
    },

    password: {
        type: String,
        required: true
    },

    preferences:{
        type: Array,
        required: true
    }


});

export default mongoose.model('users', userSchema);