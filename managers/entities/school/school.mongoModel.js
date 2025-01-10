const mongoose = require('mongoose');

const schoolModel = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    address: {
        type: String,
        required: true
    },
    contactEmail: {
        type: String,
        required: true,
        lowercase: true
    },
    contactPhone: {
        type: String,
        required: true
    },
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'suspended'],
        default: 'active'
    },
    description: {
        type: String,
        default: ''
    },
    website: {
        type: String,
        default: ''
    },
    logo: {
        type: String,
        default: ''
    },
    socialMedia: {
        facebook: String,
        twitter: String,
        instagram: String
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

// Indexes
schoolModel.index({ name: 1 });
schoolModel.index({ status: 1 });
schoolModel.index({ adminId: 1 });

module.exports = mongoose.model('School', schoolModel);