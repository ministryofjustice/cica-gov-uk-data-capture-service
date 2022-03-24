'use strict';

const VError = require('verror');
let getQuestionnaireResponse = require('./test-fixtures/res/get_questionnaire.js');

const selfEmailConfirmationQuestionnaireId = 'f4cddbd1-632e-4212-bc4e-debc32e50319';
const selfSmsConfirmationQuestionnaireId = 'e4522347-dfd3-41d8-a1ad-7119fe92cda5';
const selfNoConfirmationQuestionnaireId = 'b0c37994-9c62-40f5-bc90-c26cc7ac9d13';
const minorEmailConfirmationQuestionnaireId = 'a4cddbd1-632e-4212-bc4e-debc32e50319';
const minorSmsConfirmationQuestionnaireId = 'c4cddbd1-632e-4212-bc4e-debc32e50319';

// the following contain invalid template structures, should be handled via q-validator and q-schema
const noOnCompleteThrowsErrorQId = 'z4cddbd1-632e-4212-bc4e-debc32e50319';
const noOnCompleteTasksThrowsErrorQId = 'y4cddbd1-632e-4212-bc4e-debc32e50319';
const noOnCompleteTasksSendEmailThrowsErrorQId = 'x4cddbd1-632e-4212-bc4e-debc32e50319';

