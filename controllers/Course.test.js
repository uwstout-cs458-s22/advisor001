const axios = require('axios');
const log = require('loglevel');
const Course = require('./Course');

jest.mock('axios');

beforeAll(() => {
  axios.create.mockReturnThis();
  log.disableAll();
});

describe('Course controller tests', () => {
  beforeEach(() => {
    axios.post.mockReset();
    axios.get.mockReset();
  });

  describe('create tests', () => {});

  // Tests for fetchAll
});
