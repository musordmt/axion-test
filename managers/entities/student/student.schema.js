module.exports = {
    createStudent: {
        userId: {
            type: 'string',
            required: true,
            regex: /^[0-9a-fA-F]{24}$/
        },
        schoolId: {
            type: 'string',
            required: true,
            regex: /^[0-9a-fA-F]{24}$/
        },
        classroomId: {
            type: 'string',
            required: true,
            regex: /^[0-9a-fA-F]{24}$/
        },
        grade: {
            type: 'string',
            required: true
        },
        personalInfo: {
            type: 'object',
            required: true
        }
    },

    updateStudent: {
        studentId: {
            type: 'string',
            required: true,
            regex: /^[0-9a-fA-F]{24}$/
        },
        classroomId: {
            type: 'string',
            regex: /^[0-9a-fA-F]{24}$/
        },
        grade: {
            type: 'string'
        },
        personalInfo: {
            type: 'object'
        }
    },

    recordAttendance: {
        studentId: {
            type: 'string',
            required: true,
            regex: /^[0-9a-fA-F]{24}$/
        },
        date: {
            type: 'date',
            required: true
        },
        status: {
            type: 'string',
            required: true,
            enum: ['present', 'absent', 'late', 'excused']
        },
        notes: {
            type: 'string'
        }
    },

    updateStatus: {
        studentId: {
            type: 'string',
            required: true,
            regex: /^[0-9a-fA-F]{24}$/
        },
        status: {
            type: 'string',
            required: true,
            enum: ['active', 'transferred', 'graduated', 'inactive']
        }
    },

    getStudentById: {
        studentId: {
            type: 'string',
            required: true,
            regex: /^[0-9a-fA-F]{24}$/
        }
    },

    getStudentsBySchool: {
        schoolId: {
            type: 'string',
            required: true,
            regex: /^[0-9a-fA-F]{24}$/
        },
        status: {
            type: 'string',
            enum: ['active', 'transferred', 'graduated', 'inactive']
        },
        grade: {
            type: 'string'
        },
        page: {
            type: 'number',
            min: 1
        },
        limit: {
            type: 'number',
            min: 1,
            max: 100
        }
    },

    getStudentsByClassroom: {
        classroomId: {
            type: 'string',
            required: true,
            regex: /^[0-9a-fA-F]{24}$/
        },
        status: {
            type: 'string',
            enum: ['active', 'transferred', 'graduated', 'inactive']
        },
        page: {
            type: 'number',
            min: 1
        },
        limit: {
            type: 'number',
            min: 1,
            max: 100
        }
    },

    getAttendanceHistory: {
        studentId: {
            type: 'string',
            required: true,
            regex: /^[0-9a-fA-F]{24}$/
        },
        startDate: {
            type: 'date'
        },
        endDate: {
            type: 'date'
        },
        page: {
            type: 'number',
            min: 1
        },
        limit: {
            type: 'number',
            min: 1,
            max: 100
        }
    }
};