const mongoose = require('mongoose');

// Matches image URLs or base64 data URIs
const urlRegex = /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|svg|webp))$/i;
const base64Regex = /^data:image\/(png|jpg|jpeg|gif|svg|webp);base64,/i;

const categories = [
  'All Categories',
  'Tech & Programming',
  'Business & Finance',
  'Health & Fitness',
  'Travel & Adventure',
  'Lifestyle & Fashion',
  'Food & Cooking',
];

const BlogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
    validate: {
      validator: function (value) {
        // Accept either URL or base64 data URI
        return urlRegex.test(value) || base64Regex.test(value);
      },
      message: 'Invalid image format. Must be a valid image URL or base64 data URI',
    },
  },
  author: {
    type: String,
    required: true,
  },
  authorId: {
    type: String,
    required: true,
  },
  category: {
    type: [String],              
    default: ['All Categories'], 
    enum: categories,            
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Blog', BlogSchema);
