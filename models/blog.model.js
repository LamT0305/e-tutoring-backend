// models/Blog.js
const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  blog_id: { type: Number, unique: true, required: true },
  author_id: { type: Number, required: true, ref: 'User' },
  title: { type: String, required: true },
  content: { type: String, required: true },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Blog', blogSchema);
