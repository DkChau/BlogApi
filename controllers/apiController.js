const Post = require('../models/post');
const Comment = require('../models/comment');
const User = require('../models/user');
const {body,param,validationResult} = require('express-validator')
const jsonwebtoken = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const jwt = require('express-jwt');

require('dotenv').config();

exports.getHome = [
    jwt({
        secret:process.env.TOKEN_SECRET,
        algorithms: ['HS256'],
        getToken: req => req.cookies.token,
        credentialsRequired:false
    }),
    function(req,res,next){
        console.log(req.cookies.token)
        if(req.user){
            res.json({authorized:true})
        }
        else{
            res.json({authorized:false})
        }
    },
]

exports.validId = [
    param('id').isLength({min:24,max:24}).withMessage('Invalid ID')
        .isString()
        .trim()
        .escape(),

    param('commentId').isLength({min:24,max:24}).withMessage('Invalid ID')
        .isString()
        .trim()
        .escape()
        .optional(),

    function(req,res,next){
        let errors = validationResult(req)

        if(!errors.isEmpty()){
            res.status(404).json(errors);
        }
        else if(!(req.params.id.match(/^[0-9a-fA-F]{24}$/))){
            res.status(404).json({errors: 'INVALID OBJECT ID'})
        }
        else if(req.params.commentId && !(req.params.commentId.match(/^[0-9a-fA-F]{24}$/))){
            res.status(404).json({errors: 'INVALID OBJECT ID'})
        }
        else{
            next();
        }
    }
]

exports.login = [
    body('username').notEmpty().withMessage('Username cannot be empty')
        .isString()
        .trim()
        .escape(),
    body('password').notEmpty().withMessage('Password cannot be empty')
        .isString()
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
                        res.json({errors:[{msg:'User not found'}]})
                    }
                    else{
                        bcrypt.compare(req.body.password,user.password,(err,response)=>{
                            if(err){
                                res.json(err)
                            }
                            else if(response){
                                let token = jsonwebtoken.sign({user}, process.env.TOKEN_SECRET)
                                res.setHeader('set-cookie', [
                                    `token=${token}; SameSite=None; Secure; HttpOnly=true; Max-Age=86400`
                                ])
                                res.json({token})
                            }
                            else{
                               res.json({errors:[{msg:'Incorrect password'}]}) 
                            }
                        })
                    }
                })
        }
        
    }
]
exports.getPosts = [
    jwt({
        secret:process.env.TOKEN_SECRET,
        algorithms: ['HS256'],
        getToken: req => req.cookies.token,
        credentialsRequired:false
    }),  
    function (req,res,next){
        let allPost;

        if(req.user){
            allPost=Post.find({}).sort({date: 'desc'}).exec()
        }
        else{
            allPost=Post.find({published:true}).sort({date: 'desc'}).exec()
        }

        allPost
        .then(posts=>{
            res.json(posts)
        })
        .catch(err=>{
            res.json(err)
        })
    }

]

exports.createPost = [
    jwt({
        secret:process.env.TOKEN_SECRET,
        algorithms: ['HS256'],
        getToken: req => req.cookies.token
    }),
    body('title').notEmpty().withMessage('Title Cannot be Empty')
        .isString()
        .trim()
        .escape(),
    body('text').notEmpty().withMessage('Text cannot be empty')
        .isString()
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
    jwt({
        secret:process.env.TOKEN_SECRET,
        algorithms: ['HS256'],
        getToken: req => req.cookies.token,
        credentialsRequired:false,
    }),

    function(req,res,next){
        Post.findById(req.params.id)
            .then(post=>{
                if(!post){
                    res.status(404).json({errors:'Post does not exist'})
                }
                else if(post.published===false && !req.user){
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
]

exports.deletePost = [

    jwt({
        secret:process.env.TOKEN_SECRET,
        algorithms: ['HS256'],
        getToken: req => req.cookies.token
    }),
    
    function(req,res,next){
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
]

exports.updatePost = [
    jwt({
        secret:process.env.TOKEN_SECRET,
        algorithms: ['HS256'],
        getToken: req => req.cookies.token
    }),

    body('title')
        .trim()
        .escape()
        .optional(),
    body('text')
        .trim()
        .escape()
        .optional(),
    body('published')
        .isBoolean()
        .toBoolean()
        .optional(),

    function(req,res,next){
        console.log(req.body.title, req.body.text);
        let errors = validationResult(req);

        if(!errors.isEmpty()){
            res.json(errors)
        }
        else{
            Post.findById(req.params.id)
                .then(post=>{
                    if(!post){
                        res.json({errors:'NO post found'})
                    }
                    else{
                        if(req.body.title){
                            post.title=req.body.title
                        }
                        if(req.body.text){
                            post.text=req.body.text
                        }
                        if(req.body.published===true || req.body.published===false){
                            post.published=req.body.published;
                        }

                        post.save()
                            .then(response=>{
                                res.json(response)
                            })
                            .catch(err=>{
                                res.json(err)
                            })
                    }
                })
                .catch(err=>{
                    res.json(err);
                })
        }
    }
]

//Comments
exports.getComments = [

    jwt({
        secret:process.env.TOKEN_SECRET,
        algorithms: ['HS256'],
        getToken: req => req.cookies.token,
        credentialsRequired:false,
    }),

    function(req,res,next){
        Post.findById(req.params.id)
            .then(post=>{
                if(!post){
                    res.status(404).json({errors:'Post does not exist'})
                }
                else if(post.published===false && !req.user){
                    res.status(404).json({errors:'Post does not exist'})
                }
                else{
                    Comment.find({post:req.params.id}).sort({date: 'asc'}).exec()
                    .then(comments =>{
                        res.json(comments);
                    })
                    .catch(err=>{
                        res.json(err);
                    })
                }
            })
            .catch(err=>{
                res.json(err)
            })
    }
]

exports.getComment = [
    jwt({
        secret:process.env.TOKEN_SECRET,
        algorithms: ['HS256'],
        getToken: req => req.cookies.token,
        credentialsRequired:false,
    }),

    function(req,res,next){
        Post.findById(req.params.id)
            .then(post=>{
                if(!post){
                    res.status(404).json({errors:'Post does not exist'})
                }
                else if(post.published===false && !req.user){
                    res.status(404).json({errors:'Post does not exist'})
                }
                else{
                    Comment.findOne({_id:req.params.commentId, post:req.params.id})
                        .then(comment=>{
                            if(!comment){
                                res.json({errors:'COMMENT DOES NOT EXIST'});
                            }
                            else{
                                res.json(comment)
                            }
                        })
                        .catch(err=>{
                            res.json(err);
                        })  
                }
            })
            .catch(err=>{
                res.json(err)
            })
    }
]

exports.postComment = [
    body('name').notEmpty().withMessage('Name cannot be empty')
        .isString()
        .trim()
        .escape(),
    body('text').notEmpty().withMessage('Text cannot be empty')
        .isString()
        .trim()
        .escape(),
    
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
    jwt({
        secret:process.env.TOKEN_SECRET,
        algorithms: ['HS256'],
        getToken: req => req.cookies.token
    }),

    function(req,res,next){
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
]