const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // never returned in queries by default
    },
    role: {
      type: String,
      enum: ['student', 'warden'],
      default: 'student',
    },
    // Student-specific fields
    rollNo: {
      type: String,
      trim: true,
      default: null,
    },
    department: {
      type: String,
      trim: true,
      default: null,
    },
    batch: {
      type: String,
      default: null,
    },
    roomNumber: {
      type: String,
      default: null,
    },
    block: {
      type: String,
      enum: ['A', 'B', null],
      default: null,
    },
    phone: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Instance method — compare plain password with hash
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Instance method — return safe public profile (no password)
userSchema.methods.toPublicJSON = function () {
  return {
    _id:        this._id,
    name:       this.name,
    email:      this.email,
    role:       this.role,
    rollNo:     this.rollNo,
    department: this.department,
    batch:      this.batch,
    roomNumber: this.roomNumber,
    block:      this.block,
    phone:      this.phone,
    createdAt:  this.createdAt,
  };
};

module.exports = mongoose.model('User', userSchema);
