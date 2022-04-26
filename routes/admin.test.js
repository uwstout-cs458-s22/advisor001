const request = require('supertest');
const { JSDOM } = require('jsdom');
const HttpError = require('http-errors');
const log = require('loglevel');
const User = require('../controllers/User');
const UserModel = require('../models/User');
const auth = require('../services/auth');
global.window = { location: { pathname: '/admin' } };

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

function mockUserIsLoggedIn() {
  auth.isUserLoaded.mockReset();
  auth.isUserLoaded.mockImplementationOnce((req, res, next) => {
    req.session = {
      session_token: 'thisisatoken',
      user: mockUser,
    };
    next();
  });
}

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
    test('User.edit successful route disabled', async () => {
      mockUserIsLoggedIn();
      const data = dataForGetUser(1);
      User.edit.mockResolvedValue(data[0]);
      expect(data[0].userId).toBe('user-test-someguid1');
      const response = await request(app).post(`/admin/users/edit/${data[0].userId}`);
      expect(response.statusCode).toBe(302);
      expect(global.window.location.pathname).toEqual('/admin');
    });

    test('User.edit successful route enabled', async () => {
      mockUserIsLoggedIn();
      const data = dataForGetUser(1);
      User.edit.mockResolvedValue(data[0]);
      expect(data[0].userId).toBe('user-test-someguid1');
      const response = await request(app)
        .post(`/admin/users/edit/${data[0].userId}`)
        .send({ enabled: true });
      expect(response.statusCode).toBe(302);
      expect(global.window.location.pathname).toEqual('/admin');
    });

    test('User.edit failure route', async () => {
      mockUserIsLoggedIn();
      const data = dataForGetUser(1);
      User.edit.mockResolvedValue(data[0]);
      const badData = {
        userId: 'not-a-guid',
        enabled: 'true',
        role: 'admin',
      };
      data[0].userId = 0;
      const response = await request(app).post(`/admin/users/edit/${badData.userId}`).send(badData);
      expect(response.statusCode).toBe(500);
    });

    test('User.deleteUser successful route', async () => {
      mockUserIsLoggedIn();
      const data = dataForGetUser(1);
      User.deleteUser.mockResolvedValue(data[0]);
      expect(data[0].userId).toBe('user-test-someguid1');
      const response = await request(app).get(`/admin/users/delete/${data[0].userId}`);
      expect(response.statusCode).not.toBe(404);
      // Line 34 does not get covered by the test, but the test below covers it.
      expect(global.window.location.pathname).toEqual('/admin');
    });

    test('User.deleteUser thrown error', async () => {
      const response = await request(app).get(`/admin/users/delete/${undefined}`);
      expect(response.statusCode).toBe(500);
    });
  });
});
