const Post = require('../models/post');
const Comment = require('../models/comment');
const {body,param,validationResult} = require('express-validator')

exports.getHome = function(req,res,next){
    res.json({key:'test'});
}

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

    function(req,res,next){
        let errors = validationResult(req);

        if(!errors.isEmpty()){
            res.json(errors)
        }
        else{
            Post.findById(req.params.id)
                .then(post=>{
                    if(!post){
                        res.status(404).json({error:'Post does not exist'})
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
    function(req,res,next){
        let errors = validationResult(req);

        if(!errors.isEmpty()){
            res.json(errors)
        }
        else{

            Post.findById(req.params.id)
                .then(post=>{
                    if(!post){
                        res.json({error:'NO POST FOUND'});
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
                        res.json({error:'NO COMMENT OR POST FOUND'})
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