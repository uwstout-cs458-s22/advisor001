const request = require('supertest');
const { JSDOM } = require('jsdom');
const log = require('loglevel');
const CourseModel = require('../models/Course');
const auth = require('../services/auth');
const Course = require('../controllers/Course');
const HttpError = require('http-errors');

beforeAll(() => {
  log.disableAll();
});

jest.mock('../controllers/Course', () => {
  return {
    fetchAll: jest.fn(),
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

const mockCourse = new CourseModel({
  id: '1000',
  prefix: 'COURSE',
  suffix: '000',
  title: 'TITLE',
  credits: 3,
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
      user: mockCourse,
    };
    next();
  });
}

// a helper that creates an array structure for getUserById
function dataForGetCourse(rows, offset = 0) {
  const data = [];
  for (let i = 1; i <= rows; i++) {
    const value = i + offset;
    const params = {
      id: `${value}`,
      prefix: `COURSE`,
      suffix: `${value}`,
      title: 'TITLE',
      credits: `${value}`,
    };
    data.push(new CourseModel(params));
  }
  return data;
}

const app = require('../app')();

describe('Manage Route Tests', () => {
  beforeEach(() => {
    Course.fetchAll.mockReset();
    Course.fetchAll.mockResolvedValue(null);
    resetMockIsUserLoaded();
  });

  describe('Manage Index Page Tests', () => {
    test('should make a call to fetchAll', async () => {
      const data = dataForGetCourse(3);
      Course.fetchAll.mockResolvedValueOnce(data);
      await request(app).get('/manage');
      expect(Course.fetchAll.mock.calls).toHaveLength(1);
      expect(Course.fetchAll.mock.calls[0]).toHaveLength(3);
      expect(Course.fetchAll.mock.calls[0][0]).toBe('thisisatoken');
      expect(Course.fetchAll.mock.calls[0][1]).toBe(0);
      expect(Course.fetchAll.mock.calls[0][2]).toBe(100);
    });

    test('User.fetchAll thrown error', async () => {
      Course.fetchAll.mockRejectedValue(HttpError(500, `Advisor API Error`));
      const response = await request(app).get('/manage');
      expect(Course.fetchAll.mock.calls).toHaveLength(1);
      expect(Course.fetchAll.mock.calls[0]).toHaveLength(3);
      expect(Course.fetchAll.mock.calls[0][0]).toBe('thisisatoken');
      expect(Course.fetchAll.mock.calls[0][1]).toBe(0);
      expect(Course.fetchAll.mock.calls[0][2]).toBe(100);
      expect(response.statusCode).toBe(500);
    });

    test('basic page checks', async () => {
      const data = dataForGetCourse(3);
      Course.fetchAll.mockResolvedValueOnce(data);
      const response = await request(app).get('/manage');
      const doc = new JSDOM(response.text).window.document;

      // check the main navbar
      expect(doc.querySelector('.navbar-nav>.active').getAttribute('href')).toBe('/manage');

      // count the rows
      const rows = doc.querySelectorAll('.card-body>table>tbody>tr');
      expect(rows).toHaveLength(data.length);

      // check the table contents
      for (let i = 0; i < rows.length; i++) {
        expect(rows[i].querySelector('td:nth-child(2)').innerHTML).toBe(data[i].title);
        expect(rows[i].querySelector('td:nth-child(3)').innerHTML).toBe(data[i].prefix);
        expect(rows[i].querySelector('td:nth-child(4)').innerHTML).toBe(data[i].suffix);
        expect(rows[i].querySelector('td:nth-child(5)').innerHTML).toBe(data[i].credits);
      }
    });
  });
});
