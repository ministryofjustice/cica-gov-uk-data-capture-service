'use strict';

const http = require('http');
const createMessageBusCaller = require('./index');

const simpleServer = http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/vnd.api+json');

    if (req.method === 'GET') {
        res.end('{"get_test": "success"}');
    }

    if (req.method === 'POST') {
        let reqBody = '';

        req.on('data', chunk => {
            reqBody += chunk;
        });

        req.on('end', () => {
            res.end(`{"post_test": ${reqBody}}`);
        });
    }
});

describe('Message bus service', () => {
    beforeAll(() => {
        simpleServer.listen(8125);
    });

    afterAll(() => {
        simpleServer.close();
    });
    describe('createMessageBusCaller', () => {
        it('Should call message bus', async () => {
            const mockLogger = {info: jest.fn()};

            const options = {
                logger: mockLogger,
                url: `http://127.0.0.1:8125/api/message/?destination=queue://mock-queue`
            };

            const messageBusCaller = createMessageBusCaller(options);

            const response = await messageBusCaller.post('SubmissionQueue', {
                applicationId: '0ddd90e9-b2a7-449e-80a5-26a2f8c98fd0'
            });

            expect(response.body).toEqual(
                '{"post_test": "{"applicationId":"0ddd90e9-b2a7-449e-80a5-26a2f8c98fd0"}"}'
            );
        });
    });
});
