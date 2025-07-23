const express = require('express')
const router = express.Router()
const {
  createPost,
  getAllPosts,
  getPostById,
  deletePost,
  likePost,
  commentOnPost
} = require('../controllers/blogController')
const auth = require('../middleware/auth')

router.post('/', auth, createPost)
router.get('/', getAllPosts)
router.get('/:id', getPostById)
router.delete('/:id', auth, deletePost)
router.post('/:id/like', auth, likePost)
router.post('/:id/comment', auth, commentOnPost)

module.exports = router 