'use strict';

const createNotifyService = require('./index');

describe.skip('Notify service', () => {
    const DUMMY_MOBILE_NUMBER_IN_USE = '07700900999';
    const INVALID_MOBILE_NUMBER = 'abc';
    const DUMMY_CASE_REFERENCE = '21\\456789';
    const SIMULATE_REQUEST_ERROR = '07700901000';
    const mockNotifyClient = {
        sendSms: async (templateId, phoneNumber) => {
            if (phoneNumber === DUMMY_MOBILE_NUMBER_IN_USE) {
                const apiSuccessResponse = {
                    data: {
                        id: 'bfb50d92-100d-4b8b-b559-14fa3b091cda'
                    }
                };

                return apiSuccessResponse;
            }

            if (phoneNumber === INVALID_MOBILE_NUMBER) {
                const apiErrorResponse = {
                    response: {
                        data: {
                            errors: [
                                {
                                    error: 'ValidationError',
                                    message: 'phone_number Must not contain letters or symbols'
                                }
                            ],
                            status_code: 400
                        }
                    }
                };

                throw apiErrorResponse;
            }

            if (phoneNumber === SIMULATE_REQUEST_ERROR) {
                const requestError = {
                    code: 'ERR_TLS_CERT_ALTNAME_INVALID',
                    message:
                        "Hostname/IP does not match certificate's altnames: Host: api.notifications.service.gov.uk. is not in the cert's altnames: DNS:*.cica.gov.uk, DNS:cica.gov.uk"
                };

                throw requestError;
            }

            throw Error('Issue with "Notify Client" mock.');
        }
    };

    describe.skip('Given a successful sms send request', () => {
        it('should return the sms send request id', async () => {
            const mockLogger = {error: () => {}};
            const rxUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            const notifyService = createNotifyService({
                logger: mockLogger,
                notifyClient: mockNotifyClient
            });
            const smsSendRequest = await notifyService.sendSms({
                templateId: '3c847bb8-957a-4bba-9fad-090657bb5c71',
                phoneNumber: DUMMY_MOBILE_NUMBER_IN_USE,
                personalisation: {
                    caseReference: DUMMY_CASE_REFERENCE
                }
            });

            expect(smsSendRequest.id).toMatch(rxUUID);
        });
    });

    describe.skip('Given an issue with an sms send request', () => {
        it('should log an api error', async () => {
            const mockLogger = {error: jest.fn()};
            const notifyService = createNotifyService({
                logger: mockLogger,
                notifyClient: mockNotifyClient
            });

            await notifyService.sendSms({
                templateId: '3c847bb8-957a-4bba-9fad-090657bb5c71',
                phoneNumber: INVALID_MOBILE_NUMBER,
                personalisation: {
                    caseReference: DUMMY_CASE_REFERENCE
                }
            });

            expect(mockLogger.error).toHaveBeenCalledWith(
                expect.arrayContaining([
                    expect.objectContaining({
                        error: expect.any(String),
                        message: expect.any(String)
                    })
                ]),
                'SMS SEND FAILURE'
            );
        });

        it('should log a request error', async () => {
            const mockLogger = {error: jest.fn()};
            const notifyService = createNotifyService({
                logger: mockLogger,
                notifyClient: mockNotifyClient
            });

            await notifyService.sendSms({
                templateId: '3c847bb8-957a-4bba-9fad-090657bb5c71',
                phoneNumber: SIMULATE_REQUEST_ERROR,
                personalisation: {
                    caseReference: DUMMY_CASE_REFERENCE
                }
            });

            expect(mockLogger.error).toHaveBeenCalledWith(
                expect.arrayContaining([
                    expect.objectContaining({
                        error: expect.any(String),
                        message: expect.any(String)
                    })
                ]),
                'SMS SEND FAILURE'
            );
        });

        it('should return an undefined smsSendRequest', async () => {
            const mockLogger = {error: jest.fn()};
            const notifyService = createNotifyService({
                logger: mockLogger,
                notifyClient: mockNotifyClient
            });

            const smsSendRequest = await notifyService.sendSms({
                templateId: '3c847bb8-957a-4bba-9fad-090657bb5c71',
                phoneNumber: INVALID_MOBILE_NUMBER,
                personalisation: {
                    caseReference: DUMMY_CASE_REFERENCE
                }
            });

            expect(smsSendRequest).toEqual(undefined);
        });
    });
});
