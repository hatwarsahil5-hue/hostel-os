const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema(
  {
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    body: {
      type: String,
      required: [true, 'Body is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['normal', 'urgent', 'info'],
      default: 'normal',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notice', noticeSchema);
