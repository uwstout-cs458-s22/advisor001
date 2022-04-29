const axios = require('axios');
const log = require('loglevel');
const Term = require('./Term');

jest.mock('axios');

beforeAll(() => {
  axios.create.mockReturnThis();
  log.disableAll();
});

describe('Term controller tests', () => {
  beforeEach(() => {
    axios.post.mockReset();
    axios.get.mockReset();
  });
  describe('create tests', () => {
    test('create - happy path create new', async () => {
      const term = {
        title: 'term1',
        startyear: 2022,
        semester: 2,
      };
      axios.post.mockResolvedValueOnce({ data: term, status: 201 });
      const result = await Term.create('mZAYn5aLEqKUlZ_Ad9U_fWr38GaAQ1oFAhT8ds245v7Q', term);
      expect(axios.post).toHaveBeenCalledWith('term', {
        title: 'term1',
        startyear: 2022,
        semester: 2,
      });
      expect(result.data).toEqual(term);
      expect(result.status).toEqual(201);
    });

    test('create - happy path retrieve existing', async () => {
      const term = {
        title: 'term1',
        startyear: 2022,
        semester: 2,
      };
      axios.post.mockResolvedValueOnce({ data: term, status: 200 });
      const result = await Term.create('mZAYn5aLEqKUlZ_Ad9U_fWr38GaAQ1oFAhT8ds245v7Q', term);
      expect(axios.post).toHaveBeenCalledWith('term', {
        title: 'term1',
        startyear: 2022,
        semester: 2,
      });
      expect(result.data).toEqual(term);
      expect(result.status).toEqual(200);
    });

    test('create - error response', async () => {
      axios.post.mockResolvedValueOnce({ status: 500, data: { Error: 'Internal Database Error' } });
      await expect(
        Term.create('mZAYn5aLEqKUlZ_Ad9U_fWr38GaAQ1oFAhT8ds245v7Q', {
          title: 'term1',
          startyear: 2022,
          semester: 2,
        })
      ).rejects.toThrow('Error 500: Internal Database Error');
      expect(axios.post).toHaveBeenCalledWith('term', {
        title: 'term1',
        startyear: 2022,
        semester: 2,
      });
    });

    describe('edit term tests', () => {
      test('edit - happy path edit existing', async () => {
        const term = {
          id: 1,
          title: 'term1',
          startyear: 2022,
          semester: 2,
        };
        axios.put.mockResolvedValueOnce({ data: term, status: 200 });
        const result = await Term.edit(
          'mZAYn5aLEqKUlZ_Ad9U_fWr38GaAQ1oFAhT8ds245v7Q',
          term.id,
          term
        );
        expect(axios.put).toHaveBeenCalledWith(`term/${term.id}`, {
          id: 1,
          title: 'term1',
          startyear: 2022,
          semester: 2,
        });
        expect(result.data).toEqual(term);
        expect(result.status).toEqual(200);
      });
      test('edit - error response', async () => {
        axios.put.mockResolvedValueOnce({
          status: 500,
          data: { error: { status: 500, message: 'Internal Server Error' } },
        });
        await expect(Term.edit({})).rejects.toThrow('Advisor API Error 500: Internal Server Error');
        expect(axios.put).toHaveBeenCalledWith(`term/${undefined}`, undefined);
      });
    });
  });
});

describe('fetchAll tests', () => {
  test('fetchAll - happy path test', async () => {
    const terms = [
      {
        id: 1,
        title: 'term1',
        startyear: 2022,
        semester: 0,
      },
      {
        id: 2,
        title: 'term2',
        startyear: 2022,
        semester: 2,
      },
    ];
    axios.get.mockResolvedValueOnce({ data: terms, status: 200 });

    const result = await Term.fetchAll('mZAYn5aLEqKUlZ_Ad9U_fWr38GaAQ1oFAhT8ds245v7Q', 0, 100);

    expect(axios.get).toHaveBeenCalledWith('term?limit=100&offset=0');
    expect(result).toEqual(terms);
  });

  test('fetchAll -no records returned', async () => {
    const terms = [];
    axios.get.mockResolvedValueOnce({ status: 200, data: terms });
    const result = await Term.fetchAll('mZAYn5aLEqKUlZ_Ad9U_fWr38GaAQ1oFAhT8ds245v7Q', 0, 100);
    expect(axios.get).toHaveBeenCalledWith('term?limit=100&offset=0');
    expect(result).toHaveLength(0);
  });

  test('fetchAll - error response', async () => {
    axios.get.mockResolvedValueOnce({
      status: 500,
      data: { error: { status: 500, message: 'Internal Server Error' } },
    });
    await expect(
      Term.fetchAll('mZAYn5aLEqKUlZ_Ad9U_fWr38GaAQ1oFAhT8ds245v7Q', 0, 100)
    ).rejects.toThrow('Advisor API Error 500: Internal Server Error');
    expect(axios.get).toHaveBeenCalledWith('term?limit=100&offset=0');
  });
});
