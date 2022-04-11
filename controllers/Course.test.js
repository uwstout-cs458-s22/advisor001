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
        prefix: 'CS',
        suffix: '123',
        credits: 3,
        description: 'This course is for students who want to learn how to program computers.',
        title: 'Programming 1',
      };

      axios.post.mockResolvedValueOnce({ data: courses, status: 201 });
      const result = await Course.create(courses.data);
      expect(axios.post).toHaveBeenCalledWith('course', courses.data);
      expect(result.data).toEqual(courses);
      expect(result.status).toEqual(201);
    });

    test('create - error response', async () => {
      axios.post.mockResolvedValueOnce({
        status: 500,
        data: { error: { status: 500, message: 'Internal Server Error' } },
      });
      await expect(Course.create({})).rejects.toThrow('Advisor API Error 500: undefined');
      expect(axios.post).toHaveBeenCalledWith('course', undefined);
    });
  });

  describe('edittests', () => {
    test('edit course - happy path', async () => {
      const courses = {
        prefix: 'CS',
        suffix: '123',
        credits: 3,
        description: 'This course is for students who want to learn how to program computers.',
        title: 'Programming 1',
      };

      axios.put.mockResolvedValueOnce({ data: courses, status: 200 });
      const result = await Course.edit(courses.id, courses.data);
      expect(axios.put).toHaveBeenCalledWith(`course/${courses.id}`, courses.data);
      expect(result.data).toEqual(courses);
      expect(result.status).toEqual(200);
    });

    test('edit - error response', async () => {
      axios.put.mockResolvedValueOnce({
        status: 500,
        data: { error: { status: 500, message: 'Internal Server Error' } },
      });
      await expect(Course.edit({})).rejects.toThrow('Advisor API Error 500: Internal Server Error');
      expect(axios.put).toHaveBeenCalledWith(`course/${undefined}`, undefined);
    });
  });
});
