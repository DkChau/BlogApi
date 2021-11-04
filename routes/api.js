const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const apiController = require('../controllers/apiController');
const Post = require('../models/post');
const Comment = require('../models/comment');
const {body,param,validationResult} = require('express-validator')

router.get('/', apiController.getHome);
router.post('/login', apiController.login)

router.get('/post', apiController.getPosts);
router.post('/post', apiController.createPost);

router.get('/post/:id', apiController.validId, apiController.getSinglePost);
router.delete('/post/:id', apiController.validId, apiController.deletePost);

//Comment Section
//Only requires authentication on delete route
router.get('/post/:id/comment', apiController.validId, apiController.getComments);
router.post('/post/:id/comment', apiController.validId, apiController.postComment);
router.get('/post/:id/comment/:commentId', apiController.validId, apiController.getComment);
router.delete('/post/:id/comment/:commentId', apiController.validId, apiController.deleteComment);

//MISSING UPDATES FOR POST AND LOGIN ROUTE

module.exports = router;