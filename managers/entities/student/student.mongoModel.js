const mongoose = require('mongoose');

const studentModel = new mongoose.Schema({
    userId: {
        type: 'ObjectId',
        required: true,
        ref: 'users'
    },
    schoolId: {
        type: 'ObjectId',
        required: true,
        ref: 'schools'
    },
    classroomId: {
        type: 'ObjectId',
        required: true,
        ref: 'classrooms'
    },
    grade: {
        type: 'String',
        required: true
    },
    personalInfo: {
        type: 'Object',
        required: true
    },
    status: {
        type: 'String',
        required: true,
        default: 'active'
    },
    attendance: {
        type: 'Array',
        schema: {
            date: {
                type: 'Date',
                required: true
            },
            status: {
                type: 'String',
                required: true
            },
            notes: {
                type: 'String'
            },
            recordedBy: {
                type: 'ObjectId',
                required: true,
                ref: 'users'
            }
        }
    },
    enrollmentDate: {
        type: 'Date',
        required: true
    },
    createdAt: {
        type: 'Date',
        required: true
    },
    updatedAt: {
        type: 'Date',
        required: true
    }
});

studentModel.index({ schoolId: 1 }, { background: true });
studentModel.index({ userId: 1 }, { unique: true, background: true });
studentModel.index({ classroomId: 1 }, { background: true });
studentModel.index({ status: 1 }, { background: true });

module.exports = mongoose.model('Student', studentModel);