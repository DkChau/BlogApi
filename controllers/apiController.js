const Post = require('../models/post');
const Comment = require('../models/comment');
const User = require('../models/user');
const {body,param,validationResult} = require('express-validator')
const Routing = require('../middleware/routing')
const jsonwebtoken = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const jwt = require('express-jwt');

exports.getHome = function(req,res,next){
    res.json({key:'test'});
}
exports.login = [
    body('username').notEmpty().withMessage('Username cannot be empty')
        .trim()
        .escape(),
    body('password').notEmpty().withMessage('Password cannot be empty')
        .trim()
        .escape(),
    function(req,res,next){
        let errors = validationResult(req);

        if(!errors.isEmpty()){
            res.json(errors)
        }
        else{
            User.findOne({username:req.body.username})
                .then(user=>{
                    if(!user){
                        res.json({errors:'User not found'})
                    }
                    else{
                        bcrypt.compare(req.body.password,user.password,(err,response)=>{
                            if(err){
                                res.json(err)
                            }
                            else if(response){
                                //Secret should be env, test time
                                let token = jsonwebtoken.sign({user}, 'testsecret')
                                res.cookie('token', token, {httpOnly:true, maxAge:100000});
                                res.json({token})
                            }
                            else{
                               res.json({errors:'Wrong password'}) 
                            }
                        })
                    }
                })
        }
        
    }
]
exports.getPosts = function(req,res,next){  
    Post.find({})
        .then(posts=>{
            res.json(posts)
        })
        .catch(err=>{
            res.json(err)
        })
}

exports.createPost = [
    // Test middleware
    jwt({
        secret:'testsecret',
        algorithms: ['HS256'],
        getToken: req => req.cookies.token
    }),
    body('title').notEmpty().withMessage('Title Cannot be Empty')
        .trim()
        .escape(),
    body('text').notEmpty().withMessage('Text cannot be empty')
        .trim()
        .escape(),
    function(req,res,next){
        let errors = validationResult(req);
        
        if(!errors.isEmpty()){
            res.json(errors)
        }
        else{
            let post = new Post({
                title:req.body.title,
                text:req.body.text,

            });

            post.save()
                .then(savedPost => {
                    res.json(savedPost)
                })
                .catch(err=>{
                    next(err)
                })
        }
    }
]

exports.getSinglePost = [
    param('id').isLength({min:24,max:24}).withMessage('Invalid ID')
        .trim()
        .escape(),

    Routing.validId,
    
    function(req,res,next){
        let errors = validationResult(req);

        if(!errors.isEmpty()){
            res.json(errors)
        }
        else{
            Post.findById(req.params.id)
                .then(post=>{
                    if(!post){
                        res.status(404).json({errors:'Post does not exist'})
                    }
                    else{
                        res.json(post)
                    }
                })
                .catch(err=>{
                    res.json(err)
                })
        }
    }
]

exports.deletePost = [
    param('id').isLength({min:24,max:24}).withMessage('Invalid ID')
        .trim()
        .escape(),

    Routing.validId,
    
    function(req,res,next){
        let errors = validationResult(req);

        if(!errors.isEmpty()){
            res.json(errors)
        }
        else{
            let deletePost = Post.findByIdAndDelete(req.params.id).exec();
            let deleteComments = Comment.deleteMany({post:req.params.id}).exec();
          
            Promise.all([deletePost,deleteComments])
            .then(([post,comments])=>{
                if(!post){
                    res.json({errors:'NO POST FOUND'})
                }
                else{
                    res.json(post)
                }
            })
            .catch(err=>{
              res.json(err)
            })
        }
    }
]

//Comments
exports.getComments = [
    param('id').isLength({min:24,max:24}).withMessage('Invalid ID')
        .trim()
        .escape(),
    Routing.validId,
    
    function(req,res,next){
        let errors = validationResult(req);

        if(!errors.isEmpty()){
            res.json(errors)
        }
        else{
            Comment.find({post:req.params.id})
                .then(comments =>{
                    res.json(comments);
                })
                .catch(err=>{
                    res.json(err);
                })
        }
    }
]

exports.postComment = [
    body('name').notEmpty().withMessage('Name cannot be empty')
        .trim()
        .escape(),
    body('text').notEmpty().withMessage('Text cannot be empty')
        .trim()
        .escape(),
    param('id').isLength({min:24,max:24}).withMessage('Invalid ID')
        .trim()
        .escape(),
    Routing.validId,
    
    function(req,res,next){
        let errors = validationResult(req);

        if(!errors.isEmpty()){
            res.json(errors)
        }
        else{

            Post.findById(req.params.id)
                .then(post=>{
                    if(!post){
                        res.json({errors:'NO POST FOUND'});
                    }
                    else{
                        let comment = new Comment({
                            name:req.body.name,
                            text:req.body.text,
                            post:req.params.id,
                        })

                        comment.save()
                            .then(comment=>{
                                res.json(comment)
                            })
                            .catch(err=>{
                                res.json(err)
                            })
                    }
                })

        }
    }
]

exports.deleteComment = [
    param('id').isLength({min:24,max:24}).withMessage('Invalid ID')
        .trim()
        .escape(),
    Routing.validId,
    
    param('commentId').isLength({min:24,max:24}).withMessage('Invalid Comment ID')
        .trim()
        .escape(),
    function(req,res,next){
        let errors = validationResult(req);

        if(!errors.isEmpty()){
            res.json(errors)
        }
        else{
            Comment.findOneAndDelete({post:req.params.id, _id:req.params.commentId})
                .then(comment=>{
                    if(!comment){
                        res.json({errors:'NO COMMENT OR POST FOUND'})
                    }
                    else{
                        res.json(comment)
                    }
                })
                .catch(err=>{
                    res.json(err)
                })
        }
    }
]