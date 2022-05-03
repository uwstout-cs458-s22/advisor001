const request = require('supertest');
const { JSDOM } = require('jsdom');
const log = require('loglevel');
const UserModel = require('../models/User');
const CourseModel = require('../models/Course');
const TermModel = require('../models/Term');
const auth = require('../services/auth');
const Course = require('../controllers/Course');
const Term = require('../controllers/Term');
const Program = require('../controllers/Program');
const HttpError = require('http-errors');
const ProgramModel = require('../models/Program');
global.window = { location: { pathname: '/manage' } };

beforeAll(() => {
  log.disableAll();
});

jest.mock('../controllers/Course', () => {
  return {
    fetchAll: jest.fn(),
    create: jest.fn(),
    edit: jest.fn(),
    deleteCourse: jest.fn(),
  };
});

jest.mock('../controllers/Term', () => {
  return {
    create: jest.fn(),
    edit: jest.fn(),
    fetchAll: jest.fn(),
  };
});

jest.mock('../controllers/Program', () => {
  return {
    fetchAll: jest.fn(),
    create: jest.fn(),
    deleteProgram: jest.fn()
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
  description: 'DESCRIPTION',
  credits: 3,
});

const mockTerm = new TermModel({
  id: '1000',
  title: 'TITLE',
  startyear: 2020,
  semester: 2,
});

const mockProgram = new ProgramModel({
  id: '1000',
  title: 'TITLE',
  description: 'DESCRIPTION',
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
      description: 'DESCRIPTION',
      credits: `${value}`,
    };
    data.push(new CourseModel(params));
  }
  return data;
}

function dataForGetTerm(rows, offset = 0) {
  const data = [];
  for (let i = 1; i <= rows; i++) {
    const value = i + offset;
    const params = {
      id: `${value}`,
      title: `TITLE${value}`,
      startyear: `${value}`,
      semester: `${value}`,
    };
    data.push(new TermModel(params));
  }
  return data;
}

function dataForGetProgram(row, offset = 0) {
  const data = [];
  for (let i = 1; i <= row; i++) {
    const value = i + offset;
    const params = {
      id: `${value}`,
      title: `TITLE${value}`,
      description: `DESCRIPTION${value}`,
    };
    data.push(new TermModel(params));
  }
  return data;
}

const app = require('../app')();

