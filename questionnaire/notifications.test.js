'use strict';

const VError = require('verror');
let getQuestionnaireResponse = require('./test-fixtures/res/get_questionnaire.js');

// mock the DAL db integration
jest.doMock('./questionnaire-dal.js', () =>
    // return a modified factory function, that returns an object with a method, that returns a valid created response
    jest.fn(() => ({
        createQuestionnaire: () => {},
        getQuestionnaire: questionnaireId => {
            // confirmation method is email.
            if (questionnaireId === 'f4cddbd1-632e-4212-bc4e-debc32e50319') {
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
                        'case-reference': '21\\123456'
                    }
                };
                getQuestionnaireResponse.meta.onComplete.tasks.sendEmail.l10n.translations[0].resources = {
                    ...getQuestionnaireResponse.meta.onComplete.tasks.sendEmail.l10n.translations[0]
                        .resources,
                    subject: 'Email subject - ||/answers/system/case-reference||',
                    'subject_someone-else':
                        'Email subject - someone-else - ||/answers/system/case-reference||',
                    body: 'Email body - ||/answers/system/case-reference||',
                    'body_someone-else':
                        'Email body - someone-else - ||/answers/system/case-reference||'
                };
                getQuestionnaireResponse.meta.onComplete.tasks.sendSms.l10n.translations[0].resources = {
                    ...getQuestionnaireResponse.meta.onComplete.tasks.sendSms.l10n.translations[0]
                        .resources,
                    body: 'SMS body - ||/answers/system/case-reference||',
                    'body_someone-else':
                        'SMS body - someone-else - ||/answers/system/case-reference||'
                };
                return getQuestionnaireResponse;
            }
            // confirmation method is SMS.
            if (questionnaireId === 'e4522347-dfd3-41d8-a1ad-7119fe92cda5') {
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
                        'case-reference': '21\\123456'
                    }
                };
                getQuestionnaireResponse.meta.onComplete.tasks.sendEmail.l10n.translations[0].resources = {
                    ...getQuestionnaireResponse.meta.onComplete.tasks.sendEmail.l10n.translations[0]
                        .resources,
                    subject: 'Email subject - ||/answers/system/case-reference||',
                    'subject_someone-else':
                        'Email subject - someone-else - ||/answers/system/case-reference||',
                    body: 'Email body - ||/answers/system/case-reference||',
                    'body_someone-else':
                        'Email body - someone-else - ||/answers/system/case-reference||'
                };
                getQuestionnaireResponse.meta.onComplete.tasks.sendSms.l10n.translations[0].resources = {
                    ...getQuestionnaireResponse.meta.onComplete.tasks.sendSms.l10n.translations[0]
                        .resources,
                    body: 'SMS body - ||/answers/system/case-reference||',
                    'body_someone-else':
                        'SMS body - someone-else - ||/answers/system/case-reference||'
                };
                return getQuestionnaireResponse;
            }
            // confirmation method is "none".
            if (questionnaireId === 'b0c37994-9c62-40f5-bc90-c26cc7ac9d13') {
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
                getQuestionnaireResponse.meta.onComplete.tasks.sendEmail.l10n.translations[0].resources = {
                    ...getQuestionnaireResponse.meta.onComplete.tasks.sendEmail.l10n.translations[0]
                        .resources,
                    subject: 'Email subject - ||/answers/system/case-reference||',
                    'subject_someone-else':
                        'Email subject - someone-else - ||/answers/system/case-reference||',
                    body: 'Email body - ||/answers/system/case-reference||',
                    'body_someone-else':
                        'Email body - someone-else - ||/answers/system/case-reference||'
                };
                getQuestionnaireResponse.meta.onComplete.tasks.sendSms.l10n.translations[0].resources = {
                    ...getQuestionnaireResponse.meta.onComplete.tasks.sendSms.l10n.translations[0]
                        .resources,
                    body: 'SMS body - ||/answers/system/case-reference||',
                    'body_someone-else':
                        'SMS body - someone-else - ||/answers/system/case-reference||'
                };
                return getQuestionnaireResponse;
            }

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
    describe('Send confirmation notification', () => {
        it('should configure options for an email', async () => {
            const questionnaireService = createQuestionnaireService();
            const response = await questionnaireService.sendConfirmationNotification(
                'f4cddbd1-632e-4212-bc4e-debc32e50319'
            );
            expect(response.emailAddress).toBe('somebody@email.com');
            expect(response).not.toHaveProperty('phoneNumber');
            expect(response.templateId).toBe('3948448e-0fa0-4f39-8c65-58b1aea7cec0');
            expect(response.reference).toBe(null);
            expect(response.personalisation.subject).toBe('Email subject - 21\\123456');
            expect(response.personalisation.body).toBe('Email body - 21\\123456');
        });
        it('should configure options for an SMS', async () => {
            const questionnaireService = createQuestionnaireService();
            const response = await questionnaireService.sendConfirmationNotification(
                'e4522347-dfd3-41d8-a1ad-7119fe92cda5'
            );
            expect(response).not.toHaveProperty('emailAddress');
            expect(response.phoneNumber).toBe('07701234567');
            expect(response.templateId).toBe('4d09e5f2-a78c-4c79-9dfe-47ac722da5a2');
            expect(response.reference).toBe(null);
            expect(response.personalisation.body).toBe('SMS body - 21\\123456');
        });
        it('should NOT configure options for an anything', async () => {
            const questionnaireService = createQuestionnaireService();
            const response = await questionnaireService.sendConfirmationNotification(
                'b0c37994-9c62-40f5-bc90-c26cc7ac9d13'
            );
            expect(response).toBe(false);
        });
        it('should send an email', async () => {
            const questionnaireService = createQuestionnaireService();
            await questionnaireService.sendConfirmationNotification(
                'f4cddbd1-632e-4212-bc4e-debc32e50319'
            );
            expect(mockSendEmail).toHaveBeenCalledTimes(1);
        });
        it('should send an SMS', async () => {
            const questionnaireService = createQuestionnaireService();
            await questionnaireService.sendConfirmationNotification(
                'e4522347-dfd3-41d8-a1ad-7119fe92cda5'
            );
            expect(mockSendSms).toHaveBeenCalledTimes(1);
        });
        it('should NOT send anything', async () => {
            const questionnaireService = createQuestionnaireService();
            await questionnaireService.sendConfirmationNotification(
                'b0c37994-9c62-40f5-bc90-c26cc7ac9d13'
            );
            expect(mockSendSms).not.toHaveBeenCalled();
            expect(mockSendEmail).not.toHaveBeenCalled();
        });
    });
});
