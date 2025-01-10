module.exports = {
    createSchool: {
        name: {
            type: 'string',
            required: true,
            minLength: 2,
            maxLength: 100
        },
        address: {
            type: 'string',
            required: true,
            minLength: 5,
            maxLength: 200
        },
        contactEmail: {
            type: 'string',
            required: true,
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        },
        contactPhone: {
            type: 'string',
            required: true,
            pattern: /^\+?[\d\s-]{8,20}$/
        }
    },

    updateSchool: {
        name: {
            type: 'string',
            minLength: 2,
            maxLength: 100
        },
        address: {
            type: 'string',
            minLength: 5,
            maxLength: 200
        },
        contactEmail: {
            type: 'string',
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        },
        contactPhone: {
            type: 'string',
            pattern: /^\+?[\d\s-]{8,20}$/
        },
        status: {
            type: 'string',
            enum: ['active', 'inactive', 'suspended']
        }
    },

    updateProfile: {
        description: {
            type: 'string',
            maxLength: 1000
        },
        website: {
            type: 'string',
            pattern: /^https?:\/\/.+/
        },
        logo: {
            type: 'string',
            maxLength: 500
        },
        socialMedia: {
            type: 'object',
            properties: {
                facebook: { type: 'string' },
                twitter: { type: 'string' },
                instagram: { type: 'string' }
            }
        }
    }
}; 