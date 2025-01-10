const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 50
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        select: false // Hide password by default in queries
    },
    role: {
        type: String,
        required: true,
        enum: ['superadmin', 'schoolAdmin', 'student']
    },
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: function() {
            return ['schoolAdmin', 'student'].includes(this.role);
        }
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    lastPasswordChange: {
        type: Date
    },
    lastPasswordReset: {
        type: Date
    },
    passwordResetBy: {
        type: String
    },
    lastRoleChange: {
        type: Date
    },
    deactivatedAt: {
        type: Date
    },
    deactivatedBy: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Indexes for performance
userSchema.index({ username: 1 }, { unique: true });
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });
userSchema.index({ schoolId: 1 });
userSchema.index({ status: 1 });

module.exports = mongoose.model('User', userSchema);
