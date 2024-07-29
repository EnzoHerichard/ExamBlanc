const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = require('./server');

const port = 3000;

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'garage_db2'
});

beforeAll((done) => {
  db.connect(done);
});

afterAll((done) => {
  db.end(done);
});

describe('POST /api/signup', () => {
  it('should register a new user', async () => {
    const response = await request(app)
      .post('/api/signup')
      .send({
        lastname: 'Doe',
        firstname: 'John',
        email: 'test@gmail.com',
        password: 'test'
      });

    expect(response.status).toBe(201);
    expect(response.text).toBe('User registered');
  });
});

describe('POST /api/signin', () => {
  it('should sign in and return a token', async () => {
    const response = await request(app)
      .post('/api/signin')
      .send({
        email: 'test@gmail.com',
        password: 'test'
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('auth', true);
    expect(response.body).toHaveProperty('role');
    expect(response.headers['set-cookie'][0]).toMatch(/token=/);
  });
});

describe('GET /api/clients/count', () => {
  it('should return the count of clients', async () => {
    const signinResponse = await request(app)
      .post('/api/signin')
      .send({ email: 'test@gmail.com', password: 'test' });
    
    const token = signinResponse.headers['set-cookie'][0].split(';')[0].split('=')[1];
    
    const response = await request(app)
      .get('/api/clients/count')
      .set('Cookie', `token=${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('count');
  });
});

describe('GET /api/client/:id', () => {
  it('should return a specific client', async () => {
    const signinResponse = await request(app)
      .post('/api/signin')
      .send({ email: 'test@gmail.com', password: 'test' });

    const token = signinResponse.headers['set-cookie'][0].split(';')[0].split('=')[1];

    const response = await request(app)
      .get('/api/client/1')
      .set('Cookie', `token=${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
  });
});

describe('GET /api/vehicules', () => {
  it('should return all vehicles', async () => {
    const signinResponse = await request(app)
      .post('/api/signin')
      .send({ email: 'test@gmail.com', password: 'test' });

    const token = signinResponse.headers['set-cookie'][0].split(';')[0].split('=')[1];

    const response = await request(app)
      .get('/api/vehicules')
      .set('Cookie', `token=${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
  });
});

describe('POST /api/vehicules', () => {
  it('should add a new vehicle', async () => {
    const signinResponse = await request(app)
      .post('/api/signin')
      .send({ email: 'test@gmail.com', password: 'test' });

    const token = signinResponse.headers['set-cookie'][0].split(';')[0].split('=')[1];

    const response = await request(app)
      .post('/api/vehicules')
      .set('Cookie', `token=${token}`)
      .send({
        id: 1,
        marque: 'Toyota',
        modele: 'Corolla',
        annee: 2020,
        client_id: 1
      });

    expect(response.status).toBe(201);
    expect(response.text).toBe('Vehicule added');
  });
});

describe('GET /api/vehicule/:id', () => {
  it('should return a specific vehicle', async () => {
    const signinResponse = await request(app)
      .post('/api/signin')
      .send({ email: 'test@gmail.com', password: 'test' });

    const token = signinResponse.headers['set-cookie'][0].split(';')[0].split('=')[1];

    const response = await request(app)
      .get('/api/vehicule/1')
      .set('Cookie', `token=${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
  });
});

describe('PUT /api/vehicule/:id', () => {
  it('should update a vehicle', async () => {
    const signinResponse = await request(app)
      .post('/api/signin')
      .send({ email: 'test@gmail.com', password: 'test' });

    const token = signinResponse.headers['set-cookie'][0].split(';')[0].split('=')[1];

    const response = await request(app)
      .put('/api/vehicule/1')
      .set('Cookie', `token=${token}`)
      .send({
        newid: 1,
        marque: 'Honda',
        modele: 'Civic',
        annee: 2021,
        client_id: 1
      });

    expect(response.status).toBe(200);
    expect(response.text).toBe('Vehicule updated');
  });
});

describe('DELETE /api/vehicule/:id', () => {
  it('should delete a vehicle', async () => {
    const signinResponse = await request(app)
      .post('/api/signin')
      .send({ email: 'test@gmail.com', password: 'test' });

    const token = signinResponse.headers['set-cookie'][0].split(';')[0].split('=')[1];

    const response = await request(app)
      .delete('/api/vehicule/2')
      .set('Cookie', `token=${token}`);

    expect(response.status).toBe(200);
    expect(response.text).toBe('Vehicule deleted');
  });
});

