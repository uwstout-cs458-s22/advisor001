const axios = require('axios');
const log = require('loglevel');
const User = require('./User');

jest.mock('axios');

beforeAll(() => {
  axios.create.mockReturnThis();
  log.disableAll();
});

describe('User controller tests', () => {
  beforeEach(() => {
    axios.post.mockReset();
    axios.get.mockReset();
  });

  describe('fetchAll tests', () => {
    test('fetchAll - happy path test', async () => {
      // NOTE:  Since deSerializeUser is a straight map, we can allow fetchAll to call directly
      // if deSerializeUser was any more complex, the correct approach would be to
      // mock deSerializeUser and test deSerializeUser separately.
      const users = [
        {
          id: 1234,
          email: 'joe25@example.com',
          enable: true,
          role: 'user',
          userId: 'user-test-f8b0f866-35de-4ba4-9a15-925775baebe',
        },
        {
          id: 4567,
          email: 'barb26@example.com',
          enable: true,
          role: 'admin',
          userId: 'user-test-6db45fe7-6b2a-456f-9f53-0e2d2ebb320c',
        },
      ];
      axios.get.mockResolvedValueOnce({ data: users, status: 200 });

      const result = await User.fetchAll('mZAYn5aLEqKUlZ_Ad9U_fWr38GaAQ1oFAhT8ds245v7Q', 0, 100);

      expect(axios.get).toHaveBeenCalledWith('users?offset=0&limit=100');
      expect(result).toEqual(users);
    });

    test('fetchAll -no records returned', async () => {
      const users = [];
      axios.get.mockResolvedValueOnce({ status: 200, data: users });
      const result = await User.fetchAll('mZAYn5aLEqKUlZ_Ad9U_fWr38GaAQ1oFAhT8ds245v7Q', 0, 100);
      expect(axios.get).toHaveBeenCalledWith('users?offset=0&limit=100');
      expect(result).toHaveLength(0);
    });

    test('fetchAll - error response', async () => {
      axios.get.mockResolvedValueOnce({
        status: 500,
        data: { error: { status: 500, message: 'Internal Server Error' } },
      });
      await expect(
        User.fetchAll('mZAYn5aLEqKUlZ_Ad9U_fWr38GaAQ1oFAhT8ds245v7Q', 0, 100)
      ).rejects.toThrow('Advisor API Error 500: Internal Server Error');
      expect(axios.get).toHaveBeenCalledWith('users?offset=0&limit=100');
    });
  });

  describe('create tests', () => {
    beforeEach(() => {
      axios.post.mockReset();
      axios.get.mockReset();
    });
    test('create - happy path create new', async () => {
      const user = {
        id: 4567,
        email: 'barb26@example.com',
        enable: true,
        role: 'admin',
        userId: 'user-test-6db45fe7-6b2a-456f-9f53-0e2d2ebb320c',
      };
      axios.post.mockResolvedValueOnce({ data: user, status: 201 });
      const result = await User.create(
        'mZAYn5aLEqKUlZ_Ad9U_fWr38GaAQ1oFAhT8ds245v7Q',
        'user-test-6db45fe7-6b2a-456f-9f53-0e2d2ebb320c',
        'barb26@example.com'
      );
      expect(axios.post).toHaveBeenCalledWith('users', {
        email: 'barb26@example.com',
        userId: 'user-test-6db45fe7-6b2a-456f-9f53-0e2d2ebb320c',
      });
      expect(result).toEqual(user);
    });

    test('create - happy path retrieve existing', async () => {
      const user = {
        id: 4567,
        email: 'barb26@example.com',
        enable: true,
        role: 'admin',
        userId: 'user-test-6db45fe7-6b2a-456f-9f53-0e2d2ebb320c',
      };
      axios.post.mockResolvedValueOnce({ data: user, status: 200 });
      const result = await User.create(
        'mZAYn5aLEqKUlZ_Ad9U_fWr38GaAQ1oFAhT8ds245v7Q',
        'user-test-6db45fe7-6b2a-456f-9f53-0e2d2ebb320c',
        'barb26@example.com'
      );
      expect(axios.post).toHaveBeenCalledWith('users', {
        email: 'barb26@example.com',
        userId: 'user-test-6db45fe7-6b2a-456f-9f53-0e2d2ebb320c',
      });
      expect(result).toEqual(user);
    });

    test('create - error response', async () => {
      axios.post.mockResolvedValueOnce({ status: 500, data: { Error: 'Internal Database Error' } });
      await expect(
        User.create(
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
        User.create(
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
        User.create('mZAYn5aLEqKUlZ_Ad9U_fWr38GaAQ1oFAhT8ds245v7Q', undefined, 'barb26@example.com')
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
      await expect(User.create('mZAYn5aLEqKUlZ_Ad9U_fWr38GaAQ1oFAhT8ds245v7Q')).rejects.toThrow(
        'Error 400: Required Parameters Missing'
      );
      expect(axios.post).toHaveBeenCalledWith('users', {});
    });
  });

  describe('edit tests', () => {
    test('edit - valid edit', async () => {
      const user = {
        // Test user values
        id: 5678,
        email: 'test3r@testy.com',
        enable: true,
        role: 'user',
        userId: 'user-test-6db45fe7-6b2a-456f-9f53-0e2d2ebb320c',
      };

      axios.put.mockResolvedValueOnce({ data: user, status: 200 });
      const result = await User.edit(
        'mZAYn5aLEqKUlZ_Ad9U_fWr38GaAQ1oFAhT8ds245v7Q',
        'user-test-6db45fe7-6b2a-456f-9f53-0e2d2ebb320c',
        JSON.stringify(JSON.parse(JSON.stringify(user)))
      );

      expect(axios.put).toHaveBeenCalledWith(
        '/users/user-test-6db45fe7-6b2a-456f-9f53-0e2d2ebb320c',
        '{"id":5678,"email":"test3r@testy.com","enable":true,"role":"user","userId":"user-test-6db45fe7-6b2a-456f-9f53-0e2d2ebb320c"}'
      );
      expect(result).toEqual(user);
    });

    test('edit - error response', async () => {
      const user = {
        id: 5678,
        email: 'test3r@testy.com',
        enable: true,
        role: 'user',
        userId: 'user-test-6db45fe7-6b2a-456f-9f53-0e2d2ebb320c',
      };

      axios.put.mockResolvedValueOnce({ status: 500, data: { Error: 'Internal Database Error' } });
      await expect(
        User.edit(
          'mZAYn5aLEqKUlZ_Ad9U_fWr38GaAQ1oFAhT8ds245v7Q',
          'user-test-6db45fe7-6b2a-456f-9f53-0e2d2ebb320c',
          JSON.stringify(JSON.parse(JSON.stringify(user)))
        )
      ).rejects.toThrow('Error 500: Internal Database Error');
      expect(axios.put).toHaveBeenCalledWith(
        '/users/user-test-6db45fe7-6b2a-456f-9f53-0e2d2ebb320c',
        '{"id":5678,"email":"test3r@testy.com","enable":true,"role":"user","userId":"user-test-6db45fe7-6b2a-456f-9f53-0e2d2ebb320c"}'
      );
    });
    test('edit - missing email', async () => {
      const user = {
        id: 5678,
        enable: true,
        role: 'user',
        userId: 'user-test-6db45fe7-6b2a-456f-9f53-0e2d2ebb320c',
      };

      axios.put.mockResolvedValueOnce({
        status: 400,
        data: { Error: 'Required Parameters Missing' },
      });

      await expect(
        User.edit(user.userId, JSON.stringify(JSON.parse(JSON.stringify(user))))
      ).rejects.toThrow('Error 400: Required Parameters Missing');
      expect(axios.put).toHaveBeenCalledWith(`/users/${JSON.stringify(user)}`, undefined);
    });

    test('edit - missing enable', async () => {
      const user = {
        id: 5678,
        email: 'test3r@testy.com',
        role: 'user',
        userId: 'user-test-6db45fe7-6b2a-456f-9f53-0e2d2ebb320c',
      };

      axios.put.mockResolvedValueOnce({
        status: 400,
        data: { Error: 'Required Parameters Missing' },
      });

      await expect(
        User.edit(user.userId, JSON.stringify(JSON.parse(JSON.stringify(user))))
      ).rejects.toThrow('Error 400: Required Parameters Missing');
      expect(axios.put).toHaveBeenCalledWith(`/users/${JSON.stringify(user)}`, undefined);
    });

    test('edit - missing role', async () => {
      const user = {
        id: 5678,
        email: 'test3r@testy.com',
        enable: true,
        userId: 'user-test-6db45fe7-6b2a-456f-9f53-0e2d2ebb320c',
      };

      axios.put.mockResolvedValueOnce({
        status: 400,
        data: { Error: 'Required Parameters Missing' },
      });

      await expect(
        User.edit(user.userId, JSON.stringify(JSON.parse(JSON.stringify(user))))
      ).rejects.toThrow('Error 400: Required Parameters Missing');
      expect(axios.put).toHaveBeenCalledWith(`/users/${JSON.stringify(user)}`, undefined);
    });

    describe('delete tests', () => {
      test('delete - valid delete', async () => {
        const user = {
          id: 4567,
          email: 'barb26@example.com',
          enable: true,
          role: 'admin',
          userId: 'user-test-6db45fe7-6b2a-456f-9f53-0e2d2ebb320c',
        };
        axios.delete.mockResolvedValueOnce({
          data: user,
          status: 200,
        });
        const result = await User.deleteUser(
          'mZAYn5aLEqKUlZ_Ad9U_fWr38GaAQ1oFAhT8ds245v7Q',
          'user-test-6db45fe7-6b2a-456f-9f53-0e2d2ebb320c'
        );

        expect(axios.delete).toHaveBeenCalledWith(
          'users/user-test-6db45fe7-6b2a-456f-9f53-0e2d2ebb320c'
        );
        expect(result.status).toEqual(200);
      });

      test('delete - Required Parameters Missing', async () => {
        axios.delete.mockResolvedValueOnce({
          status: 400,
          data: { Error: 'Required Parameters Missing' },
        });

        await expect(
          User.deleteUser('mZAYn5aLEqKUlZ_Ad9U_fWr38GaAQ1oFAhT8ds245v7Q', undefined)
        ).rejects.toThrow('Error 400: Required Parameters Missing');
        expect(axios.delete).toHaveBeenCalledWith('users/' + undefined);
      });
    });
  });
});
