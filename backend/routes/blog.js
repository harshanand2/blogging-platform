const express = require('express')
const router = express.Router()
const {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
  likePost,
  commentOnPost,
  deleteComment,
  getUserPosts,
  searchPosts
} = require('../controllers/blogController')
const auth = require('../middleware/auth')


router.get('/', getAllPosts)
router.get('/search', searchPosts)
router.get('/user/:userId', getUserPosts)
router.get('/:id', getPostById)

router.post('/', auth, createPost)
router.put('/:id', auth, updatePost)
router.delete('/:id', auth, deletePost)
router.post('/:id/like', auth, likePost)
router.post('/:id/comment', auth, commentOnPost)
router.delete('/:postId/comment/:commentId', auth, deleteComment)

module.exports = router 