/**
 * @swagger
 * /api/classrooms:
 *   post:
 *     summary: Create a new classroom
 *     tags: [Classrooms]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - capacity
 *               - grade
 *               - teacher
 *             properties:
 *               name:
 *                 type: string
 *               capacity:
 *                 type: number
 *               grade:
 *                 type: string
 *               teacher:
 *                 type: string
 */
module.exports = {
    'POST /classrooms': {
        mws: ['auth', 'rbac', 'rateLimit'],
        handler: async ({ managers, body, results }) => {
            return managers.classroom.createClassroom({
                ...body,
                __role: results.__role,
                __schoolId: results.__schoolId
            });
        }
    },

    /**
     * @swagger
     * /api/classrooms:
     *   get:
     *     summary: List all classrooms
     *     tags: [Classrooms]
     *     parameters:
     *       - in: query
     *         name: page
     *         schema:
     *           type: integer
     *         description: Page number
     *       - in: query
     *         name: limit
     *         schema:
     *           type: integer
     *         description: Items per page
     */
    'GET /classrooms': {
        mws: ['auth', 'rbac', 'rateLimit'],
        handler: async ({ managers, query, results }) => {
            return managers.classroom.listClassrooms({
                ...query,
                __role: results.__role,
                __schoolId: results.__schoolId
            });
        }
    },

    /**
     * @swagger
     * /api/classrooms/{id}:
     *   get:
     *     summary: Get classroom by ID
     *     tags: [Classrooms]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     */
    'GET /classrooms/:id': {
        mws: ['auth', 'rbac', 'rateLimit'],
        handler: async ({ managers, params, results }) => {
            return managers.classroom.getClassroom({
                classroomId: params.id,
                __role: results.__role,
                __schoolId: results.__schoolId
            });
        }
    },

    /**
     * @swagger
     * /api/classrooms/{id}:
     *   put:
     *     summary: Update classroom
     *     tags: [Classrooms]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     */
    'PUT /classrooms/:id': {
        mws: ['auth', 'rbac', 'rateLimit'],
        handler: async ({ managers, params, body, results }) => {
            return managers.classroom.updateClassroom({
                classroomId: params.id,
                ...body,
                __role: results.__role,
                __schoolId: results.__schoolId
            });
        }
    },

    /**
     * @swagger
     * /api/classrooms/{id}:
     *   delete:
     *     summary: Delete classroom
     *     tags: [Classrooms]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     */
    'DELETE /classrooms/:id': {
        mws: ['auth', 'rbac', 'rateLimit'],
        handler: async ({ managers, params, results }) => {
            return managers.classroom.deleteClassroom({
                classroomId: params.id,
                __role: results.__role,
                __schoolId: results.__schoolId
            });
        }
    }
}; 