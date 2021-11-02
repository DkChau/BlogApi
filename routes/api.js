const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const apiController = require('../controllers/apiController');
const Post = require('../models/post');
const Comment = require('../models/comment');
const {body,param,validationResult} = require('express-validator')

router.get('/', apiController.getHome);

router.get('/post', apiController.getPosts);
router.post('/post', apiController.createPost);

router.get('/post/:id', apiController.getSinglePost);
router.delete('/post/:id', apiController.deletePost);

//Comment Section
//Only requires authentication on delete route
router.get('/post/:id/comment', apiController.getComments);
router.post('/post/:id/comment', apiController.postComment);
router.delete('/post/:id/comment/:commentId', apiController.deleteComment);

//MISSING UPDATES FOR POST AND LOGIN ROUTE

module.exports = router;