import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import fetchUser from '../middleware/fetchUser.js';
import User from '../models/User.js';
import Articles from '../models/articles.js';
import { failed_response, success_response } from '../utils/resoponseType.js';
import { saveImage } from '../utils/saveImage.js';
import articles from '../models/articles.js';

const router = Router();


// Display all the articles based on preferences 
router.get('/', fetchUser, (req, res) => {

    try{
        const userId = req.user;
        
        const user = await User.findById(userId);
        if(user == null) {
            const result = failed_response(400, "User not found");
            return res.status(400).json(result);
        }

        const userPreferences = user.preferences;

        const response = [];

        userPreferences.forEach((preference) => {
            const articles = await Articles.find({category: preference});
            
            articles.filter((article) => {
                return article.blocked === false
            });

            response.push(articles);
        });

        if(response.length == 0){
            const result = failed_response(400, "Failed to fetch articles");
            return res.status(400).json(result);
        }

        const result = success_response(200, "Successfully fetched articles", response);
        res.status(200).json(result);

    } catch(err){
        console.error(err);
        result = failed_response(500, "Internal Server Error");
        res.status(500).json(result);
    }

});


// Display all the articles of a particular user
router.get('/:id', fetchUser, async (req, res) => {

    try{
        
        const user = await User.findById(req.params.id);
        if(user == null) {
            const result = failed_response(400, "User not found");
            return res.status(400).json(result);
        }

        const articles = await Articles.find({userId: userId});

        if(articles.length == 0){
            const result = failed_response(400, "No articles found");
            return res.status(400).json(result);
        }

        const result = success_response(200, "Successfully fetched articles", articles);
        res.status(200).json(result);

    } catch(err){
        console.error(err);
        result = failed_response(500, "Internal Server Error");
        res.status(500).json(result);
    }

});



// Create an article - Name, Description, Images, Tags and Category
router.post('/new', fetchUser, 
    [
        body('title').isLength({ min: 3 }),
        body('description').isLength({ min: 5 }),
        body('category').isLength({min: 3})
    ],
     async (req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json(failed_response(400, "Something went wrong", errors.array()));
        }

    try{
        const userId = req.user;
        const {title, description, category, ...rest} = req.body;

        const article = {
            title, 
            description,
            category,
            userId
        }

        if(rest.img != null){
            article = saveImage(article, rest.img);
        }

        if(rest.tags != null){
            articles.tags = rest.tags;
        }

        const createdArticle = await Articles.create(article);
        
        const result = success_response(201, "Created article successfully", createdArticle);
        res.status(201).json(result);

    } catch(err){
        console.error(err);
        result = failed_response(500, "Internal Server Error");
        res.status(500).json(result);
    }

})



// Edit the articles - only name and description
router.put('/:id', fetchUser, async (req, res) => {

    try{

        const articleId = req.params.id;
        const userId = req.user;

        const article = await Articles.find({id: articleId, userId: userId});
        if(article == null){
            const result = failed_response(400, "Article not found");
            return res.status(400).json(result);
        }

        const fields = req.body;
        const articleData = {};

        for(let key of fields){
            if(key === "userId"){
                const result = failed_response(403, "Unauthorized Operation");
                return res.status(403).json(result);
            }

            else if(fields[key] != null && fields[key] !== ""){
                if(key === "img"){
                    articleData = saveImage(articleData, fields[key]);
                }
                
                articleData[key] = fields[key];
            }
        }

        const newArticle = await Articles.findByIdAndUpdate(articleId, articleData);

        const result = success_response(200, "Update operation successful", newArticle);
        res.status(200).json(result);


    } catch(err){
        console.error(err);
        result = failed_response(500, "Internal Server Error");
        res.status(500).json(result);
    }

})


export default router;