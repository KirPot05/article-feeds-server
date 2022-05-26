import mongoose from "mongoose";

const articleSchema = new mongoose.Schema({

    title: {
        type: String, 
        required: true
    },
    
    description: {
        type: String, 
        required: true
    },
    
    articleImg: {
        type: Buffer
    },

    articleImgType: {
        type: String
    },

    tags: {
        type: Array,
        default: []
    },

    category:{
        type: String, 
        required: true
    },

    likes: {
        type: Number, 
        default: 0
    },

    dislikes: {
        type: Number, 
        default: 0
    },

    blocked: {
        type: Boolean,
        default: false
    },

    userId:{
        type: mongoose.SchemaTypes.ObjectId,
        required: true,
        ref: "users"
    },

    createdAt:{
        type: Date,
        default: Date.now
    },

    updatedAt: {
        type: Date
    }


});


articleSchema.pre('save', function(next){
    this.updatedAt = Date.now();
    next();
});


articleSchema.virtual('articleImgPath').get(function(){
    if(this.articleImg != null && this.articleImgType != null){
        return `data:${this.articleImgType}; charset=utf-8;base64, ${this.articleImg.toString('base64')}`
    }
});



export default mongoose.model('articles', articleSchema);