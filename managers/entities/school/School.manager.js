module.exports = class School {
    constructor({ utils, cache, config, cortex, managers, validators, mongomodels }) {
        this.config = config;
        this.validators = validators;
        this.mongomodels = mongomodels;
        this.userExposed = [
            'post=createSchool',
            'put=updateSchool',
            'get=getSchool',
            'get=listSchools',
            'delete=deleteSchool',
            'get=getSchoolStats',
            'put=updateSchoolProfile',
            'post=assignSchoolAdmin',
            'post=removeSchoolAdmin'
        ];
    }

    async createSchool({ __role, name, address, contactEmail, contactPhone }) {
        if (__role !== 'superadmin') {
            console.error(`Unauthorized createSchool attempt by role: ${__role}`);
            return { error: 'Unauthorized access: Superadmin role required' };
        }
    
        const validationResult = await this.validators.school.createSchool({
            name, address, contactEmail, contactPhone
        });
        if (validationResult.errors) {
            console.error('School creation validation failed:', validationResult.errors);
            return validationResult;
        }
    
        try {
            const school = await this.mongomodels.School.create({
                name, address, contactEmail, contactPhone,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            console.info(`School created successfully: ${school._id}`);
            return { school };
        } catch (error) {
            console.error('Failed to create school:', error);
            return { error: `Database error: ${error.message}` };
        }
    }

    async updateSchool({ __role, schoolId, ...updateData }) {
        if (__role !== 'superadmin') return { error: 'Unauthorized' };

        const validationResult = await this.validators.school.updateSchool(updateData);
        if (validationResult.errors) return validationResult;

        try {
            const school = await this.mongomodels.School.findByIdAndUpdate(
                schoolId,
                { ...updateData, updatedAt: new Date() },
                { new: true }
            );
            if (!school) return { error: 'School not found' };
            return { school };
        } catch (error) {
            return { error: 'Failed to update school' };
        }
    }

    async getSchool({ schoolId }) {
        if (!schoolId) {
            return { error: 'School ID is required' };
        }
    
        try {
            const school = await this.mongomodels.School.findById(schoolId);
            if (!school) {
                console.warn(`School not found: ${schoolId}`);
                return { error: 'School not found' };
            }
            return { school };
        } catch (error) {
            console.error(`Failed to fetch school ${schoolId}:`, error);
            return { error: `Database error: ${error.message}` };
        }
    }

    async listSchools({ __role, page = 1, limit = 10, status }) {
        if (!['superadmin', 'schoolAdmin'].includes(__role)) {
            console.error(`Unauthorized listSchools attempt by role: ${__role}`);
            return { error: 'Unauthorized: Invalid role' };
        }
    
        const query = status ? { status } : {};
        const skip = (page - 1) * limit;
    
        try {
            const [schools, total] = await Promise.all([
                this.mongomodels.School.find(query)
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit),
                this.mongomodels.School.countDocuments(query)
            ]);
    
            return {
                schools,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            console.error('Failed to fetch schools list:', error);
            return { error: `Database error: ${error.message}` };
        }
    }

    async deleteSchool({ __role, schoolId }) {
        if (__role !== 'superadmin') return { error: 'Unauthorized' };

        try {
            // Check for existing students and classrooms
            const [studentsCount, classroomsCount] = await Promise.all([
                this.mongomodels.Student.countDocuments({ schoolId }),
                this.mongomodels.Classroom.countDocuments({ schoolId })
            ]);

            if (studentsCount > 0 || classroomsCount > 0) {
                return { error: 'Cannot delete school with existing students or classrooms' };
            }

            const school = await this.mongomodels.School.findByIdAndDelete(schoolId);
            if (!school) return { error: 'School not found' };
            return { success: true };
        } catch (error) {
            return { error: 'Failed to delete school' };
        }
    }

    async getSchoolStats({ __role, schoolId }) {
        if (__role === 'schoolAdmin') {
            return { error: 'Unauthorized' };
        }

        try {
            const [
                totalStudents,
                totalClassrooms,
                activeStudents,
                classroomUtilization
            ] = await Promise.all([
                this.mongomodels.Student.countDocuments({ schoolId }),
                this.mongomodels.Classroom.countDocuments({ schoolId }),
                this.mongomodels.Student.countDocuments({ schoolId, status: 'active' }),
                this.mongomodels.Classroom.aggregate([
                    { $match: { schoolId: this.mongomodels.ObjectId(schoolId) } },
                    {
                        $lookup: {
                            from: 'students',
                            localField: '_id',
                            foreignField: 'classroomId',
                            as: 'students'
                        }
                    },
                    {
                        $project: {
                            name: 1,
                            capacity: 1,
                            currentCount: { $size: '$students' },
                            utilizationRate: {
                                $multiply: [
                                    { $divide: [{ $size: '$students' }, '$capacity'] },
                                    100
                                ]
                            }
                        }
                    }
                ])
            ]);

            return {
                stats: {
                    totalStudents,
                    totalClassrooms,
                    activeStudents,
                    classroomUtilization
                }
            };
        } catch (error) {
            return { error: 'Failed to fetch school statistics' };
        }
    }

    async updateSchoolProfile({ __role, schoolId, profileData }) {
        if (__role !== 'superadmin') return { error: 'Unauthorized' };

        const validationResult = await this.validators.school.updateProfile(profileData);
        if (validationResult.errors) return validationResult;

        try {
            const school = await this.mongomodels.School.findByIdAndUpdate(
                schoolId,
                {
                    ...profileData,
                    updatedAt: new Date()
                },
                { new: true }
            );

            if (!school) return { error: 'School not found' };
            return { school };
        } catch (error) {
            return { error: 'Failed to update school profile' };
        }
    }

    async assignSchoolAdmin({ __role, schoolId, adminId }) {
        if (__role !== 'superadmin') return { error: 'Unauthorized' };

        try {
            // Verify admin user exists and has schoolAdmin role
            const admin = await this.mongomodels.User.findOne({
                _id: adminId,
                role: 'schoolAdmin'
            });
            if (!admin) return { error: 'Invalid school administrator' };

            const school = await this.mongomodels.School.findByIdAndUpdate(
                schoolId,
                {
                    adminId,
                    updatedAt: new Date()
                },
                { new: true }
            );

            if (!school) return { error: 'School not found' };

            // Update admin's school association
            await this.mongomodels.User.findByIdAndUpdate(adminId, {
                schoolId: school._id
            });

            return { school };
        } catch (error) {
            return { error: 'Failed to assign school administrator' };
        }
    }

    async removeSchoolAdmin({ __role, schoolId }) {
        if (__role !== 'superadmin') return { error: 'Unauthorized' };

        try {
            const school = await this.mongomodels.School.findById(schoolId);
            if (!school) return { error: 'School not found' };

            // Remove school association from admin
            if (school.adminId) {
                await this.mongomodels.User.findByIdAndUpdate(school.adminId, {
                    $unset: { schoolId: 1 }
                });
            }

            // Remove admin from school
            school.adminId = null;
            school.updatedAt = new Date();
            await school.save();

            return { success: true };
        } catch (error) {
            return { error: 'Failed to remove school administrator' };
        }
    }
}; 