const request = require('supertest');
const chai = require('chai');
const expect = chai.expect;
const app = require('./app');

describe('API Tests', function() {
    describe('GET /api-docs', function() {
        it('should return Swagger UI', function(done) {
            request(app)
                .get('/api-docs')
                .expect('Content-Type', /html/)
                .expect(200, done);
        });
    });

    describe('POST /api/login', function() {
        it('should login successfully with valid credentials', function(done) {
            request(app)
                .post('/api/login')
                .send({ username: 'testuser', password: 'testpass' })
                .expect(200)
                .expect(res => {
                    expect(res.body).to.have.property('tokens');
                    expect(res.body.tokens).to.have.property('accessToken');
                    expect(res.body.tokens).to.have.property('refreshToken');
                })
                .end(done);
        });

        it('should fail login with invalid credentials', function(done) {
            request(app)
                .post('/api/login')
                .send({ username: 'wronguser', password: 'wrongpass' })
                .expect(401)
                .expect(res => {
                    expect(res.body).to.have.property('error', 'Invalid credentials');
                })
                .end(done);
        });
    });

    describe('GET /api/users', function() {
        it('should return a list of users', function(done) {
            request(app)
                .get('/api/users')
                .expect('Content-Type', /json/)
                .expect(200)
                .expect(res => {
                    expect(res.body).to.be.an('array');
                    expect(res.body.length).to.be.greaterThan(0);
                })
                .end(done);
        });
    });

    describe('POST /api/users', function() {
        it('should create a new user', function(done) {
            request(app)
                .post('/api/users')
                .send({ username: 'newuser', password: 'newpass' })
                .expect(201)
                .expect(res => {
                    expect(res.body).to.have.property('id');
                    expect(res.body.username).to.equal('newuser');
                })
                .end(done);
        });
    });

    describe('PUT /api/users/:id', function() {
        it('should update an existing user', function(done) {
            const userId = 'someUserId'; // replace with a valid user ID
            request(app)
                .put(`/api/users/${userId}`)
                .send({ username: 'updateduser' })
                .expect(200)
                .expect(res => {
                    expect(res.body).to.have.property('username', 'updateduser');
                })
                .end(done);
        });
    });

    describe('DELETE /api/users/:id', function() {
        it('should delete an existing user', function(done) {
            const userId = 'someUserId'; // replace with a valid user ID
            request(app)
                .delete(`/api/users/${userId}`)
                .expect(204)
                .end(done);
        });
    });

    // Classroom test cases
    describe('GET /api/classrooms', function() {
        it('should return a list of classrooms', function(done) {
            request(app)
                .get('/api/classrooms')
                .expect('Content-Type', /json/)
                .expect(200)
                .expect(res => {
                    expect(res.body).to.be.an('array');
                    expect(res.body.length).to.be.greaterThan(0);
                })
                .end(done);
        });
    });

    describe('POST /api/classrooms', function() {
        it('should create a new classroom', function(done) {
            request(app)
                .post('/api/classrooms')
                .send({ name: 'New Classroom', capacity: 30 })
                .expect(201)
                .expect(res => {
                    expect(res.body).to.have.property('id');
                    expect(res.body.name).to.equal('New Classroom');
                })
                .end(done);
        });
    });

    // Student test cases
    describe('GET /api/students', function() {
        it('should return a list of students', function(done) {
            request(app)
                .get('/api/students')
                .expect('Content-Type', /json/)
                .expect(200)
                .expect(res => {
                    expect(res.body).to.be.an('array');
                    expect(res.body.length).to.be.greaterThan(0);
                })
                .end(done);
        });
    });

    describe('POST /api/students', function() {
        it('should create a new student', function(done) {
            request(app)
                .post('/api/students')
                .send({ name: 'John Doe', age: 20 })
                .expect(201)
                .expect(res => {
                    expect(res.body).to.have.property('id');
                    expect(res.body.name).to.equal('John Doe');
                })
                .end(done);
        });
    });

    // School test cases
    describe('GET /api/schools', function() {
        it('should return a list of schools', function(done) {
            request(app)
                .get('/api/schools')
                .expect('Content-Type', /json/)
                .expect(200)
                .expect(res => {
                    expect(res.body).to.be.an('array');
                    expect(res.body.length).to.be.greaterThan(0);
                })
                .end(done);
        });
    });

    describe('POST /api/schools', function() {
        it('should create a new school', function(done) {
            request(app)
                .post('/api/schools')
                .send({ name: 'New School', address: '123 School St' })
                .expect(201)
                .expect(res => {
                    expect(res.body).to.have.property('id');
                    expect(res.body.name).to.equal('New School');
                })
                .end(done);
        });
    });
});