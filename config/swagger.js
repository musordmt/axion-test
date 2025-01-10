const swaggerDocument = {
    openapi: '3.0.0',
    info: {
        title: 'School Management System API',
        version: '1.0.0',
        description: 'API documentation for School Management System'
    },
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT'
            }
        }
    },
    security: [{
        bearerAuth: []
    }],
    paths: {
        '/students/enroll': {
            post: {
                tags: ['Students'],
                summary: 'Enroll a new student',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    schoolId: { type: 'string' },
                                    userId: { type: 'string' },
                                    classroomId: { type: 'string' },
                                    grade: { type: 'string' },
                                    personalInfo: { type: 'object' }
                                },
                                required: ['schoolId', 'userId', 'grade', 'personalInfo']
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: 'Student enrolled successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        student: { type: 'object' }
                                    }
                                }
                            }
                        }
                    },
                    401: { description: 'Unauthorized' },
                    400: { description: 'Validation errors or classroom not found' }
                }
            }
        },
        '/students/{studentId}': {
            put: {
                tags: ['Students'],
                summary: 'Update student information',
                parameters: [
                    {
                        name: 'studentId',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' }
                    }
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    classroomId: { type: 'string' },
                                    grade: { type: 'string' },
                                    personalInfo: { type: 'object' },
                                    status: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: 'Student updated successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        student: { type: 'object' }
                                    }
                                }
                            }
                        }
                    },
                    401: { description: 'Unauthorized' },
                    404: { description: 'Student not found' }
                }
            },
            get: {
                tags: ['Students'],
                summary: 'Get student details',
                parameters: [
                    {
                        name: 'studentId',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' }
                    }
                ],
                responses: {
                    200: {
                        description: 'Student details retrieved successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        student: { type: 'object' }
                                    }
                                }
                            }
                        }
                    },
                    401: { description: 'Unauthorized' },
                    404: { description: 'Student not found' }
                }
            }
        },
        '/students': {
            get: {
                tags: ['Students'],
                summary: 'List students',
                parameters: [
                    {
                        name: 'schoolId',
                        in: 'query',
                        required: true,
                        schema: { type: 'string' }
                    },
                    {
                        name: 'filters',
                        in: 'query',
                        schema: { type: 'object' }
                    },
                    {
                        name: 'page',
                        in: 'query',
                        schema: { type: 'integer', default: 1 }
                    },
                    {
                        name: 'limit',
                        in: 'query',
                        schema: { type: 'integer', default: 50 }
                    }
                ],
                responses: {
                    200: {
                        description: 'List of students',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        students: { type: 'array', items: { type: 'object' } },
                                        pagination: { type: 'object' }
                                    }
                                }
                            }
                        }
                    },
                    401: { description: 'Unauthorized' }
                }
            }
        },
        '/students/{studentId}/attendance': {
            post: {
                tags: ['Students'],
                summary: 'Record student attendance',
                parameters: [
                    {
                        name: 'studentId',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' }
                    }
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    attendanceRecord: { type: 'object' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: 'Attendance recorded successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        student: { type: 'object' }
                                    }
                                }
                            }
                        }
                    },
                    401: { description: 'Unauthorized' },
                    404: { description: 'Student not found' }
                }
            }
        },
        '/students/{studentId}/transfer': {
            post: {
                tags: ['Students'],
                summary: 'Transfer student to another school',
                parameters: [
                    {
                        name: 'studentId',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' }
                    }
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    newSchoolId: { type: 'string' },
                                    newClassroomId: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: 'Student transferred successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        student: { type: 'object' }
                                    }
                                }
                            }
                        }
                    },
                    401: { description: 'Unauthorized' },
                    404: { description: 'Student or new classroom not found' }
                }
            }
        },
        '/students/{studentId}/profile': {
            put: {
                tags: ['Students'],
                summary: 'Update student profile',
                parameters: [
                    {
                        name: 'studentId',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' }
                    }
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    personalInfo: { type: 'object' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: 'Profile updated successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        student: { type: 'object' }
                                    }
                                }
                            }
                        }
                    },
                    401: { description: 'Unauthorized' },
                    404: { description: 'Student not found' }
                }
            }
        },
        '/students/{studentId}/graduate': {
            post: {
                tags: ['Students'],
                summary: 'Graduate a student',
                parameters: [
                    {
                        name: 'studentId',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' }
                    }
                ],
                responses: {
                    200: {
                        description: 'Student graduated successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        student: { type: 'object' }
                                    }
                                }
                            }
                        }
                    },
                    401: { description: 'Unauthorized' },
                    404: { description: 'Student not found' }
                }
            }
        },
        '/schools': {
            post: {
                tags: ['Schools'],
                summary: 'Create a new school',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    name: { type: 'string' },
                                    address: { type: 'string' },
                                    contactEmail: { type: 'string' },
                                    contactPhone: { type: 'string' },
                                },
                                required: ['name', 'address', 'contactEmail', 'contactPhone'],
                            },
                        },
                    },
                },
                responses: {
                    200: {
                        description: 'School created successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        school: { type: 'object' },
                                    },
                                },
                            },
                        },
                    },
                    401: {
                        description: 'Unauthorized access',
                    },
                    400: {
                        description: 'Validation error',
                    },
                },
            },
            get: {
                tags: ['Schools'],
                summary: 'List all schools',
                parameters: [
                    {
                        name: 'page',
                        in: 'query',
                        required: false,
                        schema: {
                            type: 'integer',
                            default: 1,
                        },
                    },
                    {
                        name: 'limit',
                        in: 'query',
                        required: false,
                        schema: {
                            type: 'integer',
                            default: 10,
                        },
                    },
                    {
                        name: 'status',
                        in: 'query',
                        required: false,
                        schema: {
                            type: 'string',
                        },
                    },
                ],
                responses: {
                    200: {
                        description: 'List of schools',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        schools: { type: 'array', items: { type: 'object' } },
                                        pagination: {
                                            type: 'object',
                                            properties: {
                                                page: { type: 'integer' },
                                                limit: { type: 'integer' },
                                                total: { type: 'integer' },
                                                pages: { type: 'integer' },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    401: {
                        description: 'Unauthorized access',
                    },
                },
            },
        },
        '/schools/{schoolId}': {
            get: {
                tags: ['Schools'],
                summary: 'Get a school by ID',
                parameters: [
                    {
                        name: 'schoolId',
                        in: 'path',
                        required: true,
                        schema: {
                            type: 'string',
                        },
                    },
                ],
                responses: {
                    200: {
                        description: 'School details',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        school: { type: 'object' },
                                    },
                                },
                            },
                        },
                    },
                    404: {
                        description: 'School not found',
                    },
                },
            },
            put: {
                tags: ['Schools'],
                summary: 'Update a school by ID',
                parameters: [
                    {
                        name: 'schoolId',
                        in: 'path',
                        required: true,
                        schema: {
                            type: 'string',
                        },
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    name: { type: 'string' },
                                    address: { type: 'string' },
                                    contactEmail: { type: 'string' },
                                    contactPhone: { type: 'string' },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: {
                        description: 'School updated successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        school: { type: 'object' },
                                    },
                                },
                            },
                        },
                    },
                    404: {
                        description: 'School not found',
                    },
                },
            },
            delete: {
                tags: ['Schools'],
                summary: 'Delete a school by ID',
                parameters: [
                    {
                        name: 'schoolId',
                        in: 'path',
                        required: true,
                        schema: {
                            type: 'string',
                        },
                    },
                ],
                responses: {
                    200: {
                        description: 'School deleted successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                    },
                                },
                            },
                        },
                    },
                    404: {
                        description: 'School not found',
                    },
                },
            },
        },
        '/schools/{schoolId}/stats': {
            get: {
                tags: ['Schools'],
                summary: 'Get statistics for a school',
                parameters: [
                    {
                        name: 'schoolId',
                        in: 'path',
                        required: true,
                        schema: {
                            type: 'string',
                        },
                    },
                ],
                responses: {
                    200: {
                        description: 'School statistics',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        stats: { type: 'object' },
                                    },
                                },
                            },
                        },
                    },
                    401: {
                        description: 'Unauthorized access',
                    },
                },
            },
        },
        '/schools/{schoolId}/profile': {
            put: {
                tags: ['Schools'],
                summary: 'Update school profile',
                parameters: [
                    {
                        name: 'schoolId',
                        in: 'path',
                        required: true,
                        schema: {
                            type: 'string',
                        },
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    profileData: { type: 'object' },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: {
                        description: 'School profile updated successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        school: { type: 'object' },
                                    },
                                },
                            },
                        },
                    },
                    404: {
                        description: 'School not found',
                    },
                },
            },
        },
        '/schools/{schoolId}/admin': {
            post: {
                tags: ['Schools'],
                summary: 'Assign a school administrator',
                parameters: [
                    {
                        name: 'schoolId',
                        in: 'path',
                        required: true,
                        schema: {
                            type: 'string',
                        },
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    adminId: { type: 'string' },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: {
                        description: 'School administrator assigned successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        school: { type: 'object' },
                                    },
                                },
                            },
                        },
                    },
                    404: {
                        description: 'School or admin not found',
                    },
                },
            },
            delete: {
                tags: ['Schools'],
                summary: 'Remove a school administrator',
                parameters: [
                    {
                        name: 'schoolId',
                        in: 'path',
                        required: true,
                        schema: {
                            type: 'string',
                        },
                    },
                ],
                responses: {
                    200: {
                        description: 'School administrator removed successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                    },
                                },
                            },
                        },
                    },
                    404: {
                        description: 'School not found',
                    },
                },
            },
        },
        '/classrooms': {
            post: {
                summary: 'Create a new classroom',
                tags: ['Classrooms'],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    schoolId: { type: 'string' },
                                    name: { type: 'string' },
                                    capacity: { type: 'integer' },
                                    grade: { type: 'string' },
                                    teacher: { type: 'string' },
                                },
                                required: ['schoolId', 'name', 'capacity', 'grade', 'teacher'],
                            },
                        },
                    },
                },
                responses: {
                    200: {
                        description: 'Classroom created successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        classroom: { type: 'object' },
                                    },
                                },
                            },
                        },
                    },
                    401: {
                        description: 'Unauthorized',
                    },
                    400: {
                        description: 'Validation error',
                    },
                },
            },
            get: {
                summary: 'List all classrooms',
                tags: ['Classrooms'],
                parameters: [
                    {
                        name: 'page',
                        in: 'query',
                        schema: {
                            type: 'integer',
                            default: 1,
                        },
                        description: 'Page number',
                    },
                    {
                        name: 'limit',
                        in: 'query',
                        schema: {
                            type: 'integer',
                            default: 10,
                        },
                        description: 'Number of classrooms per page',
                    },
                    {
                        name: 'grade',
                        in: 'query',
                        schema: {
                            type: 'string',
                        },
                        description: 'Filter by grade',
                    },
                    {
                        name: 'status',
                        in: 'query',
                        schema: {
                            type: 'string',
                        },
                        description: 'Filter by status',
                    },
                ],
                responses: {
                    200: {
                        description: 'List of classrooms',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        classrooms: {
                                            type: 'array',
                                            items: { type: 'object' },
                                        },
                                        pagination: {
                                            type: 'object',
                                            properties: {
                                                page: { type: 'integer' },
                                                limit: { type: 'integer' },
                                                total: { type: 'integer' },
                                                pages: { type: 'integer' },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    401: {
                        description: 'Unauthorized',
                    },
                },
            },
        },
        '/classrooms/{classroomId}': {
            get: {
                summary: 'Get a classroom by ID',
                tags: ['Classrooms'],
                parameters: [
                    {
                        name: 'classroomId',
                        in: 'path',
                        required: true,
                        schema: {
                            type: 'string',
                        },
                        description: 'ID of the classroom to retrieve',
                    },
                ],
                responses: {
                    200: {
                        description: 'Classroom details',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        classroom: { type: 'object' },
                                    },
                                },
                            },
                        },
                    },
                    401: {
                        description: 'Unauthorized',
                    },
                    404: {
                        description: 'Classroom not found',
                    },
                },
            },
            put: {
                summary: 'Update a classroom',
                tags: ['Classrooms'],
                parameters: [
                    {
                        name: 'classroomId',
                        in: 'path',
                        required: true,
                        schema: {
                            type: 'string',
                        },
                        description: 'ID of the classroom to update',
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    name: { type: 'string' },
                                    capacity: { type: 'integer' },
                                    grade: { type: 'string' },
                                    teacher: { type: 'string' },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: {
                        description: 'Classroom updated successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        classroom: { type: 'object' },
                                    },
                                },
                            },
                        },
                    },
                    401: {
                        description: 'Unauthorized',
                    },
                    404: {
                        description: 'Classroom not found',
                    },
                },
            },
            delete: {
                summary: 'Delete a classroom',
                tags: ['Classrooms'],
                parameters: [
                    {
                        name: 'classroomId',
                        in: 'path',
                        required: true,
                        schema: {
                            type: 'string',
                        },
                        description: 'ID of the classroom to delete',
                    },
                ],
                responses: {
                    200: {
                        description: 'Classroom deleted successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                    },
                                },
                            },
                        },
                    },
                    401: {
                        description: 'Unauthorized',
                    },
                    404: {
                        description: 'Classroom not found',
                    },
                },
            },
        },
        '/classrooms/{classroomId}/check-capacity': {
            get: {
                summary: 'Check classroom capacity',
                tags: ['Classrooms'],
                parameters: [
                    {
                        name: 'classroomId',
                        in: 'path',
                        required: true,
                        schema: {
                            type: 'string',
                        },
                        description: 'ID of the classroom to check capacity',
                    },
                ],
                responses: {
                    200: {
                        description: 'Classroom capacity details',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        capacity: { type: 'integer' },
                                        currentStudents: { type: 'integer' },
                                        available: { type: 'integer' },
                                        utilizationRate: { type: 'number' },
                                    },
                                },
                            },
                        },
                    },
                    401: {
                        description: 'Unauthorized',
                    },
                    404: {
                        description: 'Classroom not found',
                    },
                },
            },
        },
        '/classrooms/{classroomId}/update-resources': {
            put: {
                summary: 'Update classroom resources',
                tags: ['Classrooms'],
                parameters: [
                    {
                        name: 'classroomId',
                        in: 'path',
                        required: true,
                        schema: {
                            type: 'string',
                        },
                        description: 'ID of the classroom to update resources',
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    resources: { type: 'object' },
                                },
                                required: ['resources'],
                            },
                        },
                    },
                },
                responses: {
                    200: {
                        description: 'Classroom resources updated successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        classroom: { type: 'object' },
                                    },
                                },
                            },
                        },
                    },
                    401: {
                        description: 'Unauthorized',
                    },
                    404: {
                        description: 'Classroom not found',
                    },
                },
            },
        },
        '/classrooms/{classroomId}/remove-students': {
            post: {
                summary: 'Remove students from a classroom',
                tags: ['Classrooms'],
                parameters: [
                    {
                        name: 'classroomId',
                        in: 'path',
                        required: true,
                        schema: {
                            type: 'string',
                        },
                        description: 'ID of the classroom to remove students from',
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    studentIds: {
                                        type: 'array',
                                        items: { type: 'string' },
                                    },
                                },
                                required: ['studentIds'],
                            },
                        },
                    },
                },
                responses: {
                    200: {
                        description: 'Students removed successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                    },
                                },
                            },
                        },
                    },
                    401: {
                        description: 'Unauthorized',
                    },
                    404: {
                        description: 'Classroom not found',
                    },
                },
            },
        },
        '/classrooms/{classroomId}/assign-students': {
            post: {
                summary: 'Assign students to a classroom',
                tags: ['Classrooms'],
                parameters: [
                    {
                        name: 'classroomId',
                        in: 'path',
                        required: true,
                        schema: {
                            type: 'string',
                        },
                        description: 'ID of the classroom to assign students to',
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    studentIds: {
                                        type: 'array',
                                        items: { type: 'string' },
                                    },
                                },
                                required: ['studentIds'],
                            },
                        },
                    },
                },
                responses: {
                    200: {
                        description: 'Students assigned successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                    },
                                },
                            },
                        },
                    },
                    401: {
                        description: 'Unauthorized',
                    },
                    404: {
                        description: 'Classroom not found',
                    },
                    400: {
                        description: 'Classroom capacity exceeded',
                    },
                },
            },
        },
        '/classrooms/{classroomId}/stats': {
            get: {
                summary: 'Get classroom statistics',
                tags: ['Classrooms'],
                parameters: [
                    {
                        name: 'classroomId',
                        in: 'path',
                        required: true,
                        schema: {
                            type: 'string',
                        },
                        description: 'ID of the classroom to get statistics for',
                    },
                ],
                responses: {
                    200: {
                        description: 'Classroom statistics',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        stats: { type: 'object' },
                                    },
                                },
                            },
                        },
                    },
                    401: {
                        description: 'Unauthorized',
                    },
                    404: {
                        description: 'Classroom not found',
                    },
                },
            },
        },
        '/auth/login': {
            post: {
                tags: ['Auth'],
                summary: 'User login',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    username: { type: 'string' },
                                    password: { type: 'string' }
                                },
                                required: ['username', 'password']
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: 'Login successful',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        user: { type: 'object' },
                                        tokens: { type: 'object' }
                                    }
                                }
                            }
                        }
                    },
                    401: {
                        description: 'Invalid credentials'
                    }
                }
            }
        },
        '/auth/logout': {
            post: {
                tags: ['Auth'],
                summary: 'User logout',
                security: [{ bearerAuth: [] }],
                responses: {
                    200: {
                        description: 'Logout successful'
                    },
                    401: {
                        description: 'Unauthorized'
                    }
                }
            }
        },
        '/auth/refresh-token': {
            post: {
                tags: ['Auth'],
                summary: 'Refresh access token',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    refreshToken: { type: 'string' }
                                },
                                required: ['refreshToken']
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: 'Token refreshed successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        accessToken: { type: 'string' }
                                    }
                                }
                            }
                        }
                    },
                    401: {
                        description: 'Invalid refresh token'
                    }
                }
            }
        }
    }
};

module.exports = swaggerDocument; 