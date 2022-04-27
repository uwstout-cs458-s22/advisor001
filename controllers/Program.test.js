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
});
