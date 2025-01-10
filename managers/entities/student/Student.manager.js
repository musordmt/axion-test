module.exports = class Student {
    constructor({ utils, cache, config, cortex, managers, validators, mongomodels }) {
        this.config = config;
        this.validators = validators;
        this.mongomodels = mongomodels;
        this.managers = managers;
        this.userExposed = [
            'post=enrollStudent',
            'put=updateStudent',
            'get=getStudent',
            'get=listStudents',
            'post=transferStudent',
            'put=updateProfile',
            'post=graduateStudent',
            'post=recordAttendance'
        ];
    }

    async enrollStudent({ __role, schoolId, userId, classroomId, grade, personalInfo }) {
        if (__role !== 'schoolAdmin') return { error: 'Unauthorized', code: 'UNAUTHORIZED' };

        const validationResult = await this.validators.student.enrollStudent({
            userId, classroomId, grade, personalInfo
        });
        if (validationResult.errors) return validationResult;

        const session = await this.mongomodels.mongoose.startSession();
        try {
            await session.startTransaction();

            // Verify classroom exists
            if (classroomId) {
                const classroom = await this.mongomodels.Classroom.findOne({
                    _id: classroomId,
                    schoolId: schoolId
                }).session(session);
                
                if (!classroom) {
                    await session.abortTransaction();
                    return { error: 'Classroom not found', code: 'CLASSROOM_NOT_FOUND' };
                }
            }

            const student = await this.mongomodels.Student.create([{
                userId,
                schoolId: schoolId,
                classroomId,
                grade,
                personalInfo,
                status: 'active',
                enrollmentDate: new Date(),
                createdAt: new Date(),
                updatedAt: new Date()
            }], { session });

            await session.commitTransaction();
            return { student: student[0] };
        } catch (error) {
            await session.abortTransaction();
            return { error: 'Failed to enroll student', code: 'ENROLLMENT_FAILED' };
        } finally {
            session.endSession();
        }
    }

    async updateStudent({ __role, schoolId, studentId, updateData }) {
        if (__role !== 'schoolAdmin') return { error: 'Unauthorized', code: 'UNAUTHORIZED' };

        const allowedFields = ['classroomId', 'grade', 'personalInfo', 'status'];
        const filteredData = Object.keys(updateData)
            .filter(key => allowedFields.includes(key))
            .reduce((obj, key) => {
                obj[key] = updateData[key];
                return obj;
            }, {});

        const session = await this.mongomodels.mongoose.startSession();
        try {
            await session.startTransaction();

            if (filteredData.classroomId) {
                const classroom = await this.mongomodels.Classroom.findOne({
                    _id: filteredData.classroomId,
                    schoolId: schoolId
                }).session(session);

                if (!classroom) {
                    await session.abortTransaction();
                    return { error: 'Classroom not found', code: 'CLASSROOM_NOT_FOUND' };
                }
            }

            const updatedStudent = await this.mongomodels.Student.findOneAndUpdate(
                { _id: studentId, schoolId: schoolId },
                {
                    ...filteredData,
                    updatedAt: new Date()
                },
                { new: true, session }
            );

            if (!updatedStudent) {
                await session.abortTransaction();
                return { error: 'Student not found', code: 'STUDENT_NOT_FOUND' };
            }

            await session.commitTransaction();
            return { student: updatedStudent };
        } catch (error) {
            await session.abortTransaction();
            return { error: 'Failed to update student', code: 'UPDATE_FAILED' };
        } finally {
            session.endSession();
        }
    }

    async getStudent({ __role, schoolId, studentId }) {
        if (!['schoolAdmin', 'teacher'].includes(__role)) {
            return { error: 'Unauthorized', code: 'UNAUTHORIZED' };
        }

        try {
            const student = await this.mongomodels.Student.findOne({
                _id: studentId,
                schoolId: schoolId
            }).populate('userId classroomId');

            if (!student) return { error: 'Student not found', code: 'STUDENT_NOT_FOUND' };
            return { student };
        } catch (error) {
            return { error: 'Failed to fetch student', code: 'FETCH_FAILED' };
        }
    }

    async listStudents({ __role, schoolId, filters = {}, page = 1, limit = 50 }) {
        if (!['schoolAdmin', 'teacher'].includes(__role)) {
            return { error: 'Unauthorized', code: 'UNAUTHORIZED' };
        }

        try {
            const query = {
                schoolId: schoolId,
                ...filters
            };

            const skip = (page - 1) * limit;
            
            const [students, total] = await Promise.all([
                this.mongomodels.Student.find(query)
                    .populate('userId classroomId')
                    .skip(skip)
                    .limit(limit)
                    .sort({ createdAt: -1 }),
                this.mongomodels.Student.countDocuments(query)
            ]);

            return {
                students,
                pagination: {
                    total,
                    page,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            return { error: 'Failed to fetch students', code: 'FETCH_FAILED' };
        }
    }

    async recordAttendance({ __role, schoolId, studentId, attendanceRecord }) {
        if (!['schoolAdmin', 'teacher'].includes(__role)) {
            return { error: 'Unauthorized', code: 'UNAUTHORIZED' };
        }

        try {
            const student = await this.mongomodels.Student.findOneAndUpdate(
                { _id: studentId, schoolId: schoolId },
                {
                    $push: { attendance: attendanceRecord },
                    updatedAt: new Date()
                },
                { new: true }
            );

            if (!student) return { error: 'Student not found', code: 'STUDENT_NOT_FOUND' };
            return { student };
        } catch (error) {
            return { error: 'Failed to record attendance', code: 'ATTENDANCE_FAILED' };
        }
    }

    async transferStudent({ __role, schoolId, studentId, newSchoolId, newClassroomId }) {
        if (__role !== 'schoolAdmin') return { error: 'Unauthorized', code: 'UNAUTHORIZED' };

        const session = await this.mongomodels.mongoose.startSession();
        try {
            await session.startTransaction();

            const student = await this.mongomodels.Student.findOne({
                _id: studentId,
                schoolId: schoolId,
                status: 'active'
            }).session(session);

            if (!student) {
                await session.abortTransaction();
                return { error: 'Student not found', code: 'STUDENT_NOT_FOUND' };
            }

            // Verify new classroom if provided
            if (newClassroomId) {
                const classroom = await this.mongomodels.Classroom.findOne({
                    _id: newClassroomId,
                    schoolId: newSchoolId
                }).session(session);

                if (!classroom) {
                    await session.abortTransaction();
                    return { error: 'New classroom not found', code: 'CLASSROOM_NOT_FOUND' };
                }
            }

            const updatedStudent = await this.mongomodels.Student.findByIdAndUpdate(
                studentId,
                {
                    schoolId: newSchoolId,
                    classroomId: newClassroomId || null,
                    status: 'transferred',
                    updatedAt: new Date()
                },
                { new: true, session }
            );

            await session.commitTransaction();
            return { student: updatedStudent };
        } catch (error) {
            await session.abortTransaction();
            return { error: 'Failed to transfer student', code: 'TRANSFER_FAILED' };
        } finally {
            session.endSession();
        }
    }

    async updateProfile({ __role, schoolId, studentId, personalInfo }) {
        if (!['schoolAdmin', 'teacher'].includes(__role)) {
            return { error: 'Unauthorized', code: 'UNAUTHORIZED' };
        }

        try {
            const updatedStudent = await this.mongomodels.Student.findOneAndUpdate(
                { _id: studentId, schoolId: schoolId },
                {
                    personalInfo,
                    updatedAt: new Date()
                },
                { new: true }
            );

            if (!updatedStudent) {
                return { error: 'Student not found', code: 'STUDENT_NOT_FOUND' };
            }

            return { student: updatedStudent };
        } catch (error) {
            return { error: 'Failed to update profile', code: 'UPDATE_FAILED' };
        }
    }

    async graduateStudent({ __role, schoolId, studentId }) {
        if (__role !== 'schoolAdmin') return { error: 'Unauthorized', code: 'UNAUTHORIZED' };

        const session = await this.mongomodels.mongoose.startSession();
        try {
            await session.startTransaction();

            const student = await this.mongomodels.Student.findOne({
                _id: studentId,
                schoolId: schoolId,
                status: 'active'
            }).session(session);

            if (!student) {
                await session.abortTransaction();
                return { error: 'Student not found', code: 'STUDENT_NOT_FOUND' };
            }

            const updatedStudent = await this.mongomodels.Student.findByIdAndUpdate(
                studentId,
                {
                    status: 'graduated',
                    updatedAt: new Date()
                },
                { new: true, session }
            );

            await session.commitTransaction();
            return { student: updatedStudent };
        } catch (error) {
            await session.abortTransaction();
            return { error: 'Failed to graduate student', code: 'GRADUATION_FAILED' };
        } finally {
            session.endSession();
        }
    }
}; 