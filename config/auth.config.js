module.exports = {
    jwt: {
        accessToken: {
            secret: process.env.JWT_ACCESS_SECRET,
            expiresIn: '15m'
        },
        refreshToken: {
            secret: process.env.JWT_REFRESH_SECRET,
            expiresIn: '7d'
        }
    },
    permissions: {
        superadmin: {
            level: 3,
            description: 'Full system access'
        },
        schoolAdmin: {
            level: 2,
            description: 'School-specific access'
        },
        student: {
            level: 1,
            description: 'Limited access'
        }
    }
}; 