module.exports = class Classroom {
    constructor({ utils, cache, config, cortex, managers, validators, mongomodels }) {
        this.config = config;
        this.validators = validators;
        this.mongomodels = mongomodels;
        this.userExposed = [
            'post=createClassroom',
            'put=updateClassroom',
            'get=getClassroom',
            'get=listClassrooms',
            'delete=deleteClassroom',
            'get=getClassroomStats',
            'put=updateResources',
            'get=checkCapacity',
            'post=assignStudents',
            'post=removeStudents'
        ];
    }

    async createClassroom({ __role, schoolId, name, capacity, grade, teacher }) {
        if (__role !== 'schoolAdmin') return { error: 'Unauthorized' };

        const validationResult = await this.validators.classroom.createClassroom({
            name, capacity, grade, teacher
        });
        if (validationResult.errors) return validationResult;

        try {
            // Check if similar classroom exists
            const existingClassroom = await this.mongomodels.Classroom.findOne({
                schoolId: schoolId,
                name,
                grade
            });
            if (existingClassroom) return { error: 'Classroom with same name and grade already exists' };

            const classroom = await this.mongomodels.Classroom.create({
                name,
                schoolId: schoolId,
                capacity,
                grade,
                teacher
            });
            return { classroom };
        } catch (error) {
            return { error: 'Failed to create classroom' };
        }
    }

    async updateClassroom({ __role, schoolId, classroomId, ...updateData }) {
        if (__role !== 'schoolAdmin') return { error: 'Unauthorized' };

        const validationResult = await this.validators.classroom.updateClassroom(updateData);
        if (validationResult.errors) return validationResult;

        try {
            const classroom = await this.mongomodels.Classroom.findOneAndUpdate(
                { _id: classroomId, schoolId: schoolId },
                { ...updateData, updatedAt: new Date() },
                { new: true }
            );
            if (!classroom) return { error: 'Classroom not found' };
            return { classroom };
        } catch (error) {
            return { error: 'Failed to update classroom' };
        }
    }

    async getClassroom({ __role, schoolId, classroomId }) {
        if (!['superadmin', 'schoolAdmin'].includes(__role)) {
            return { error: 'Unauthorized' };
        }

        try {
            const query = __role === 'schoolAdmin' ? { _id: classroomId, schoolId: schoolId } : { _id: classroomId };
            const classroom = await this.mongomodels.Classroom.findOne(query)
                .populate('schoolId', 'name');

            if (!classroom) return { error: 'Classroom not found' };
            return { classroom };
        } catch (error) {
            return { error: 'Failed to fetch classroom' };
        }
    }

    async listClassrooms({ __role, schoolId, page = 1, limit = 10, grade, status }) {
        if (!['superadmin', 'schoolAdmin'].includes(__role)) {
            return { error: 'Unauthorized' };
        }

        const query = {
            ...__role === 'schoolAdmin' ? { schoolId: schoolId } : {},
            ...grade ? { grade } : {},
            ...status ? { status } : {}
        };

        const skip = (page - 1) * limit;

        try {
            const [classrooms, total] = await Promise.all([
                this.mongomodels.Classroom.find(query)
                    .populate('schoolId', 'name')
                    .skip(skip)
                    .limit(limit),
                this.mongomodels.Classroom.countDocuments(query)
            ]);

            return {
                classrooms,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            return { error: 'Failed to fetch classrooms' };
        }
    }

    async deleteClassroom({ __role, schoolId, classroomId }) {
        if (__role !== 'schoolAdmin') return { error: 'Unauthorized' };

        try {
            // Check for existing students
            const studentsCount = await this.mongomodels.Student.countDocuments({
                classroomId,
                status: 'active'
            });

            if (studentsCount > 0) {
                return { error: 'Cannot delete classroom with active students' };
            }

            const classroom = await this.mongomodels.Classroom.findOneAndDelete({
                _id: classroomId,
                schoolId: schoolId
            });

            if (!classroom) return { error: 'Classroom not found' };
            return { success: true };
        } catch (error) {
            return { error: 'Failed to delete classroom' };
        }
    }

    async getClassroomStats({ __role, schoolId, classroomId }) {
        if (!['superadmin', 'schoolAdmin'].includes(__role)) {
            return { error: 'Unauthorized' };
        }

        try {
            const query = __role === 'schoolAdmin' ?
                { _id: classroomId, schoolId: schoolId } :
                { _id: classroomId };

            const stats = await this.mongomodels.Classroom.aggregate([
                { $match: query },
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
                        grade: 1,
                        currentStudents: { $size: '$students' },
                        utilizationRate: {
                            $multiply: [
                                { $divide: [{ $size: '$students' }, '$capacity'] },
                                100
                            ]
                        },
                        activeStudents: {
                            $size: {
                                $filter: {
                                    input: '$students',
                                    as: 'student',
                                    cond: { $eq: ['$$student.status', 'active'] }
                                }
                            }
                        }
                    }
                }
            ]);

            if (!stats.length) return { error: 'Classroom not found' };
            return { stats: stats[0] };
        } catch (error) {
            return { error: 'Failed to fetch classroom statistics' };
        }
    }

    async assignStudents({ __role, schoolId, classroomId, studentIds }) {
        if (__role !== 'schoolAdmin') return { error: 'Unauthorized' };

        try {
            const classroom = await this.mongomodels.Classroom.findOne({
                _id: classroomId,
                schoolId: schoolId
            });
            if (!classroom) return { error: 'Classroom not found' };

            // Check classroom capacity
            const currentStudents = await this.mongomodels.Student.countDocuments({
                classroomId,
                status: 'active'
            });

            if (currentStudents + studentIds.length > classroom.capacity) {
                return { error: 'Classroom capacity exceeded' };
            }

            // Update students
            await this.mongomodels.Student.updateMany(
                {
                    _id: { $in: studentIds },
                    schoolId: schoolId,
                    status: 'active'
                },
                {
                    $set: { classroomId, updatedAt: new Date() }
                }
            );

            return { success: true };
        } catch (error) {
            return { error: 'Failed to assign students' };
        }
    }

    async removeStudents({ __role, schoolId, classroomId, studentIds }) {
        if (__role !== 'schoolAdmin') return { error: 'Unauthorized' };

        try {
            await this.mongomodels.Student.updateMany(
                {
                    _id: { $in: studentIds },
                    classroomId,
                    schoolId: schoolId
                },
                {
                    $unset: { classroomId: 1 },
                    $set: { updatedAt: new Date() }
                }
            );

            return { success: true };
        } catch (error) {
            return { error: 'Failed to remove students' };
        }
    }

    async updateResources({ __role, schoolId, classroomId, resources }) {
        if (__role !== 'schoolAdmin') return { error: 'Unauthorized' };

        const validationResult = await this.validators.classroom.updateResources(resources);
        if (validationResult.errors) return validationResult;

        try {
            const classroom = await this.mongomodels.Classroom.findOneAndUpdate(
                { _id: classroomId, schoolId: schoolId },
                {
                    resources,
                    updatedAt: new Date()
                },
                { new: true }
            );

            if (!classroom) return { error: 'Classroom not found' };
            return { classroom };
        } catch (error) {
            return { error: 'Failed to update classroom resources' };
        }
    }

    async checkCapacity({ __role, schoolId, classroomId }) {
        if (__role !== 'schoolAdmin') return { error: 'Unauthorized' };

        try {
            const classroom = await this.mongomodels.Classroom.findOne({
                _id: classroomId,
                schoolId: schoolId
            });
            if (!classroom) return { error: 'Classroom not found' };

            const currentStudents = await this.mongomodels.Student.countDocuments({
                classroomId,
                status: 'active'
            });

            return {
                capacity: classroom.capacity,
                currentStudents,
                available: classroom.capacity - currentStudents,
                utilizationRate: (currentStudents / classroom.capacity) * 100
            };
        } catch (error) {
            return { error: 'Failed to check classroom capacity' };
        }
    }
}; 