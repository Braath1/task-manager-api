const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/user');
const { response } = require('../src/app');
const { userOneId, userOne, setupDatabase } = require('./fixtures/db');

beforeEach(setupDatabase);


test('Should signup a new user', async () => {
    const response = await request(app).post('/users').send({
        name: 'Anders',
        email: 'andersbraath1@gmail.com',
        password: 'Test987654'
    }).expect(201);

    // Assert that the db was changed correctly
    const user = await User.findById(response.body.user._id);
    expect(user).not.toBeNull();

    // Assertions about the response
    expect(response.body).toMatchObject({
       user: {
           name: 'Anders',
           email: 'andersbraath1@gmail.com'
       },
       token: user.tokens[0].token 
    });

    // Assert that user password is not saved in db as plain text
    expect(user.password).not.toBe('Test987654');
});

test('Should login excisting user', async () => {
    const response = await request(app).post('/users/login').send({
        email: userOne.email,
        password: userOne.password
    }).expect(200);

    const user = await User.findById(userOneId);
    expect(response.body.token).toBe(user.tokens[1].token);
});

test('Should not login nonexisting user', async () => {
    await request(app).post('/users/login').send({
        email: userOne.email,
        password: '56Hello1'
    }).expect(400);
});

test('Should get profile for user', async () => {
    await request(app)
    .get('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
});

test('Should fail to get profile when not authenticated', async () => {
    await request(app)
    .get('/users/me')
    .send()
    .expect(401)
});

test('Should delete account for user', async () => {
    await request(app)
    .delete('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)

    // Assert user is deleted
    const user = await User.findById(userOneId);
    expect(user).toBeNull();
});

test('Should not delete account for unauthorized user', async () => {
    await request(app)
    .delete('/users/me')
    .send()
    .expect(401)
});

test('Should upload avatar image', async () => {
    await request(app)
    .post('/users/me/avatar')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .attach('avatar', 'tests/fixtures/profile-pic.jpg')
    .expect(200)

    const user = await User.findById(userOneId);
    expect(user.avatar).toEqual(expect.any(Buffer));
});

test('Should update valid user fields', async () => {
    await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
        name: 'Joe'
    })
    .expect(200)

    const user = await User.findById(userOneId);
    expect(user.name).toEqual('Joe');
});

test('Should not update invalid user fields', async () => {
    await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
        location: 'NY'
    })
    .expect(400)
});