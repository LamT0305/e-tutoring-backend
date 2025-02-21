// models/Document.js
const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  document_id: { type: Number, unique: true, required: true },
  uploaded_by: { type: Number, required: true, ref: 'User' },
  file_name: { type: String, required: true },
  file_path: { type: String, required: true },
  uploaded_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Document', documentSchema);
