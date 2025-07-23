const BlogPost = require('../models/BlogPost')

exports.createPost = async (req, res) => {
  try {
    const { title, content } = req.body
    const post = new BlogPost({
      title,
      content,
      author: req.user.id
    })
    await post.save()
    res.status(201).json(post)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

exports.getAllPosts = async (req, res) => {
  try {
    const posts = await BlogPost.find().populate('author', 'username').sort({ createdAt: -1 })
    res.json(posts)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

exports.getPostById = async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id).populate('author', 'username').populate('comments.user', 'username')
    if (!post) return res.status(404).json({ message: 'Post not found' })
    res.json(post)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

exports.deletePost = async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id)
    if (!post) return res.status(404).json({ message: 'Post not found' })
    if (post.author.toString() !== req.user.id) return res.status(403).json({ message: 'Unauthorized' })
    await post.remove()
    res.json({ message: 'Post deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

exports.likePost = async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id)
    if (!post) return res.status(404).json({ message: 'Post not found' })
    const userId = req.user.id
    if (post.likes.includes(userId)) {
      post.likes = post.likes.filter(id => id.toString() !== userId)
    } else {
      post.likes.push(userId)
    }
    await post.save()
    res.json({ likes: post.likes.length })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

exports.commentOnPost = async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id)
    if (!post) return res.status(404).json({ message: 'Post not found' })
    const comment = {
      user: req.user.id,
      text: req.body.text
    }
    post.comments.push(comment)
    await post.save()
    res.status(201).json(post.comments)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
} 