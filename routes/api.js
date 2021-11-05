const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController');


router.get('/', apiController.getHome);
router.post('/login', apiController.login)

router.get('/post', apiController.getPosts);
router.post('/post', apiController.createPost);

router.get('/post/:id', apiController.validId, apiController.getSinglePost);
router.delete('/post/:id', apiController.validId, apiController.deletePost);
router.put('/post/:id', apiController.validId, apiController.updatePost);

router.get('/post/:id/comment', apiController.validId, apiController.getComments);
router.post('/post/:id/comment', apiController.validId, apiController.postComment);
router.get('/post/:id/comment/:commentId', apiController.validId, apiController.getComment);
router.delete('/post/:id/comment/:commentId', apiController.validId, apiController.deleteComment);

module.exports = router;