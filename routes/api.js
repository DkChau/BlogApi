const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const apiController = require('../controllers/apiController');
const Post = require('../models/post');
const Comment = require('../models/comment');
const {body,param,validationResult} = require('express-validator')

router.get('/', apiController.getHome);

router.get('/post', apiController.getPosts);
router.post('/post', apiController.createPost)

router.get('/post/:id', apiController.getSinglePost);
router.delete('/post/:id', apiController.deletePost)

router.get('/post/:id/comment', apiController.getComments);


module.exports = router;