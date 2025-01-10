/**
 * @swagger
 * /api/schools:
 *   post:
 *     summary: Create a new school
 *     tags: [Schools]
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
 *               - address
 *               - contactEmail
 *               - contactPhone
 *             properties:
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *               contactEmail:
 *                 type: string
 *               contactPhone:
 *                 type: string
 */
module.exports = {
    'POST /schools': {
        mws: ['auth', 'rbac', 'rateLimit'],
        handler: async ({ managers, body, results }) => {
            return managers.school.createSchool({
                ...body,
                __role: results.__role
            });
        }
    },

    'GET /schools': {
        mws: ['auth', 'rbac', 'rateLimit'],
        handler: async ({ managers, query, results }) => {
            return managers.school.listSchools({
                ...query,
                __role: results.__role,
                __schoolId: results.__schoolId
            });
        }
    }
}; 