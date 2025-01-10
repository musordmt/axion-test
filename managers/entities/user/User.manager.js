module.exports = class User {
    constructor({ utils, cache, config, cortex, managers, validators, mongomodels }) {
        this.config = config;
        this.validators = validators;
        this.mongomodels = mongomodels;
        this.managers = managers;
        this.cache = cache;
        this.utils = utils;
        this.userExposed = [
            'post=createUser',
            'put=updateUser',
            'get=getUser',
            'get=listUsers',
            'put=changePassword',
            'put=resetPassword',
            'put=updateProfile',
            'post=deactivateUser',
            'get=getUsersByRole',
            'post=assignRole',
            'post=authenticate',
            'post=refreshToken'
        ];
    }

    async createUser({ __role, username, email, password, role, schoolId }) {
        // Validate role permissions
        const rolePermissions = {
            'superadmin': ['schoolAdmin'],
            'schoolAdmin': ['student'],
            'student': []
        };
    
        if (!rolePermissions[__role]?.includes(role)) {
            return { error: `${__role} can only create ${rolePermissions[__role]?.join(', ') || 'no'} users` };
        }
    
        const validationResult = await this.validators.user.createUser({
            username, email, password, role
        });
        if (validationResult.errors) return validationResult;
    
        try {
            // Check if school exists for school-specific roles
            if (['schoolAdmin', 'student'].includes(role)) {
                if (!schoolId) return { error: 'School ID is required' };
                const school = await this.mongomodels.School.findById(schoolId);
                if (!school) return { error: 'School not found' };
            }
    
            const hashedPassword = await this.managers.auth.hashPassword(password);
            const user = await this.mongomodels.User.create({
                username,
                email,
                password: hashedPassword,
                role,
                schoolId,
                status: 'active',
                createdAt: new Date(),
                updatedAt: new Date()
            });
    
            const userResponse = user.toObject();
            delete userResponse.password;
    
            return { user: userResponse };
        } catch (error) {
            if (error.code === 11000) {
                const field = error.message.includes('username') ? 'username' : 'email';
                return { error: `This ${field} is already in use` };
            }
            return { error: 'Failed to create user' };
        }
    }

    async authenticate({ username, password }) {
        try {
            const user = await this.mongomodels.User.findOne({ 
                username,
                status: 'active'
            }).select('+password'); // Explicitly include password field if it's select: false
    
            if (!user) return { error: 'Invalid credentials' };
    
            const isValid = await this.managers.auth.comparePassword(password, user.password);
            if (!isValid) return { error: 'Invalid credentials' };
    
            const tokenPayload = {
                userId: user._id,
                role: user.role,
                schoolId: user.schoolId // Include schoolId in token if exists
            };
    
            const accessToken = this.managers.token.generateShortToken(tokenPayload);
            const refreshToken = this.managers.token.generateLongToken({ userId: user._id });
    
            // Store refresh token with user metadata
            const tokenMetadata = {
                token: refreshToken,
                userAgent: this.utils.getUserAgent(),
                ip: this.utils.getClientIP(),
                createdAt: new Date()
            };
    
            await this.cache.set(
                `refresh_token:${user._id}`,
                JSON.stringify(tokenMetadata),
                this.config.auth.refreshTokenTTL
            );
    
            const userResponse = user.toObject();
            delete userResponse.password;
    
            return {
                user: userResponse,
                tokens: { accessToken, refreshToken }
            };
        } catch (error) {
            return { error: 'Authentication failed' };
        }
    }

    async refreshToken({ refreshToken }) {
        try {
            const decoded = this.managers.token.verifyLongToken({ token: refreshToken });
            if (!decoded) return { error: 'Invalid refresh token' };
    
            const cachedData = await this.cache.get(`refresh_token:${decoded.userId}`);
            if (!cachedData) return { error: 'Token expired' };
    
            const tokenMetadata = JSON.parse(cachedData);
            if (tokenMetadata.token !== refreshToken) {
                return { error: 'Token revoked' };
            }
    
            const user = await this.mongomodels.User.findOne({
                _id: decoded.userId,
                status: 'active'
            });
            if (!user) return { error: 'User not found or inactive' };
    
            const tokenPayload = {
                userId: user._id,
                role: user.role,
                schoolId: user.schoolId
            };
    
            const newAccessToken = this.managers.token.generateShortToken(tokenPayload);
            const newRefreshToken = this.managers.token.generateLongToken({ userId: user._id });
    
            // Update token metadata
            const newTokenMetadata = {
                ...tokenMetadata,
                token: newRefreshToken,
                updatedAt: new Date()
            };
    
            await this.cache.set(
                `refresh_token:${user._id}`,
                JSON.stringify(newTokenMetadata),
                this.config.auth.refreshTokenTTL
            );
    
            return { 
                accessToken: newAccessToken,
                refreshToken: newRefreshToken
            };
        } catch (error) {
            return { error: 'Token refresh failed' };
        }
    }

    async changePassword({ __role, userId, currentPassword, newPassword }) {
        const validationResult = await this.validators.user.changePassword({
            currentPassword, newPassword
        });
        if (validationResult.errors) return validationResult;

        try {
            const user = await this.mongomodels.User.findOne({
                _id: userId,
                status: 'active'
            }).select('+password');
            
            if (!user) return { error: 'User not found or inactive' };

            const isValid = await this.managers.auth.comparePassword(currentPassword, user.password);
            if (!isValid) return { error: 'Current password is incorrect' };

            // Prevent reuse of current password
            const isSamePassword = await this.managers.auth.comparePassword(newPassword, user.password);
            if (isSamePassword) return { error: 'New password must be different from current password' };

            const hashedPassword = await this.managers.auth.hashPassword(newPassword);
            
            await this.mongomodels.User.updateOne(
                { _id: userId },
                { 
                    $set: {
                        password: hashedPassword,
                        updatedAt: new Date(),
                        lastPasswordChange: new Date()
                    }
                }
            );

            // Invalidate all sessions
            await this.cache.del(`refresh_token:${userId}`);
            
            // Log password change event
            await this.utils.auditLog({
                userId: userId,
                action: 'PASSWORD_CHANGE',
                details: 'Password changed by user'
            });

            return { 
                success: true,
                message: 'Password successfully changed'
            };
        } catch (error) {
            return { error: 'Failed to change password' };
        }
    }

    async resetPassword({ __role, userId, newPassword }) {
        if (!['superadmin', 'schoolAdmin'].includes(__role)) {
            return { error: 'Unauthorized' };
        }

        const validationResult = await this.validators.user.resetPassword({ newPassword });
        if (validationResult.errors) return validationResult;

        try {
            const query = { _id: userId, status: 'active' };
            if (__role === 'schoolAdmin') {
                query.role = 'student';
            }

            const user = await this.mongomodels.User.findOne(query);
            if (!user) return { error: 'User not found or access denied' };

            const hashedPassword = await this.managers.auth.hashPassword(newPassword);
            
            await this.mongomodels.User.updateOne(
                { _id: userId },
                { 
                    $set: {
                        password: hashedPassword,
                        updatedAt: new Date(),
                        lastPasswordReset: new Date(),
                        passwordResetBy: __role
                    }
                }
            );

            // Invalidate all sessions
            await this.cache.del(`refresh_token:${userId}`);

            // Log password reset event
            await this.utils.auditLog({
                userId,
                performedBy: __role,
                action: 'PASSWORD_RESET',
                details: 'Password reset by administrator'
            });

            return { 
                success: true,
                message: 'Password successfully reset'
            };
        } catch (error) {
            return { error: 'Failed to reset password' };
        }
    }

    async assignRole({ __role, userId, newRole, schoolId }) {
        if (__role !== 'superadmin') return { error: 'Unauthorized' };

        const allowedRoles = ['schoolAdmin', 'student'];
        if (!allowedRoles.includes(newRole)) {
            return { error: `Role must be one of: ${allowedRoles.join(', ')}` };
        }

        try {
            const user = await this.mongomodels.User.findOne({
                _id: userId,
                status: 'active'
            });
            
            if (!user) return { error: 'User not found or inactive' };

            // Verify school for school-specific roles
            if (newRole === 'student' || newRole === 'schoolAdmin') {
                if (!schoolId) return { error: 'School ID is required for this role' };
                
                const school = await this.mongomodels.School.findOne({
                    _id: schoolId,
                    status: 'active'
                });
                if (!school) return { error: 'School not found or inactive' };
            }

            const oldRole = user.role;
            const oldSchoolId = user.schoolId;

            await this.mongomodels.User.updateOne(
                { _id: userId },
                { 
                    $set: {
                        role: newRole,
                        schoolId: schoolId || null,
                        updatedAt: new Date(),
                        lastRoleChange: new Date()
                    }
                }
            );

            // Invalidate all sessions
            await this.cache.del(`refresh_token:${userId}`);

            // Log role change event
            await this.utils.auditLog({
                userId,
                performedBy: __role,
                action: 'ROLE_CHANGE',
                details: {
                    oldRole,
                    newRole,
                    oldSchoolId,
                    newSchoolId: schoolId
                }
            });

            return { 
                success: true,
                message: `Role successfully changed to ${newRole}`
            };
        } catch (error) {
            return { error: 'Failed to assign role' };
        }
    }

    async deactivateUser({ __role, schoolId, userId }) {
        if (!['superadmin', 'schoolAdmin'].includes(__role)) {
            return { error: 'Unauthorized' };
        }

        try {
            const query = { 
                _id: userId,
                status: 'active'
            };

            if (__role === 'schoolAdmin') {
                query.schoolId = schoolId;
                query.role = 'student';
            }

            const user = await this.mongomodels.User.findOne(query);
            if (!user) return { error: 'User not found or access denied' };

            await this.mongomodels.User.updateOne(
                { _id: userId },
                { 
                    $set: {
                        status: 'inactive',
                        updatedAt: new Date(),
                        deactivatedAt: new Date(),
                        deactivatedBy: __role
                    }
                }
            );

            // Invalidate all sessions
            await this.cache.del(`refresh_token:${userId}`);

            // Log deactivation event
            await this.utils.auditLog({
                userId,
                performedBy: __role,
                action: 'USER_DEACTIVATION',
                details: 'User account deactivated'
            });

            return { 
                success: true,
                message: 'User successfully deactivated'
            };
        } catch (error) {
            return { error: 'Failed to deactivate user' };
        }
    }

    async getUsersByRole({ __role, schoolId, role, page = 1, limit = 10, status = 'active' }) {
        if (!['superadmin', 'schoolAdmin'].includes(__role)) {
            return { error: 'Unauthorized' };
        }

        try {
            const query = { status };
            
            if (__role === 'schoolAdmin') {
                query.schoolId = schoolId;
                query.role = 'student';
            } else if (role) {
                query.role = role;
            }

            const skip = (page - 1) * limit;

            const [users, total] = await Promise.all([
                this.mongomodels.User.find(query)
                    .select('-password')
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean(),
                this.mongomodels.User.countDocuments(query)
            ]);

            return { 
                users,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            return { error: 'Failed to fetch users' };
        }
    }

    async updateUser({ __role, schoolId, userId, updateData }) {
        if (!['superadmin', 'schoolAdmin'].includes(__role)) {
            return { error: 'Unauthorized' };
        }
    
        try {
            // Build query based on role
            const query = { _id: userId };
            if (__role === 'schoolAdmin') {
                query.schoolId = schoolId;
                query.role = 'student'; // School admins can only update students
            }
    
            // Sanitize update data
            const allowedFields = ['username', 'email', 'status'];
            const sanitizedUpdate = Object.keys(updateData)
                .filter(key => allowedFields.includes(key))
                .reduce((obj, key) => {
                    obj[key] = updateData[key];
                    return obj;
                }, {});
    
            sanitizedUpdate.updatedAt = new Date();
    
            const user = await this.mongomodels.User.findOneAndUpdate(
                query,
                { $set: sanitizedUpdate },
                { 
                    new: true,
                    runValidators: true
                }
            );
    
            if (!user) return { error: 'User not found or access denied' };
    
            const userResponse = user.toObject();
            delete userResponse.password;
    
            return { user: userResponse };
        } catch (error) {
            if (error.code === 11000) {
                const field = error.message.includes('username') ? 'username' : 'email';
                return { error: `This ${field} is already in use` };
            }
            return { error: 'Failed to update user' };
        }
    }

    async getUser({ __role, schoolId, userId }) {
        if (!['superadmin', 'schoolAdmin'].includes(__role)) {
            return { error: 'Unauthorized' };
        }

        try {
            const query = { _id: userId };
            
            if (__role === 'schoolAdmin') {
                query.schoolId = schoolId;
                query.role = 'student';
            }

            const user = await this.mongomodels.User.findOne(query)
                .select('-password')
                .lean();

            if (!user) return { error: 'User not found or access denied' };

            // Get additional user data if needed
            const [lastLogin] = await this.cache.get(`last_login:${userId}`);
            
            return { 
                user: {
                    ...user,
                    lastLogin: lastLogin || null
                }
            };
        } catch (error) {
            return { error: 'Failed to fetch user' };
        }
    }

    async listUsers({ __role, schoolId, filters = {}, page = 1, limit = 10, sort = { createdAt: -1 } }) {
        if (!['superadmin', 'schoolAdmin'].includes(__role)) {
            return { error: 'Unauthorized' };
        }

        try {
            const query = { status: 'active', ...filters };
            
            if (__role === 'schoolAdmin') {
                query.schoolId = schoolId;
                query.role = 'student';
            }

            const skip = (page - 1) * limit;

            const [users, total] = await Promise.all([
                this.mongomodels.User.find(query)
                    .select('-password')
                    .sort(sort)
                    .skip(skip)
                    .limit(limit)
                    .lean(),
                this.mongomodels.User.countDocuments(query)
            ]);

            // Enhance user data with additional information
            const enhancedUsers = await Promise.all(users.map(async (user) => {
                const [lastLogin] = await this.cache.get(`last_login:${user._id}`);
                return {
                    ...user,
                    lastLogin: lastLogin || null
                };
            }));

            return { 
                users: enhancedUsers,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            return { error: 'Failed to fetch users' };
        }
    }

    async updateProfile({ __role, schoolId, userId, updateData }) {
        try {
            // Validate that the user can only update their own profile
            if (!userId) return { error: 'User ID is required' };

            // Find the user
            const query = { _id: userId };
            if (__role === 'schoolAdmin' || __role === 'student') {
                query.schoolId = schoolId;
            }

            const user = await this.mongomodels.User.findOne(query);
            if (!user) return { error: 'User not found' };

            // Remove sensitive fields from updateData
            const allowedUpdates = ['username', 'email'];
            const sanitizedUpdate = Object.keys(updateData)
                .filter(key => allowedUpdates.includes(key))
                .reduce((obj, key) => {
                    obj[key] = updateData[key];
                    return obj;
                }, {});

            // Update the user profile
            const updatedUser = await this.mongomodels.User.findByIdAndUpdate(
                userId,
                { 
                    ...sanitizedUpdate,
                    updatedAt: new Date()
                },
                { new: true }
            );

            // Remove sensitive data from response
            const userResponse = updatedUser.toObject();
            delete userResponse.password;

            return { user: userResponse };
        } catch (error) {
            if (error.code === 11000) {
                return { error: 'Username or email already exists' };
            }
            return { error: 'Failed to update profile' };
        }
    }
};
