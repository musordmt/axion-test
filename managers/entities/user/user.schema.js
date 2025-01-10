module.exports = {
    createUser: [
        {
            model: 'username',
            required: true,
            type: 'string',
            minLength: 3,
            maxLength: 50
        },
        {
            model: 'email',
            required: true,
            type: 'email'
        },
        {
            model: 'password',
            required: true,
            type: 'string',
            minLength: 8
        },
        {
            model: 'role',
            required: true,
            type: 'enum',
            values: ['superadmin', 'schoolAdmin', 'student']
        },
        {
            model: 'schoolId',
            required: function(data) {
                return ['schoolAdmin', 'student'].includes(data.role);
            },
            type: 'mongoId'
        }
    ],
    changePassword: [
        {
            model: 'currentPassword',
            required: true,
            type: 'string'
        },
        {
            model: 'newPassword',
            required: true,
            type: 'string',
            minLength: 8
        }
    ],
    resetPassword: [
        {
            model: 'newPassword',
            required: true,
            type: 'string',
            minLength: 8
        }
    ],
    updateUser: [
        {
            model: 'username',
            required: false,
            type: 'string',
            minLength: 3,
            maxLength: 50
        },
        {
            model: 'email',
            required: false,
            type: 'email'
        },
        {
            model: 'status',
            required: false,
            type: 'enum',
            values: ['active', 'inactive']
        }
    ],
    updateProfile: [
        {
            model: 'username',
            required: false,
            type: 'string',
            minLength: 3,
            maxLength: 50
        },
        {
            model: 'email',
            required: false,
            type: 'email'
        }
    ],
    assignRole: [
        {
            model: 'userId',
            required: true,
            type: 'mongoId'
        },
        {
            model: 'newRole',
            required: true,
            type: 'enum',
            values: ['schoolAdmin', 'student']
        },
        {
            model: 'schoolId',
            required: function(data) {
                return ['schoolAdmin', 'student'].includes(data.newRole);
            },
            type: 'mongoId'
        }
    ],
    authenticate: [
        {
            model: 'username',
            required: true,
            type: 'string'
        },
        {
            model: 'password',
            required: true,
            type: 'string'
        }
    ],
    refreshToken: [
        {
            model: 'refreshToken',
            required: true,
            type: 'string'
        }
    ],
    deactivateUser: [
        {
            model: 'userId',
            required: true,
            type: 'mongoId'
        }
    ],
    getUsersByRole: [
        {
            model: 'role',
            required: false,
            type: 'enum',
            values: ['superadmin', 'schoolAdmin', 'student']
        },
        {
            model: 'page',
            required: false,
            type: 'number',
            default: 1
        },
        {
            model: 'limit',
            required: false,
            type: 'number',
            default: 10
        },
        {
            model: 'status',
            required: false,
            type: 'enum',
            values: ['active', 'inactive'],
            default: 'active'
        }
    ],
    listUsers: [
        {
            model: 'page',
            required: false,
            type: 'number',
            default: 1
        },
        {
            model: 'limit',
            required: false,
            type: 'number',
            default: 10
        },
        {
            model: 'filters',
            required: false,
            type: 'object'
        },
        {
            model: 'sort',
            required: false,
            type: 'object',
            default: { createdAt: -1 }
        }
    ]
}