// mock the DAL db integration
jest.doMock('./questionnaire-dal.js', () =>
    // return a modified factory function, that returns an object with a method, that returns a valid created response
    jest.fn(() => ({
        createQuestionnaire: () => {},
        getQuestionnaire: questionnaireId => {
            // confirmation method is sms.
            // someone_else
            if (questionnaireId === minorSmsConfirmationQuestionnaireId) {
                getQuestionnaireResponse.answers = {
                    ...getQuestionnaireResponse.answers,
                    'p-applicant-who-are-you-applying-for': {
                        'q-applicant-who-are-you-applying-for': 'someone-else'
                    },
                    'p-mainapplicant-confirmation-method': {
                        'q-mainapplicant-confirmation-method': 'text',
                        'q-mainapplicant-enter-your-telephone-number': '07701234568'
                    },
                    system: {
                        'case-reference': '44\\444444'
                    }
                };
                getQuestionnaireResponse.meta.onComplete.tasks.sendSms.l10n.translations[0].resources = {
                    ...getQuestionnaireResponse.meta.onComplete.tasks.sendSms.l10n.translations[0]
                        .resources,
                    templateId: '0905cf29-054a-4650-9044-a58768fd9381',
                    'templateId_someone-else': 'c2f8f580-3214-4144-bab1-1bbb30863deb',
                    phoneNumber:
                        '||/answers/p-applicant-confirmation-method/q-applicant-enter-your-telephone-number||',
                    'phoneNumber_someone-else':
                        '||/answers/p-mainapplicant-confirmation-method/q-mainapplicant-enter-your-telephone-number||'
                };
                return getQuestionnaireResponse;
            }
            // confirmation method is email.
            // someone_else
            if (questionnaireId === minorEmailConfirmationQuestionnaireId) {
                getQuestionnaireResponse.answers = {
                    ...getQuestionnaireResponse.answers,
                    'p-applicant-who-are-you-applying-for': {
                        'q-applicant-who-are-you-applying-for': 'someone-else'
                    },
                    'p-mainapplicant-confirmation-method': {
                        'q-mainapplicant-confirmation-method': 'email',
                        'q-mainapplicant-enter-your-email-address': 'someone.for.minor@email.com'
                    },
                    system: {
                        'case-reference': '22\\222222'
                    }
                };
                getQuestionnaireResponse.meta.onComplete.tasks.sendEmail.l10n.translations[0].resources = {
                    ...getQuestionnaireResponse.meta.onComplete.tasks.sendEmail.l10n.translations[0]
                        .resources,
                    templateId: '0a8224c3-9600-4d14-9491-72609dc1dece',
                    'templateId_someone-else': 'b4b08849-c56f-4e82-9f8a-14ab2a50f607',
                    emailAddress:
                        '||/answers/p-applicant-confirmation-method/q-applicant-enter-your-email-address||',
                    'emailAddress_someone-else':
                        '||/answers/p-mainapplicant-confirmation-method/q-mainapplicant-enter-your-email-address||'
                };
                return getQuestionnaireResponse;
            }
            // self email
            if (questionnaireId === selfEmailConfirmationQuestionnaireId) {
                getQuestionnaireResponse.answers = {
                    ...getQuestionnaireResponse.answers,
                    'p-applicant-who-are-you-applying-for': {
                        'q-applicant-who-are-you-applying-for': 'myself'
                    },
                    'p-applicant-confirmation-method': {
                        'q-applicant-confirmation-method': 'email',
                        'q-applicant-enter-your-email-address': 'somebody@email.com'
                    },
                    system: {
                        'case-reference': '11\\111111'
                    }
                };
                getQuestionnaireResponse.meta.onComplete.tasks.sendEmail.l10n.translations[0].resources = {
                    ...getQuestionnaireResponse.meta.onComplete.tasks.sendEmail.l10n.translations[0]
                        .resources,
                    templateId: '0a8224c3-9600-4d14-9491-72609dc1dece',
                    'templateId_someone-else': 'b4b08849-c56f-4e82-9f8a-14ab2a50f607',
                    emailAddress:
                        '||/answers/p-applicant-confirmation-method/q-applicant-enter-your-email-address||',
                    'emailAddress_someone-else':
                        '||/answers/p-mainapplicant-confirmation-method/q-mainapplicant-enter-your-email-address||'
                };
                return getQuestionnaireResponse;
            }
            // confirmation method is SMS.
            if (questionnaireId === selfSmsConfirmationQuestionnaireId) {
                getQuestionnaireResponse.answers = {
                    ...getQuestionnaireResponse.answers,
                    'p-applicant-who-are-you-applying-for': {
                        'q-applicant-who-are-you-applying-for': 'myself'
                    },
                    'p-applicant-confirmation-method': {
                        'q-applicant-confirmation-method': 'text',
                        'q-applicant-enter-your-telephone-number': '07701234567'
                    },
                    system: {
                        'case-reference': '33\\333333'
                    }
                };
                getQuestionnaireResponse.meta.onComplete.tasks.sendSms.l10n.translations[0].resources = {
                    ...getQuestionnaireResponse.meta.onComplete.tasks.sendSms.l10n.translations[0]
                        .resources,
                    templateId: '0905cf29-054a-4650-9044-a58768fd9381',
                    'templateId_someone-else': 'c2f8f580-3214-4144-bab1-1bbb30863deb',
                    phoneNumber:
                        '||/answers/p-applicant-confirmation-method/q-applicant-enter-your-telephone-number||',
                    'phoneNumber_someone-else':
                        '||/answers/p-mainapplicant-confirmation-method/q-mainapplicant-enter-your-telephone-number||'
                };
                return getQuestionnaireResponse;
            }
            // confirmation method is "none".
            if (questionnaireId === selfNoConfirmationQuestionnaireId) {
                getQuestionnaireResponse.answers = {
                    ...getQuestionnaireResponse.answers,
                    'p-applicant-who-are-you-applying-for': {
                        'q-applicant-who-are-you-applying-for': 'myself'
                    },
                    'p-applicant-confirmation-method': {
                        'q-applicant-confirmation-method': 'none'
                    },
                    system: {
                        'case-reference': '21\\123456'
                    }
                };
                return getQuestionnaireResponse;
            }
            // begin invalid template structures
            if (questionnaireId === noOnCompleteThrowsErrorQId) {
                getQuestionnaireResponse.meta = {};
                return getQuestionnaireResponse;
            }

            if (questionnaireId === noOnCompleteTasksThrowsErrorQId) {
                getQuestionnaireResponse.meta.onComplete = {};
                return getQuestionnaireResponse;
            }

            if (questionnaireId === noOnCompleteTasksSendEmailThrowsErrorQId) {
                getQuestionnaireResponse.meta.onComplete.tasks = {};
                return getQuestionnaireResponse;
            }

            // end invalid template structures
            throw new VError(
                {
                    name: 'ResourceNotFound'
                },
                `Questionnaire "${questionnaireId}" not found`
            );
        }
    }))
);
const mockSendSms = jest.fn();
const mockSendEmail = jest.fn();
jest.doMock('../services/notify/index.js', () =>
    jest.fn(() => ({
        sendSms: mockSendSms,
        sendEmail: mockSendEmail
    }))
);

const createQuestionnaireService = require('./questionnaire-service');

beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
});
afterEach(() => {
    // eslint-disable-next-line global-require
    getQuestionnaireResponse = require('./test-fixtures/res/get_questionnaire.js');
});

