const mongoose = require('mongoose');

const classroomModel = new mongoose.Schema({
    name: {
        type: 'string',
        required: true,
        index: true
    },
    schoolId: {
        type: 'objectId',
        ref: 'School',
        required: true,
        index: true
    },
    capacity: {
        type: 'number',
        required: true
    },
    grade: {
        type: 'string',
        required: true,
        index: true
    },
    teacher: {
        type: 'string',
        required: true
    },
    students: {
        type: 'array',
        schema: {
            type: 'objectId',
            ref: 'Student'
        },
        default: []
    },
    resources: {
        type: 'object',
        schema: {
            computers: {
                type: 'number',
                default: 0
            },
            projector: {
                type: 'boolean',
                default: false
            },
            whiteboard: {
                type: 'boolean',
                default: true
            },
            specialEquipment: {
                type: 'array',
                schema: {
                    type: 'string'
                },
                default: []
            }
        }
    },
    status: {
        type: 'string',
        enum: ['active', 'inactive', 'maintenance'],
        default: 'active',
        index: true
    },
    createdAt: {
        type: 'date',
        default: Date.now
    },
    updatedAt: {
        type: 'date',
        default: Date.now
    }
});

// Add indexes for common queries
classroomModel.index({ schoolId: 1, grade: 1 });
classroomModel.index({ schoolId: 1, status: 1 });
classroomModel.index({ createdAt: -1 });

module.exports = mongoose.model('Classroom', classroomModel);