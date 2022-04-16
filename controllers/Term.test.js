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
  });
});
