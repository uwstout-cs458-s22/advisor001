const request = require('supertest');
const { JSDOM } = require('jsdom');
const log = require('loglevel');
const UserModel = require('../models/User');
const auth = require('../services/auth');

beforeAll(() => {
  log.disableAll();
});

const mockUser = new UserModel({
  id: '1000',
  email: 'master@uwstout.edu',
  userId: 'user-test-someguid',
  enable: true,
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

const app = require('../app')();

describe('Advise Route Tests', () => {
  beforeEach(() => {
    resetMockIsUserLoaded();
  });

  describe('Advise Index Page Tests', () => {
    test('basic page checks', async () => {
      const response = await request(app).get('/advise');
      const doc = new JSDOM(response.text).window.document;

      // check the main navbar
      expect(doc.querySelector('.navbar-nav>.active').getAttribute('href')).toBe('/advise');
      expect(doc.querySelector('.navbar-nav>.navbar-text').innerHTML).toContain(
        'master@uwstout.edu'
      );
    });

    test('failed enabled, redirect to access denied', async () => {
      // create invalid user
      const disabledUser = {
        id: '1000',
        email: 'master@uwstout.edu',
        userId: 'user-test-someguid',
        enable: false, // disabled user
        role: 'admin',
      };

      // sign in with invalid user account
      auth.isUserLoaded.mockReset();
      auth.isUserLoaded.mockImplementationOnce((req, res, next) => {
        req.session = {
          session_token: 'thisisatoken',
          user: disabledUser,
        };
        next();
      });

      const response = await request(app).get('/advise');
      expect(response.text).toContain('Access Denied');
    });
  });
});
