module.exports = class Auth {
    constructor({ utils, cache, config, cortex, managers, validators, mongomodels }) {
        this.config = config;
        this.cache = cache;
        this.mongomodels = mongomodels;
        this.managers = managers;
        this.userExposed = [
            'post=login',
            'post=logout',
            'post=refreshToken',
            'post=validateToken'
        ];
    }

    async login({ username, password }) {
        try {
            // Find user and check status
            const user = await this.mongomodels.User.findOne({ 
                username,
                status: 'active'
            });
            if (!user) return { error: 'Invalid credentials' };

            // Verify password
            const isValid = await this.managers.auth.comparePassword(password, user.password);
            if (!isValid) return { error: 'Invalid credentials' };

            // Generate tokens
            const accessToken = this.managers.token.generateShortToken({
                userId: user._id,
                role: user.role,
                schoolId: user.schoolId // Include schoolId for school-specific access
            });

            const refreshToken = this.managers.token.generateLongToken({
                userId: user._id
            });

            // Store refresh token in cache with user info
            await this.cache.set(
                `refresh_token:${user._id}`,
                {
                    token: refreshToken,
                    role: user.role,
                    schoolId: user.schoolId
                },
                this.config.auth.refreshTokenTTL
            );

            // Remove sensitive data
            const userResponse = user.toObject();
            delete userResponse.password;

            return {
                user: userResponse,
                tokens: {
                    accessToken,
                    refreshToken
                }
            };
        } catch (error) {
            return { error: 'Authentication failed' };
        }
    }

    async logout({ userId }) {
        try {
            // Remove refresh token from cache
            await this.cache.del(`refresh_token:${userId}`);
            return { success: true };
        } catch (error) {
            return { error: 'Logout failed' };
        }
    }

    async refreshToken({ refreshToken }) {
        try {
            const decoded = this.managers.token.verifyLongToken({ token: refreshToken });
            if (!decoded) return { error: 'Invalid refresh token' };

            // Get cached refresh token data
            const cachedData = await this.cache.get(`refresh_token:${decoded.userId}`);
            if (!cachedData || cachedData.token !== refreshToken) {
                return { error: 'Invalid refresh token' };
            }

            // Generate new access token with same permissions
            const accessToken = this.managers.token.generateShortToken({
                userId: decoded.userId,
                role: cachedData.role,
                schoolId: cachedData.schoolId
            });

            return { accessToken };
        } catch (error) {
            return { error: 'Token refresh failed' };
        }
    }
}; 