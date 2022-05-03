const axios = require('axios');
const log = require('loglevel');
const Program = require('./Program');

jest.mock('axios');

beforeAll(() => {
  axios.create.mockReturnThis();
  log.disableAll();
});

describe('Program controller tests', () => {
  beforeEach(() => {
    axios.post.mockReset();
    axios.get.mockReset();
  });
  describe('create tests', () => {
    test('create - happy path create new', async () => {
      const program = {
        title: 'program1',
        description: 'program1description',
      };
      axios.post.mockResolvedValueOnce({ data: program, status: 201 });
      const result = await Program.create('mZAYn5aLEqKUlZ_Ad9U_fWr38GaAQ1oFAhT8ds245v7Q', program);
      expect(axios.post).toHaveBeenCalledWith('program', {
        title: 'program1',
        description: 'program1description',
      });
      expect(result.data).toEqual(program);
      expect(result.status).toEqual(201);
    });

    test('create - happy path retrieve existing', async () => {
      const program = {
        title: 'program1',
        description: 'program1description',
      };
      axios.post.mockResolvedValueOnce({ data: program, status: 200 });
      const result = await Program.create('mZAYn5aLEqKUlZ_Ad9U_fWr38GaAQ1oFAhT8ds245v7Q', program);
      expect(axios.post).toHaveBeenCalledWith('program', {
        title: 'program1',
        description: 'program1description',
      });
      expect(result.data).toEqual(program);
      expect(result.status).toEqual(200);
    });

    test('create - error response', async () => {
      axios.post.mockResolvedValueOnce({ status: 500, data: { Error: 'Internal Database Error' } });
      await expect(
        Program.create('mZAYn5aLEqKUlZ_Ad9U_fWr38GaAQ1oFAhT8ds245v7Q', {
          title: 'program1',
          description: 'program1description',
        })
      ).rejects.toThrow('Error 500: Internal Database Error');
      expect(axios.post).toHaveBeenCalledWith('program', {
        title: 'program1',
        description: 'program1description',
      });
    });
  });
});

describe('fetchAll tests', () => {
  test('fetchAll - happy path test', async () => {
    const programs = [
      {
        id: 1,
        title: 'program1',
        description: 'program1description',
      },
      {
        id: 2,
        title: 'program2',
        description: 'program2description',
      },
    ];
    axios.get.mockResolvedValueOnce({ data: programs, status: 200 });

    const result = await Program.fetchAll('mZAYn5aLEqKUlZ_Ad9U_fWr38GaAQ1oFAhT8ds245v7Q', 0, 100);

    expect(axios.get).toHaveBeenCalledWith('program?limit=100&offset=0');
    expect(result).toEqual(programs);
  });

  test('fetchAll -no records returned', async () => {
    const programs = [];
    axios.get.mockResolvedValueOnce({ status: 200, data: programs });
    const result = await Program.fetchAll('mZAYn5aLEqKUlZ_Ad9U_fWr38GaAQ1oFAhT8ds245v7Q', 0, 100);
    expect(axios.get).toHaveBeenCalledWith('program?limit=100&offset=0');
    expect(result).toHaveLength(0);
  });

  test('fetchAll - error response', async () => {
    axios.get.mockResolvedValueOnce({
      status: 500,
      data: { error: { status: 500, message: 'Internal Server Error' } },
    });
    await expect(
      Program.fetchAll('mZAYn5aLEqKUlZ_Ad9U_fWr38GaAQ1oFAhT8ds245v7Q', 0, 100)
    ).rejects.toThrow('Advisor API Error 500: Internal Server Error');
    expect(axios.get).toHaveBeenCalledWith('program?limit=100&offset=0');
  });
});

describe('delete tests', () => {
  test('delete - valid delete', async () => {
      const Program = {
          id: '1',
          title: 'Computer Science',
          description: 'This course is for students who want to learn how to program computers.',
      };
      axios.delete.mockResolvedValueOnce({
          data: Program,
          status: 200,
      });

      const result = await Program.deleteProgram('mZAYn5aLEqKUlZ_Ad9U_fWr38GaAQ1oFAhT8ds245v7Q', '1');

      expect(axios.delete).toHaveBeenCalledWith('program/1');
      expect(result.status).toEqual(200);
  });

  test('delete - Required Parameters Missing', async () => {
      axios.delete.mockResolvedValueOnce({
          status: 400,
          data: { Error: 'Required Parameters Missing' },
      });

      await expect(
          Program.deleteProgram('mZAYn5aLEqKUlZ_Ad9U_fWr38GaAQ1oFAhT8ds245v7Q', undefined)
      ).rejects.toThrow('Error 400: Required Parameters Missing');
      expect(axios.delete).toHaveBeenCalledWith('program/' + undefined);
  });
});