describe('Manage Route Tests', () => {
  beforeEach(() => {
    Course.fetchAll.mockReset();
    Course.fetchAll.mockResolvedValue(null);
    Course.create.mockReset();
    Course.create.mockResolvedValue(null);
    Course.edit.mockResolvedValue(null);
    Course.deleteCourse.mockResolvedValue(null);
    Term.create.mockResolvedValue(null);
    resetMockIsUserLoaded();
  });

  describe('Manage Index Page Tests', () => {
    test('should make a call to fetchAll', async () => {
      const data = dataForGetCourse(3);
      Course.fetchAll.mockResolvedValue(data);
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

    test('failed user role, redirect to advise', async () => {
      const response = await request(app).get('/manage');
      const doc = new JSDOM(response.text).window.document;

      // check the main navbar
      expect(doc.querySelector('.navbar-nav>.active').getAttribute('href')).toBe('/advise');
    });

    test('basic page checks', async () => {
      // create valid user
      const mockUser = new UserModel({
        id: '1000',
        email: 'master@uwstout.edu',
        userId: 'user-test-someguid',
        enable: 'true',
        role: 'director', // use director as that is the lowest user role that can access this page
      });

      // sign in with valid user account
      auth.isUserLoaded.mockReset();
      auth.isUserLoaded.mockImplementationOnce((req, res, next) => {
        req.session = {
          session_token: 'thisisatoken',
          user: mockUser,
        };
        next();
      });

      const data = dataForGetCourse(3);
      const termData = dataForGetTerm(3);
      const programData = dataForGetProgram(3);
      Course.fetchAll.mockResolvedValueOnce(data);
      Term.fetchAll.mockResolvedValueOnce(termData);
      Program.fetchAll.mockResolvedValueOnce(programData);
      const response = await request(app).get('/manage');
      const doc = new JSDOM(response.text).window.document;

      // check the main navbar
      expect(doc.querySelector('.navbar-nav>.active').getAttribute('href')).toBe('/manage');

      // count the rows
      const rows = doc.querySelectorAll('.card-body>table>tbody>tr');
      expect(rows).toHaveLength(data.length + termData.length + programData.length);
    });

    test('create course success', async () => {
      Course.create.mockResolvedValueOnce({});
      const response = await request(app).post(`/manage/course/add/`);
      expect(response.statusCode).toBe(303);
    });

    test('create course failure', async () => {
      Course.create.mockRejectedValueOnce(HttpError(500, `Advisor API Error`));
      const response = await request(app).post('/manage/course/add/');
      expect(response.statusCode).toBe(500);
    });

    test('edit course success', async () => {
      const data = dataForGetCourse(1);
      Course.edit.mockResolvedValueOnce(data[0]);
      const response = await request(app).post(`/manage/course/edit/${data[0].id}`).send({
        title: 'NEW TITLE',
        description: 'NEW DESCRIPTION',
        prefix: 'NEW PREFIX',
        suffix: 'NEW SUFFIX',
        credits: 1,
      });
      expect(response.statusCode).toBe(303);
    });

    test('edit course failure', async () => {
      const data = dataForGetCourse(1);
      Course.edit.mockRejectedValueOnce(HttpError(500, `Advisor API Error`));
      const response = await request(app).post(`/manage/course/edit/${data[0].id}`);
      expect(response.statusCode).toBe(500);
    });

    test('Course.deleteCourse successful route', async () => {
      const data = dataForGetCourse(2, 1);
      Course.deleteCourse.mockResolvedValue(data[0]);
      const response = await request(app).get(`/manage/course/delete/${data[0].id}`);
      expect(response.statusCode).toBe(303);
    });

    test('Course.deleteCourse thrown error', async () => {
      Course.deleteCourse.mockRejectedValue(HttpError(500, `Advisor API Error`));
      const response = await request(app).get(`/manage/course/delete/BADID`);
      expect(response.statusCode).toBe(500);
    });

    test('Term.create success', async () => {
      Term.create.mockResolvedValueOnce(mockTerm);
      const response = await request(app).post(`/manage/term/add/`);
      expect(response.statusCode).toBe(303);
    });

    test('Term.create failure', async () => {
      Term.create.mockRejectedValueOnce(HttpError(500, `Advisor API Error`));
      const response = await request(app).post('/manage/term/add/');
      expect(response.statusCode).toBe(500);
    });

    test('Term.edit success', async () => {
      const data = dataForGetTerm(1);
      Term.edit.mockResolvedValueOnce(data[0]);
      const response = await request(app).post(`/manage/term/edit/${data[0].id}`).send({
        title: 'NEW TITLE',
        startYear: 2000,
        semester: 1,
      });
      expect(response.statusCode).toBe(303);
    });
    test('Term,edit failure', async () => {
      Term.edit.mockRejectedValueOnce(HttpError(500, `Advisor API Error`));
      const response = await request(app).post(`/manage/term/edit/BADID`);
      expect(response.statusCode).toBe(500);
    });

    test('Program.create success', async () => {
      Program.create.mockResolvedValueOnce(mockProgram);
      const response = await request(app).post(`/manage/program/add/`);
      expect(response.statusCode).toBe(303);
    });

    test('Program.create failure', async () => {
      Program.create.mockRejectedValueOnce(HttpError(500, `Advisor API Error`));
      const response = await request(app).post('/manage/program/add/');
      expect(response.statusCode).toBe(500);
    });

    test('Program.deleteProgram successful route', async () => {
      const data = dataForGetProgram(2, 1);
      Program.deleteProgram.mockResolvedValue(data[0]);
      const response = await request(app).get(`/manage/program/delete/${data[0].id}`);
      expect(response.statusCode).toBe(303);
    });

    test('Program.deleteProgram thrown error', async () => {
      Program.deleteProgram.mockRejectedValue(HttpError(500, `Advisor API Error`));
      const response = await request(app).get(`/manage/program/delete/BADID`);
      expect(response.statusCode).toBe(500);
    });
  });
});