describe('Notifications', () => {
    describe('Send confirmation notification for self journeys', () => {
        it('should configure options for an email', async () => {
            const questionnaireService = createQuestionnaireService();
            const response = await questionnaireService.sendConfirmationNotification(
                selfEmailConfirmationQuestionnaireId
            );
            expect(response.emailAddress).toBe('somebody@email.com');
            expect(response).not.toHaveProperty('phoneNumber');
            expect(response.templateId).toBe('0a8224c3-9600-4d14-9491-72609dc1dece');
            expect(response.reference).toBe(null);
            expect(response.personalisation.caseReference).toBe('11\\111111');
        });
        it('should configure options for an SMS', async () => {
            const questionnaireService = createQuestionnaireService();
            const response = await questionnaireService.sendConfirmationNotification(
                selfSmsConfirmationQuestionnaireId
            );
            expect(response).not.toHaveProperty('emailAddress');
            expect(response.phoneNumber).toBe('07701234567');
            expect(response.templateId).toBe('0905cf29-054a-4650-9044-a58768fd9381');
            expect(response.reference).toBe(null);
            expect(response.personalisation.caseReference).toBe('33\\333333');
        });
        it('should NOT configure options for an anything', async () => {
            const questionnaireService = createQuestionnaireService();
            const response = await questionnaireService.sendConfirmationNotification(
                selfNoConfirmationQuestionnaireId
            );
            expect(response).toBe(false);
        });
        it('should send an email', async () => {
            const questionnaireService = createQuestionnaireService();
            await questionnaireService.sendConfirmationNotification(
                selfEmailConfirmationQuestionnaireId
            );
            expect(mockSendEmail).toHaveBeenCalledTimes(1);
        });
        it('should send an SMS', async () => {
            const questionnaireService = createQuestionnaireService();
            await questionnaireService.sendConfirmationNotification(
                selfSmsConfirmationQuestionnaireId
            );
            expect(mockSendSms).toHaveBeenCalledTimes(1);
        });
        it('should NOT send anything', async () => {
            const questionnaireService = createQuestionnaireService();
            await questionnaireService.sendConfirmationNotification(
                selfNoConfirmationQuestionnaireId
            );
            expect(mockSendSms).not.toHaveBeenCalled();
            expect(mockSendEmail).not.toHaveBeenCalled();
        });
    });
    describe('Send confirmation notification for minor journeys', () => {
        it('should configure options for an email', async () => {
            const questionnaireService = createQuestionnaireService();
            const response = await questionnaireService.sendConfirmationNotification(
                minorEmailConfirmationQuestionnaireId
            );
            expect(response.emailAddress).toBe('someone.for.minor@email.com');
            expect(response).not.toHaveProperty('phoneNumber');
            expect(response.reference).toBe(null);
            expect(response.personalisation.caseReference).toBe('22\\222222');
            expect(response.templateId).toBe('b4b08849-c56f-4e82-9f8a-14ab2a50f607');
        });
        it('should configure options for an SMS', async () => {
            const questionnaireService = createQuestionnaireService();
            const response = await questionnaireService.sendConfirmationNotification(
                minorSmsConfirmationQuestionnaireId
            );
            expect(response).not.toHaveProperty('emailAddress');
            expect(response.phoneNumber).toBe('07701234568');
            expect(response.templateId).toBe('c2f8f580-3214-4144-bab1-1bbb30863deb');
            expect(response.personalisation.caseReference).toBe('44\\444444');
            expect(response.reference).toBe(null);
        });
    });
    // these tests should really be handled by q-validator and q-schema changes.
    describe('error handling for send confirmation notification', () => {
        it('should throw an error if meta onComplete not defined  ', async () => {
            const mockLogger = {error: jest.fn()};
            const questionnaireService = createQuestionnaireService({logger: mockLogger});
            await questionnaireService.sendConfirmationNotification(noOnCompleteThrowsErrorQId);
            expect(mockSendSms).not.toHaveBeenCalled();
            expect(mockSendEmail).not.toHaveBeenCalled();
            const err = new TypeError("Cannot read property 'tasks' of undefined");
            expect(mockLogger.error).toHaveBeenCalledWith({err}, 'NOTIFICATION SENDING FAILED');
        });
        it('should throw an error if meta onComplete.tasks not defined  ', async () => {
            const mockLogger = {error: jest.fn()};
            const questionnaireService = createQuestionnaireService({logger: mockLogger});
            await questionnaireService.sendConfirmationNotification(
                noOnCompleteTasksThrowsErrorQId
            );
            expect(mockSendSms).not.toHaveBeenCalled();
            expect(mockSendEmail).not.toHaveBeenCalled();
            const err = new TypeError('Cannot convert undefined or null to object');
            expect(mockLogger.error).toHaveBeenCalledWith({err}, 'NOTIFICATION SENDING FAILED');
        });
        it('should throw an error if meta onComplete.tasks.sendEmail not defined  ', async () => {
            const mockLogger = {error: jest.fn()};
            const questionnaireService = createQuestionnaireService({logger: mockLogger});
            await questionnaireService.sendConfirmationNotification(
                noOnCompleteTasksSendEmailThrowsErrorQId
            );
            expect(mockSendSms).not.toHaveBeenCalled();
            expect(mockSendEmail).not.toHaveBeenCalled();
            const err = new TypeError("Cannot read property 'data' of undefined");
            expect(mockLogger.error).toHaveBeenCalledWith({err}, 'NOTIFICATION SENDING FAILED');
        });
    });
});
