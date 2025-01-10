module.exports = {
    createClassroom: {
        name: {
            type: 'string',
            required: true,
            min: 1,
            max: 100
        },
        schoolId: {
            type: 'objectId',
            required: true
        },
        capacity: {
            type: 'number',
            required: true,
            min: 1,
            max: 100
        },
        grade: {
            type: 'string',
            required: true,
            enum: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
        },
        teacher: {
            type: 'string',
            required: true
        },
        resources: {
            type: 'object',
            schema: {
                computers: {
                    type: 'number',
                    min: 0,
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
                    }
                }
            }
        }
    },

    updateClassroom: {
        classroomId: {
            type: 'objectId',
            required: true
        },
        name: {
            type: 'string',
            min: 1,
            max: 100
        },
        capacity: {
            type: 'number',
            min: 1,
            max: 100
        },
        grade: {
            type: 'string',
            enum: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
        },
        teacher: {
            type: 'string'
        },
        status: {
            type: 'string',
            enum: ['active', 'inactive', 'maintenance']
        }
    },

    updateResources: {
        classroomId: {
            type: 'objectId',
            required: true
        },
        resources: {
            type: 'object',
            required: true,
            schema: {
                computers: {
                    type: 'number',
                    min: 0
                },
                projector: {
                    type: 'boolean'
                },
                whiteboard: {
                    type: 'boolean'
                },
                specialEquipment: {
                    type: 'array',
                    schema: {
                        type: 'string'
                    }
                }
            }
        }
    },

    assignStudents: {
        classroomId: {
            type: 'objectId',
            required: true
        },
        studentIds: {
            type: 'array',
            required: true,
            schema: {
                type: 'objectId'
            }
        }
    },

    removeStudents: {
        classroomId: {
            type: 'objectId',
            required: true
        },
        studentIds: {
            type: 'array',
            required: true,
            schema: {
                type: 'objectId'
            }
        }
    }
}; 