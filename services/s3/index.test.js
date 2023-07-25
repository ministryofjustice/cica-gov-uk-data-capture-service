'use strict';

const {mockClient} = require('aws-sdk-client-mock');
const {S3Client} = require('@aws-sdk/client-s3');
const createS3Service = require('./index.js');

const mockLogger = {
    info: jest.fn(),
    error: jest.fn()
};

const options = {logger: mockLogger};

describe('S3 Service', () => {
    const testKeyName = 'test';
    const s3Service = createS3Service(options);
    const s3ClientMock = mockClient(S3Client);

    beforeEach(() => {
        s3ClientMock.reset();
    });

    it('Should successfully send a message to the s3 bucket', async () => {
        const testJsonObj = {Test: 'foo', Test2: 'bar'};
        const bucketName = 'bucket';
        await s3Service.uploadFile(testJsonObj, bucketName, testKeyName, 'application/json');
        expect(s3ClientMock.call(0).args[0].input).toEqual({
            Body: JSON.stringify(testJsonObj),
            Bucket: 'bucket',
            Key: 'test',
            contentType: 'application/json'
        });
    });

    it('Should error gracefully', async () => {
        const wrongTestPayload = 9007199254740991n;
        const wrongBucketName = 'foo';
        await expect(() =>
            s3Service.uploadFile(wrongTestPayload, wrongBucketName, testKeyName, 'application/json')
        ).rejects.toThrowError(
            'S3 upload failed: TypeError: Do not know how to serialize a BigInt'
        );
    });
});
