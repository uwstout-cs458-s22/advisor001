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

  describe('fetchAll tests', () => {
    test('fetchAll - happy path test', async () => {
      const courses = [
        {
          id: 1,
          prefix: 'CS',
          suffix: '123',
          title: 'Programming 1',
          credits: 3,
        },
        {
          id: 2,
          prefix: 'MATH',
          suffix: '101',
          title: 'Mathematics 1',
          credits: 3,
        },
      ];
      axios.get.mockResolvedValueOnce({ data: courses, status: 200 });

      const result = await Course.fetchAll('mZAYn5aLEqKUlZ_Ad9U_fWr38GaAQ1oFAhT8ds245v7Q', 0, 100);

      expect(axios.get).toHaveBeenCalledWith('course?limit=100&offset=0');
      expect(result).toEqual(courses);
    });

    test('fetchAll -no records returned', async () => {
      const courses = [];
      axios.get.mockResolvedValueOnce({ status: 200, data: courses });
      const result = await Course.fetchAll('mZAYn5aLEqKUlZ_Ad9U_fWr38GaAQ1oFAhT8ds245v7Q', 0, 100);
      expect(axios.get).toHaveBeenCalledWith('course?limit=100&offset=0');
      expect(result).toHaveLength(0);
    });

    test('fetchAll - error response', async () => {
      axios.get.mockResolvedValueOnce({
        status: 500,
        data: { error: { status: 500, message: 'Internal Server Error' } },
      });
      await expect(
        Course.fetchAll('mZAYn5aLEqKUlZ_Ad9U_fWr38GaAQ1oFAhT8ds245v7Q', 0, 100)
      ).rejects.toThrow('Advisor API Error 500: Internal Server Error');
      expect(axios.get).toHaveBeenCalledWith('course?limit=100&offset=0');
    });
  });

  describe('create tests', () => {
    test('create - happy path create new', async () => {
      const courses = {
        id: 1,
        title: 'Programming 1',
        description: 'This is a course',
        prefix: 'CS',
        suffix: '123',
        credits: 3,
      };
      axios.post.mockResolvedValueOnce({ data: courses, status: 201 });
      const result = await Course.create(
        'course',
        courses.title,
        courses.description,
        courses.prefix,
        courses.suffix,
        courses.credits
      );
      expect(axios.post).toHaveBeenCalledWith(
        'course',
        courses.title,
        courses.description,
        courses.prefix,
        courses.suffix,
        courses.credits
      );
      expect(result).toEqual(courses);
    });

    /*
    test('create - happy path retrieve existing', async () => {
      const courses = {
        id: 1,
        prefix: 'CS',
        suffix: '123',
        title: 'Programming 1',
        credits: 3,
      };
      axios.post.mockResolvedValueOnce({ data: courses, status: 200 });
      const result = await Course.create('course', courses);
      expect(axios.post).toHaveBeenCalledWith('course', courses);
      expect(result).toEqual(courses);
    });

    
    test('create - error response', async () => {
      axios.post.mockResolvedValueOnce({ status: 500, data: { Error: 'Internal Database Error' } });
      await expect(
        Course.create(
          'mZAYn5aLEqKUlZ_Ad9U_fWr38GaAQ1oFAhT8ds245v7Q',
          'user-test-6db45fe7-6b2a-456f-9f53-0e2d2ebb320c',
          'barb26@example.com'
        )
      ).rejects.toThrow('Error 500: Internal Database Error');
      expect(axios.post).toHaveBeenCalledWith('users', {
        email: 'barb26@example.com',
        userId: 'user-test-6db45fe7-6b2a-456f-9f53-0e2d2ebb320c',
      });
    });

    test('create - missing email', async () => {
      axios.post.mockResolvedValueOnce({
        status: 400,
        data: { Error: 'Required Parameters Missing' },
      });
      await expect(
        Course.create(
          'mZAYn5aLEqKUlZ_Ad9U_fWr38GaAQ1oFAhT8ds245v7Q',
          'user-test-6db45fe7-6b2a-456f-9f53-0e2d2ebb320c'
        )
      ).rejects.toThrow('Error 400: Required Parameters Missing');
      expect(axios.post).toHaveBeenCalledWith('users', {
        userId: 'user-test-6db45fe7-6b2a-456f-9f53-0e2d2ebb320c',
      });
    });

    test('create - missing userId', async () => {
      axios.post.mockResolvedValueOnce({
        status: 400,
        data: { Error: 'Required Parameters Missing' },
      });
      await expect(
        Course.create(
          'mZAYn5aLEqKUlZ_Ad9U_fWr38GaAQ1oFAhT8ds245v7Q',
          undefined,
          'barb26@example.com'
        )
      ).rejects.toThrow('Error 400: Required Parameters Missing');
      expect(axios.post).toHaveBeenCalledWith('users', {
        email: 'barb26@example.com',
      });
    });

    test('create - missing all parameters', async () => {
      axios.post.mockResolvedValueOnce({
        status: 400,
        data: { Error: 'Required Parameters Missing' },
      });
      await expect(Course.create('mZAYn5aLEqKUlZ_Ad9U_fWr38GaAQ1oFAhT8ds245v7Q')).rejects.toThrow(
        'Error 400: Required Parameters Missing'
      );
      expect(axios.post).toHaveBeenCalledWith('users', {});
    }); */
  });
});
