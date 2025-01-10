/**
 * @swagger
 * /api/students:
 *   post:
 *     summary: Enroll a new student
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *               - classroomId
 *               - guardianName
 *               - guardianContact
 *               - dateOfBirth
 *               - address
 */
module.exports = {
    'POST /students': {
        mws: ['auth', 'rbac', 'rateLimit'],
        handler: async ({ managers, body, results }) => {
            return managers.student.enrollStudent({
                ...body,
                __role: results.__role,
                __schoolId: results.__schoolId
            });
        }
    },

    /**
     * @swagger
     * /api/students:
     *   get:
     *     summary: List all students
     *     tags: [Students]
     *     parameters:
     *       - in: query
     *         name: page
     *         schema:
     *           type: integer
     *       - in: query
     *         name: limit
     *         schema:
     *           type: integer
     *       - in: query
     *         name: classroomId
     *         schema:
     *           type: string
     */
    'GET /students': {
        mws: ['auth', 'rbac', 'rateLimit'],
        handler: async ({ managers, query, results }) => {
            return managers.student.listStudents({
                ...query,
                __role: results.__role,
                __schoolId: results.__schoolId
            });
        }
    },

    /**
     * @swagger
     * /api/students/{id}:
     *   get:
     *     summary: Get student by ID
     *     tags: [Students]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     */
    'GET /students/:id': {
        mws: ['auth', 'rbac', 'rateLimit'],
        handler: async ({ managers, params, results }) => {
            return managers.student.getStudent({
                studentId: params.id,
                __role: results.__role,
                __schoolId: results.__schoolId
            });
        }
    },

    /**
     * @swagger
     * /api/students/{id}/transfer:
     *   post:
     *     summary: Transfer student to another school
     *     tags: [Students]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - newSchoolId
     */
    'POST /students/:id/transfer': {
        mws: ['auth', 'rbac', 'rateLimit'],
        handler: async ({ managers, params, body, results }) => {
            return managers.student.transferStudent({
                studentId: params.id,
                newSchoolId: body.newSchoolId,
                __role: results.__role,
                __schoolId: results.__schoolId
            });
        }
    },

    /**
     * @swagger
     * /api/students/{id}:
     *   put:
     *     summary: Update student information
     *     tags: [Students]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     */
    'PUT /students/:id': {
        mws: ['auth', 'rbac', 'rateLimit'],
        handler: async ({ managers, params, body, results }) => {
            return managers.student.updateStudent({
                studentId: params.id,
                ...body,
                __role: results.__role,
                __schoolId: results.__schoolId
            });
        }
    }
}; 