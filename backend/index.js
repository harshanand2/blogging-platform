const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config({ path: __dirname + '/.env' })

const app = express()

app.use(express.json())
app.use(cors())

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('MongoDB connection error:', err))

const authRoutes = require('./routes/auth')
app.use('/api/auth', authRoutes)

const blogRoutes = require('./routes/blog')
app.use('/api/blogs', blogRoutes)

app.get('/', (req, res) => {
  res.send('Blogging platform backend running')
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
}) 