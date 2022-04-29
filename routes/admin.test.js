const request = require('supertest');
const { JSDOM } = require('jsdom');
const HttpError = require('http-errors');
const log = require('loglevel');
const User = require('../controllers/User');
const UserModel = require('../models/User');
const auth = require('../services/auth');

beforeAll(() => {
  log.disableAll();
});

jest.mock('../controllers/User', () => {
  return {
    fetchAll: jest.fn(),
    edit: jest.fn(),
    create: jest.fn(),
    deleteUser: jest.fn(),
  };
});

jest.mock('../services/environment', () => {
  return {
    port: 3000,
    stytchProjectId: 'project-test-11111111-1111-1111-1111-111111111111',
    stytchSecret: 'secret-test-111111111111',
    masterAdminEmail: 'master@gmail.com',
    automationTestMode: 'true',
  };
});

const mockUser = new UserModel({
  id: '1000',
  email: 'master@uwstout.edu',
  userId: 'user-test-someguid',
  enable: 'true',
  role: 'admin',
});

jest.mock('../services/auth', () => {
  return {
    authenticateUser: jest.fn(),
    revokeSession: jest.fn(),
    isUserLoaded: jest.fn(),
  };
});

function resetMockIsUserLoaded() {
  auth.isUserLoaded.mockImplementation((req, res, next) => {
    req.session = {
      session_token: 'thisisatoken',
      user: mockUser,
    };
    next();
  });
}

// a helper that creates an array structure for getUserById
function dataForGetUser(rows, offset = 0) {
  const data = [];
  for (let i = 1; i <= rows; i++) {
    const value = i + offset;
    const params = {
      id: `${value}`,
      email: `email${value}@uwstout.edu`,
      userId: `user-test-someguid${value}`,
      enable: 'false',
      role: 'user',
    };
    data.push(new UserModel(params));
  }
  return data;
}

const app = require('../app')();

describe('Admin Route Tests', () => {
  beforeEach(() => {
    User.fetchAll.mockReset();
    User.fetchAll.mockResolvedValue(null);
    resetMockIsUserLoaded();
    User.edit.mockReset();
    User.edit.mockResolvedValue(null);
    User.deleteUser.mockReset();
    User.deleteUser.mockResolvedValue(null);
  });

  describe('Admin Index Page Tests', () => {
    test('should make a call to fetchAll', async () => {
      const data = dataForGetUser(3);
      User.fetchAll.mockResolvedValueOnce(data);
      await request(app).get('/admin');
      expect(User.fetchAll.mock.calls).toHaveLength(1);
      expect(User.fetchAll.mock.calls[0]).toHaveLength(3);
      expect(User.fetchAll.mock.calls[0][0]).toBe('thisisatoken');
      expect(User.fetchAll.mock.calls[0][1]).toBe(0);
      expect(User.fetchAll.mock.calls[0][2]).toBe(10000000);
    });

    test('basic page checks', async () => {
      const data = dataForGetUser(3);
      User.fetchAll.mockResolvedValueOnce(data);
      const response = await request(app).get('/admin');
      const doc = new JSDOM(response.text).window.document;

      // check the main navbar
      expect(doc.querySelector('.navbar-nav>.active').getAttribute('href')).toBe('/admin');
      expect(doc.querySelector('.navbar-nav>.navbar-text').innerHTML).toContain(
        'master@uwstout.edu'
      );

      // count the rows
      const rows = doc.querySelectorAll('.card-body>table>tbody>tr');
      expect(rows).toHaveLength(data.length);

      // check the table contents
      for (let i = 0; i < rows.length; i++) {
        expect(rows[i].querySelector('td:nth-child(3)').innerHTML).toContain(data[i].email);
        expect(rows[i].querySelector('td:nth-child(4)').innerHTML).toContain(data[i].role);
      }
    });

    test('failed user role, redirect to advise', async () => {
      // create invalid user
      const mockUser = new UserModel({
        id: '1000',
        email: 'master@uwstout.edu',
        userId: 'user-test-someguid',
        enable: 'true',
        role: 'director', // use director as that is the highest user that cannot access this page
      });
      
      // sign in with invalid user account
      auth.isUserLoaded.mockReset();
      auth.isUserLoaded.mockImplementationOnce((req, res, next) => {
        req.session = {
          session_token: 'thisisatoken',
          user: mockUser,
        };
        next();
      });

      const response = await request(app).get('/admin');
      const doc = new JSDOM(response.text).window.document;

      // check the main navbar
      expect(doc.querySelector('.navbar-nav>.active').getAttribute('href')).toBe('/advise');

    });

    test('User.fetchAll thrown error', async () => {
      User.fetchAll.mockRejectedValue(HttpError(500, `Advisor API Error`));
      const response = await request(app).get('/admin');
      expect(User.fetchAll.mock.calls).toHaveLength(1);
      expect(User.fetchAll.mock.calls[0]).toHaveLength(3);
      expect(User.fetchAll.mock.calls[0][0]).toBe('thisisatoken');
      expect(User.fetchAll.mock.calls[0][1]).toBe(0);
      expect(User.fetchAll.mock.calls[0][2]).toBe(10000000);
      expect(response.statusCode).toBe(500);
    });

    test('User.edit successful route - enabled: false', async () => {
      const data = dataForGetUser(1);
      User.edit.mockResolvedValue(data[0]);
      const response = await request(app).post(`/admin/users/edit/${data[0].userId}`);
      expect(response.statusCode).toBe(303);
    });

    test('User.edit successful route - enabled: true', async () => {
      const data = dataForGetUser(1);
      User.edit.mockResolvedValue(data[0]);
      const response = await request(app)
        .post(`/admin/users/edit/${data[0].userId}`)
        .send({ enabled: true });
      expect(response.statusCode).toBe(303);
    });

    test('User.edit failure route', async () => {
      User.edit.mockRejectedValue(HttpError(500, `Advisor API Error`));
      const response = await request(app).post(`/admin/users/edit/BADID`);
      expect(response.statusCode).toBe(500);
    });

    test('User.deleteUser successful route', async () => {
      const data = dataForGetUser(1);
      User.deleteUser.mockResolvedValue(data[0]);
      const response = await request(app).get(`/admin/users/delete/${data[0].userId}`);
      expect(response.statusCode).toBe(303);
    });

    test('User.deleteUser thrown error', async () => {
      User.deleteUser.mockRejectedValue(HttpError(500, `Advisor API Error`));
      const response = await request(app).get(`/admin/users/delete/BADID`);
      expect(response.statusCode).toBe(500);
    });
  });
});
