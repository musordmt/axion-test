module.exports = ({ managers }) => {
    const rolePermissions = {
        superadmin: {
            allowedPaths: ['*'],
            allowedMethods: ['*']
        },
        schoolAdmin: {
            allowedPaths: [
                '/api/schools/:schoolId',
                '/api/classrooms',
                '/api/students',
                '/api/users'
            ],
            restrictedMethods: {
                '/api/schools': ['POST', 'DELETE'],
                '/api/users': ['DELETE']
            }
        },
        student: {
            allowedPaths: [
                '/api/students/profile',
                '/api/classrooms/:classroomId/schedule'
            ],
            allowedMethods: ['GET']
        }
    };

    return async ({ req, res, next, results }) => {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) return { error: 'No token provided' };
        try {
            // Verify token and get user info
            const decoded = managers.token.verifyShortToken({ token });
            if (!decoded) return { error: 'Invalid token' };

            const { userId, role, schoolId } = decoded;

            // Get user from database to ensure they're still active
            const user = await managers.mongomodels.User.findOne({
                _id: userId,
                status: 'active'
            });
            if (!user) return { error: 'User not found or inactive' };

            // Check role permissions
            const permissions = rolePermissions[role];
            if (!permissions) return { error: 'Invalid role' };

            // For school admin, verify school-specific access
            if (role === 'schoolAdmin') {
                const requestedSchoolId = req.params.schoolId || req.body.schoolId;
                if (requestedSchoolId && requestedSchoolId !== schoolId.toString()) {
                    return { error: 'Unauthorized access to school resources' };
                }
            }

            // Check path and method permissions
            const path = req.path;
            const method = req.method;

            if (role !== 'superadmin') {
                const hasAccess = permissions.allowedPaths.some(allowedPath => {
                    // Convert path pattern to regex
                    const pattern = allowedPath.replace(/:\w+/g, '[^/]+');
                    return new RegExp(`^${pattern}$`).test(path);
                });

                if (!hasAccess) return { error: 'Unauthorized access to resource' };

                // Check method restrictions
                const restrictions = permissions.restrictedMethods[path];
                if (restrictions && restrictions.includes(method)) {
                    return { error: 'Unauthorized method' };
                }
            }

            // Add user info to results for downstream use
            results.__role = role;
            results.userId = userId;
            results.schoolId = schoolId;

            return next();
        } catch (error) {
            return { error: 'Authorization failed' };
        }
    };
}; 