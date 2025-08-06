const BlogPost = require('../models/BlogPost')

exports.createPost = async (req, res) => {
  try {
    const { title, content } = req.body
    
    
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' })
    }
    
    const post = new BlogPost({
      title,
      content,
      author: req.user.id
    })
    await post.save()
    
    
    await post.populate('author', 'username')
    res.status(201).json(post)
  } catch (err) {
    console.error('Create post error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

exports.getAllPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = 'newest' } = req.query
    
    const skip = (page - 1) * limit
    let sortOption = { createdAt: -1 }
    
    if (sort === 'oldest') {
      sortOption = { createdAt: 1 }
    } else if (sort === 'mostLiked') {
      sortOption = { 'likes.length': -1 }
    }
    
    const posts = await BlogPost.find()
      .populate('author', 'username')
      .populate('comments.user', 'username')
      .sort(sortOption)
      .limit(parseInt(limit))
      .skip(skip)
    
    const total = await BlogPost.countDocuments()
    
    res.json({
      posts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalPosts: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    })
  } catch (err) {
    console.error('Get all posts error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

exports.getPostById = async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id)
      .populate('author', 'username')
      .populate('comments.user', 'username')
      .populate('likes', 'username')
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' })
    }
    
    res.json(post)
  } catch (err) {
    console.error('Get post by ID error:', err)
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid post ID' })
    }
    res.status(500).json({ message: 'Server error' })
  }
}

exports.updatePost = async (req, res) => {
  try {
    const { title, content } = req.body
    const post = await BlogPost.findById(req.params.id)
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' })
    }
    
    
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized - Only the author can edit this post' })
    }
    
   
    if (title) post.title = title
    if (content) post.content = content
    
    await post.save()
    await post.populate('author', 'username')
    
    res.json(post)
  } catch (err) {
    console.error('Update post error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

exports.deletePost = async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id)
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' })
    }
    
    
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized - Only the author can delete this post' })
    }
    
    await BlogPost.findByIdAndDelete(req.params.id)
    res.json({ message: 'Post deleted successfully' })
  } catch (err) {
    console.error('Delete post error:', err)
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid post ID' })
    }
    res.status(500).json({ message: 'Server error' })
  }
}

exports.likePost = async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id)
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' })
    }
    
    const userId = req.user.id
    const isLiked = post.likes.includes(userId)
    
    if (isLiked) {
     
      post.likes = post.likes.filter(id => id.toString() !== userId)
      await post.save()
      res.json({ 
        message: 'Post unliked',
        liked: false,
        likesCount: post.likes.length 
      })
    } else {
     
      post.likes.push(userId)
      await post.save()
      res.json({ 
        message: 'Post liked',
        liked: true,
        likesCount: post.likes.length 
      })
    }
  } catch (err) {
    console.error('Like post error:', err)
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid post ID' })
    }
    res.status(500).json({ message: 'Server error' })
  }
}

exports.commentOnPost = async (req, res) => {
  try {
    const { text } = req.body
    
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: 'Comment text is required' })
    }
    
    const post = await BlogPost.findById(req.params.id)
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' })
    }
    
    const comment = {
      user: req.user.id,
      text: text.trim()
    }
    
    post.comments.push(comment)
    await post.save()
    
    
    await post.populate('comments.user', 'username')
    const newComment = post.comments[post.comments.length - 1]
    
    res.status(201).json({
      message: 'Comment added successfully',
      comment: newComment
    })
  } catch (err) {
    console.error('Comment on post error:', err)
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid post ID' })
    }
    res.status(500).json({ message: 'Server error' })
  }
}

exports.deleteComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params
    
    const post = await BlogPost.findById(postId)
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' })
    }
    
    const comment = post.comments.id(commentId)
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' })
    }
    
    
    const isCommentAuthor = comment.user.toString() === req.user.id
    const isPostAuthor = post.author.toString() === req.user.id
    
    if (!isCommentAuthor && !isPostAuthor) {
      return res.status(403).json({ message: 'Unauthorized - Only the comment author or post author can delete this comment' })
    }
    
    comment.remove()
    await post.save()
    
    res.json({ message: 'Comment deleted successfully' })
  } catch (err) {
    console.error('Delete comment error:', err)
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid post or comment ID' })
    }
    res.status(500).json({ message: 'Server error' })
  }
}

exports.getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params
    const { page = 1, limit = 10 } = req.query
    
    const skip = (page - 1) * limit
    
    const posts = await BlogPost.find({ author: userId })
      .populate('author', 'username')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
    
    const total = await BlogPost.countDocuments({ author: userId })
    
    res.json({
      posts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalPosts: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    })
  } catch (err) {
    console.error('Get user posts error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

exports.searchPosts = async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query
    
    if (!q) {
      return res.status(400).json({ message: 'Search query is required' })
    }
    
    const skip = (page - 1) * limit
    
    const searchRegex = new RegExp(q, 'i')
    
    const posts = await BlogPost.find({
      $or: [
        { title: searchRegex },
        { content: searchRegex }
      ]
    })
      .populate('author', 'username')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
    
    const total = await BlogPost.countDocuments({
      $or: [
        { title: searchRegex },
        { content: searchRegex }
      ]
    })
    
    res.json({
      posts,
      query: q,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalPosts: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    })
  } catch (err) {
    console.error('Search posts error:', err)
    res.status(500).json({ message: 'Server error' })
  }
} 