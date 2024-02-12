/* eslint-disable global-require */
/* eslint-disable no-shadow */

'use strict';

const updateOwnerSession = require('.');

let ownerAnswers;
const oneMinuteBefore = '2023-12-31T23:59:00.000Z';
const thirtyOneMinutesBefore = '2023-12-31T23:29:00.000Z';

beforeEach(() => {
    jest.useFakeTimers('modern');
    jest.setSystemTime(new Date(2024, 0, 1));

    ownerAnswers = {
        'owner-id': 'urn:uuid:f81d4fae-7dec-11d0-a765-00a0c91e6bf6',
        'is-authenticated': false,
        'session-time': 0,
        'session-number': 1
    };
});

afterAll(() => {
    jest.useRealTimers();
});

describe('updateOwnerSessionInfo', () => {
    describe('Time since last interaction is less than session duration', () => {
        it('Should update the session-time but not the session-number', () => {
            const actual = updateOwnerSession(ownerAnswers, oneMinuteBefore);

            expect(actual).toMatchObject({
                ownerAnswers: {
                    'owner-id': 'urn:uuid:f81d4fae-7dec-11d0-a765-00a0c91e6bf6',
                    'is-authenticated': false,
                    'session-time': 60000,
                    'session-number': 1
                },
                sessionUpdateTimestamp: new Date('2024-01-01T00:00:00.000Z')
            });
        });
    });

    describe('Time since last interaction is greater than session duration', () => {
        it('Should update the session-number but not the session-time', () => {
            const actual = updateOwnerSession(ownerAnswers, thirtyOneMinutesBefore);

            expect(actual).toMatchObject({
                ownerAnswers: {
                    'owner-id': 'urn:uuid:f81d4fae-7dec-11d0-a765-00a0c91e6bf6',
                    'is-authenticated': false,
                    'session-time': 0,
                    'session-number': 2
                },
                sessionUpdateTimestamp: new Date('2024-01-01T00:00:00.000Z')
            });
        });
    });
});
