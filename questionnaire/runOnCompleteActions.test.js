'use strict';

const notifySQS = 'dummy_notify_queue';

// TODO: These should live in q-router

jest.doMock('../services/sqs', () => {
    const notifyServiceMock = {
        send: jest.fn().mockResolvedValue({
            some: 'response'
        })
    };

    return () => notifyServiceMock;
});

jest.doMock('../services/sqs/legacy-sms-message-bus', () => {
    const notifyServiceMock = {
        sendSms: jest.fn().mockResolvedValue({
            some: 'response'
        })
    };

    return () => notifyServiceMock;
});

const mockedSqsService = require('../services/sqs')();
const mockedLegacyMessageBusService = require('../services/sqs/legacy-sms-message-bus')();
const createQuestionnaireService = require('./questionnaire-service');

describe('runOnCompleteActions', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Given a send email action', () => {
        it('should call the send email function with defined data', async () => {
            const questionnaireService = createQuestionnaireService();
            const actionData = {
                templateId: '47c7fc59-e657-4d10-b57e-2b3a59bd9bdf',
                emailAddress: 'foo@bar.com',
                personalisation: {
                    caseReference: '11/111111'
                },
                reference: null
            };
            const actionResults = await Promise.allSettled(
                await questionnaireService.runOnCompleteActions({
                    meta: {
                        onComplete: {
                            actions: [
                                {
                                    type: 'sendEmail',
                                    data: actionData
                                }
                            ]
                        }
                    }
                })
            );

            expect(actionResults).toEqual([{status: 'fulfilled', value: {some: 'response'}}]);
            expect(mockedSqsService.send).toHaveBeenCalledTimes(1);
            expect(mockedSqsService.send).toHaveBeenCalledWith(actionData, notifySQS);
        });
    });

    describe('Given a send sms action', () => {
        it('should call the send sms function with defined data', async () => {
            const questionnaireService = createQuestionnaireService();
            const actionData = {
                templateId: '47c7fc59-e657-4d10-b57e-2b3a59bd9bdf',
                phoneNumber: '07777777777',
                personalisation: {
                    caseReference: '11/111111'
                },
                reference: null
            };
            const actionResults = await Promise.allSettled(
                await questionnaireService.runOnCompleteActions({
                    meta: {
                        onComplete: {
                            actions: [
                                {
                                    type: 'sendSms',
                                    data: actionData
                                }
                            ]
                        }
                    }
                })
            );

            expect(actionResults).toEqual([{status: 'fulfilled', value: {some: 'response'}}]);
            expect(mockedLegacyMessageBusService.sendSms).toHaveBeenCalledTimes(1);
            expect(mockedLegacyMessageBusService.sendSms).toHaveBeenCalledWith(actionData);
        });
    });

    describe('Given multiple actions', () => {
        it('should run each action in parallel', async () => {
            const questionnaireService = createQuestionnaireService();
            const smsActionData = {
                templateId: 'ff10551c-9928-410a-a7be-5ba21297a132',
                phoneNumber: '07777777777',
                personalisation: {
                    caseReference: '11/111111'
                },
                reference: null
            };
            const emailActionData1 = {
                templateId: '0bdb9b24-5d1f-4c46-b706-bd7edcf3c87b',
                emailAddress: 'foo@bar.com',
                personalisation: {
                    caseReference: '11/111111'
                },
                reference: null
            };
            const emailActionData2 = {
                templateId: '83a376f2-6329-474a-a055-7510c0b7befd',
                emailAddress: 'foo@bar.com',
                personalisation: {
                    caseReference: '11/111111'
                },
                reference: null
            };
            const actionResults = await Promise.allSettled(
                await questionnaireService.runOnCompleteActions({
                    meta: {
                        onComplete: {
                            actions: [
                                {
                                    type: 'sendSms',
                                    data: smsActionData
                                },
                                {
                                    type: 'sendEmail',
                                    data: emailActionData1
                                },
                                {
                                    type: 'sendEmail',
                                    data: emailActionData2
                                }
                            ]
                        }
                    }
                })
            );

            expect(actionResults).toEqual([
                {status: 'fulfilled', value: {some: 'response'}},
                {status: 'fulfilled', value: {some: 'response'}},
                {status: 'fulfilled', value: {some: 'response'}}
            ]);
            expect(mockedSqsService.send).toHaveBeenCalledTimes(2);
            expect(mockedLegacyMessageBusService.sendSms).toHaveBeenCalledTimes(1);
            expect(mockedSqsService.send).toHaveBeenNthCalledWith(1, emailActionData1, notifySQS);
            expect(mockedSqsService.send).toHaveBeenNthCalledWith(2, emailActionData2, notifySQS);
            expect(mockedLegacyMessageBusService.sendSms).toHaveBeenCalledWith(smsActionData);
        });
    });

    describe('Given multiple actions where one or more fail', () => {
        it('should return rejected promises', async () => {
            const questionnaireService = createQuestionnaireService();
            const smsActionData = {
                templateId: 'ff10551c-9928-410a-a7be-5ba21297a132',
                phoneNumber: '07777777777',
                personalisation: {
                    caseReference: '11/111111'
                },
                reference: null
            };
            const emailActionData1 = {
                templateId: '0bdb9b24-5d1f-4c46-b706-bd7edcf3c87b',
                emailAddress: 'foo@bar.com',
                personalisation: {
                    caseReference: '11/111111'
                },
                reference: null
            };
            const emailActionData2 = {
                templateId: '83a376f2-6329-474a-a055-7510c0b7befd',
                emailAddress: 'foo@bar.com',
                personalisation: {
                    caseReference: '11/111111'
                },
                reference: null
            };

            mockedSqsService.send.mockRejectedValueOnce({
                some: 'error'
            });

            const actionResults = await Promise.allSettled(
                await questionnaireService.runOnCompleteActions({
                    meta: {
                        onComplete: {
                            actions: [
                                {
                                    type: 'sendSms',
                                    data: smsActionData
                                },
                                {
                                    type: 'sendEmail',
                                    data: emailActionData1
                                },
                                {
                                    type: 'sendEmail',
                                    data: emailActionData2
                                }
                            ]
                        }
                    }
                })
            );

            expect(actionResults).toEqual([
                {status: 'fulfilled', value: {some: 'response'}},
                {status: 'rejected', reason: {some: 'error'}},
                {status: 'fulfilled', value: {some: 'response'}}
            ]);
            expect(mockedLegacyMessageBusService.sendSms).toHaveBeenCalledTimes(1);
            expect(mockedSqsService.send).toHaveBeenCalledTimes(2);
            expect(mockedLegacyMessageBusService.sendSms).toHaveBeenCalledWith(smsActionData);
            expect(mockedSqsService.send).toHaveBeenNthCalledWith(1, emailActionData1, notifySQS);
            expect(mockedSqsService.send).toHaveBeenNthCalledWith(2, emailActionData2, notifySQS);
        });
    });
});

// TODO: These should be part of the template
const templates = require('./templates');

function setRole(role, answers) {
    if (role === 'deceased') {
        answers['p-applicant-fatal-claim'] = {
            'q-applicant-fatal-claim': true
        };

        return answers;
    }

    if (role === 'nonDeceased') {
        answers['p-applicant-fatal-claim'] = {
            'q-applicant-fatal-claim': false
        };

        return answers;
    }

    if (role === 'myself') {
        answers['p-applicant-who-are-you-applying-for'] = {
            'q-applicant-who-are-you-applying-for': 'myself'
        };

        return answers;
    }

    if (role === 'mainapplicant') {
        answers['p-mainapplicant-parent'] = {
            'q-mainapplicant-parent': true
        };

        return answers;
    }

    if (role === 'child') {
        answers['p-applicant-are-you-18-or-over'] = {
            'q-applicant-are-you-18-or-over': false
        };

        return answers;
    }

    if (role === 'adult') {
        answers['p-applicant-are-you-18-or-over'] = {
            'q-applicant-are-you-18-or-over': true
        };

        return answers;
    }

    if (role === 'incapable') {
        answers['p-applicant-can-handle-affairs'] = {
            'q-applicant-capable': false
        };

        return answers;
    }

    if (role === 'rep.applicant:adult:capable') {
        answers['p-applicant-who-are-you-applying-for'] = {
            'q-applicant-who-are-you-applying-for': 'someone-else'
        };
        answers['p-applicant-are-you-18-or-over'] = {
            'q-applicant-are-you-18-or-over': true
        };
        answers['p-applicant-can-handle-affairs'] = {
            'q-applicant-capable': true
        };

        return answers;
    }

    if (role === 'rep.mainapplicant.applicant:adult:incapable') {
        answers['p-applicant-who-are-you-applying-for'] = {
            'q-applicant-who-are-you-applying-for': 'someone-else'
        };
        answers['p-applicant-are-you-18-or-over'] = {
            'q-applicant-are-you-18-or-over': true
        };
        answers['p--has-legal-authority'] = {
            'q--has-legal-authority': false
        };
        answers['p--represents-legal-authority'] = {
            'q--represents-legal-authority': true
        };

        return answers;
    }

    if (role === 'rep.mainapplicant.applicant:child') {
        answers['p-applicant-who-are-you-applying-for'] = {
            'q-applicant-who-are-you-applying-for': 'someone-else'
        };
        answers['p-applicant-are-you-18-or-over'] = {
            'q-applicant-are-you-18-or-over': false
        };
        answers['p-mainapplicant-parent'] = {
            'q-mainapplicant-parent': false
        };
        answers['p--has-legal-authority'] = {
            'q--has-legal-authority': false
        };

        return answers;
    }

    if (role === 'rep:no-legal-authority.applicant') {
        answers['p-applicant-who-are-you-applying-for'] = {
            'q-applicant-who-are-you-applying-for': 'someone-else'
        };
        answers['p-applicant-are-you-18-or-over'] = {
            'q-applicant-are-you-18-or-over': true
        };
        answers['p--has-legal-authority'] = {
            'q--has-legal-authority': false
        };
        answers['p--represents-legal-authority'] = {
            'q--represents-legal-authority': false
        };

        return answers;
    }

    if (role === 'noauthority') {
        answers['p-applicant-are-you-18-or-over'] = {
            'q-applicant-are-you-18-or-over': true
        };
        answers['p-applicant-can-handle-affairs'] = {
            'q-applicant-capable': false
        };
        answers['p--has-legal-authority'] = {
            'q--has-legal-authority': false
        };
        answers['p--represents-legal-authority'] = {
            'q--represents-legal-authority': false
        };

        return answers;
    }

    throw Error(`Role ${role} not found`);
}

describe('template', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Given a successfully submitted application', () => {
        describe('With "email" as the contact preference', () => {
            describe('And user role is applicant', () => {
                it.each([
                    {
                        roles: ['myself', 'adult', 'nonDeceased'],
                        templateId: '5d207246-99d7-4bb9-83e1-75a7847bb8fd'
                    },
                    {
                        roles: ['myself', 'adult', 'deceased'],
                        templateId: 'aad20568-2726-4d9f-b60c-41257e419c88'
                    }
                ])('should send a confirmation email to $roles', async ({roles, templateId}) => {
                    const application = templates['sexual-assault'](
                        '54fbbaaf-e199-47ce-a450-1813be6a5f5c'
                    );
                    application.answers = {
                        'p-applicant-confirmation-method': {
                            'q-applicant-confirmation-method': 'email',
                            'q-applicant-enter-your-email-address': 'foo@e2ad804c872c.gov.uk'
                        },
                        system: {
                            'case-reference': '11/111111'
                        }
                    };

                    roles.forEach(role => setRole(role, application.answers));
                    const questionnaireService = createQuestionnaireService();
                    const actionResults = await Promise.allSettled(
                        await questionnaireService.runOnCompleteActions(application)
                    );
                    const expectedActionData = {
                        templateId,
                        emailAddress: 'foo@e2ad804c872c.gov.uk',
                        personalisation: {
                            caseReference: '11/111111'
                        },
                        reference: null
                    };

                    expect(actionResults).toEqual([
                        {status: 'fulfilled', value: {some: 'response'}}
                    ]);
                    expect(mockedSqsService.send).toHaveBeenCalledTimes(1);
                    expect(mockedSqsService.send).toHaveBeenCalledWith(
                        expectedActionData,
                        notifySQS
                    );
                });
            });

            describe('And user role is mainapplicant', () => {
                it.each([
                    {
                        roles: ['mainapplicant', 'child', 'nonDeceased'],
                        templateId: '668fac4a-3e1c-40e7-b7ac-090a410fbb03'
                    },
                    {
                        roles: ['mainapplicant', 'child', 'deceased'],
                        templateId: '58708020-d8a5-4d96-b56f-91f5c4c4c590'
                    },
                    {
                        roles: ['mainapplicant', 'adult', 'incapable', 'nonDeceased'],
                        templateId: '80843f77-a68c-4d7a-b3c9-42fd0de271c2'
                    },
                    {
                        roles: ['mainapplicant', 'adult', 'incapable', 'deceased'],
                        templateId: '21f4d5de-a219-47c8-aa3e-e5489b0fc3ed'
                    }
                ])('should send a confirmation email to $roles', async ({roles, templateId}) => {
                    const application = templates['sexual-assault'](
                        '54fbbaaf-e199-47ce-a450-1813be6a5f5c'
                    );

                    application.answers = {
                        'p-mainapplicant-confirmation-method': {
                            'q-mainapplicant-confirmation-method': 'email',
                            'q-mainapplicant-enter-your-email-address': 'foo@e2ad804c872c.gov.uk'
                        },
                        system: {
                            'case-reference': '11/111111'
                        }
                    };
                    roles.forEach(role => setRole(role, application.answers));

                    const questionnaireService = createQuestionnaireService();
                    const actionResults = await Promise.allSettled(
                        await questionnaireService.runOnCompleteActions(application)
                    );
                    const expectedActionData = {
                        templateId,
                        emailAddress: 'foo@e2ad804c872c.gov.uk',
                        personalisation: {
                            caseReference: '11/111111'
                        },
                        reference: null
                    };

                    expect(mockedSqsService.send).toHaveBeenNthCalledWith(
                        1,
                        expectedActionData,
                        notifySQS
                    );
                    expect(mockedSqsService.send).toHaveBeenCalledTimes(1);
                    expect(actionResults).toEqual([
                        {status: 'fulfilled', value: {some: 'response'}}
                    ]);
                });
            });

            describe('And user role is rep', () => {
                it.each([
                    {
                        roles: ['rep.applicant:adult:capable'],
                        templateId: 'b21f1aa7-cc16-41e7-8b8e-5c69e52f21f9'
                    },
                    {
                        roles: ['rep.mainapplicant.applicant:adult:incapable', 'incapable'],
                        templateId: 'a6583a82-51ca-4f8e-b8b8-cbca763dc59a'
                    },
                    {
                        roles: ['rep.mainapplicant.applicant:child'],
                        templateId: 'a0c7b011-b0df-4645-8ce3-6bd8f7905dfc'
                    },
                    {
                        roles: ['rep:no-legal-authority.applicant', 'noauthority'],
                        templateId: 'fb865d9c-37b1-4077-b519-aacfe42c9951'
                    }
                ])('should send a confirmation email to $roles', async ({roles, templateId}) => {
                    const application = templates['sexual-assault'](
                        '54fbbaaf-e199-47ce-a450-1813be6a5f5c'
                    );

                    application.answers = {
                        'p-rep-confirmation-method': {
                            'q-rep-confirmation-method': 'email',
                            'q-rep-email-address': 'foo@e2ad804c872c.gov.uk'
                        },
                        system: {
                            'case-reference': '11/111111'
                        }
                    };
                    roles.forEach(role => setRole(role, application.answers));

                    const questionnaireService = createQuestionnaireService();
                    const actionResults = await Promise.allSettled(
                        await questionnaireService.runOnCompleteActions(application)
                    );
                    const expectedActionData = {
                        templateId,
                        emailAddress: 'foo@e2ad804c872c.gov.uk',
                        personalisation: {
                            caseReference: '11/111111'
                        },
                        reference: null
                    };

                    expect(mockedSqsService.send).toHaveBeenNthCalledWith(
                        1,
                        expectedActionData,
                        notifySQS
                    );
                    expect(mockedSqsService.send).toHaveBeenCalledTimes(1);
                    expect(actionResults).toEqual([
                        {status: 'fulfilled', value: {some: 'response'}}
                    ]);
                });
            });
        });

        describe('With "sms" as the contact preference', () => {
            describe('And user role is applicant', () => {
                it.each([
                    {
                        roles: ['myself', 'adult', 'nonDeceased'],
                        templateId: '3f1a741b-20de-4b0d-b8e8-224098291beb'
                    },
                    {
                        roles: ['myself', 'adult', 'deceased'],
                        templateId: '46e66520-6e0a-412b-a509-18a09c8bfa35'
                    }
                ])('should send a confirmation sms to $roles', async ({roles, templateId}) => {
                    const application = templates['sexual-assault'](
                        '54fbbaaf-e199-47ce-a450-1813be6a5f5c'
                    );

                    application.answers = {
                        'p-applicant-confirmation-method': {
                            'q-applicant-confirmation-method': 'text',
                            'q-applicant-enter-your-telephone-number': '07700900000'
                        },
                        system: {
                            'case-reference': '11/111111'
                        }
                    };

                    roles.forEach(role => setRole(role, application.answers));
                    const questionnaireService = createQuestionnaireService();
                    const actionResults = await Promise.allSettled(
                        await questionnaireService.runOnCompleteActions(application)
                    );
                    const expectedActionData = {
                        templateId,
                        phoneNumber: '07700900000',
                        personalisation: {
                            caseReference: '11/111111'
                        },
                        reference: null
                    };

                    expect(actionResults).toEqual([
                        {status: 'fulfilled', value: {some: 'response'}}
                    ]);
                    expect(mockedLegacyMessageBusService.sendSms).toHaveBeenCalledTimes(1);
                    expect(mockedLegacyMessageBusService.sendSms).toHaveBeenCalledWith(
                        expectedActionData
                    );
                });
            });

            describe('And user role is mainapplicant', () => {
                it.each([
                    {
                        roles: ['mainapplicant', 'adult', 'incapable', 'nonDeceased'],
                        templateId: '3e625f9f-75c4-4903-818e-220829bfc2af'
                    },
                    {
                        roles: ['mainapplicant', 'adult', 'incapable', 'deceased'],
                        templateId: 'fe1997b8-ba0e-4c97-94f2-d4d350868596'
                    },
                    {
                        roles: ['mainapplicant', 'child', 'nonDeceased'],
                        templateId: 'd2185426-2177-4049-a5b1-b9c6b12e1a79'
                    },
                    {
                        roles: ['mainapplicant', 'child', 'deceased'],
                        templateId: 'c178-4f50-a7ca-5cb934dcb8b8'
                    }
                ])('should send a confirmation sms to $roles', async ({roles, templateId}) => {
                    const application = templates['sexual-assault'](
                        '54fbbaaf-e199-47ce-a450-1813be6a5f5c'
                    );

                    application.answers = {
                        'p-mainapplicant-confirmation-method': {
                            'q-mainapplicant-confirmation-method': 'text',
                            'q-mainapplicant-enter-your-telephone-number': '07700900000'
                        },
                        system: {
                            'case-reference': '11/111111'
                        }
                    };
                    roles.forEach(role => setRole(role, application.answers));

                    const questionnaireService = createQuestionnaireService();
                    const actionResults = await Promise.allSettled(
                        await questionnaireService.runOnCompleteActions(application)
                    );
                    const expectedActionData = {
                        templateId,
                        phoneNumber: '07700900000',
                        personalisation: {
                            caseReference: '11/111111'
                        },
                        reference: null
                    };

                    expect(mockedLegacyMessageBusService.sendSms).toHaveBeenNthCalledWith(
                        1,
                        expectedActionData
                    );
                    expect(mockedLegacyMessageBusService.sendSms).toHaveBeenCalledTimes(1);
                    expect(actionResults).toEqual([
                        {status: 'fulfilled', value: {some: 'response'}}
                    ]);
                });
            });

            describe('And user role is rep', () => {
                it.each([
                    {
                        roles: ['rep.applicant:adult:capable'],
                        templateId: 'b51e5e19-f469-4f8a-a5a2-00499da6f027'
                    },
                    {
                        roles: ['rep.mainapplicant.applicant:adult:incapable', 'incapable'],
                        templateId: '94a82598-6f6b-4ad0-abc3-ad3a157eb4a3'
                    },
                    {
                        roles: ['rep.mainapplicant.applicant:child'],
                        templateId: '38047478-4b70-4add-b06c-62c7d93e8a23'
                    },
                    {
                        roles: ['rep:no-legal-authority.applicant', 'noauthority'],
                        templateId: '29674076-46ba-4150-adf0-5215c8fe8aa9'
                    }
                ])('should send a confirmation email to $roles', async ({roles, templateId}) => {
                    const application = templates['sexual-assault'](
                        '54fbbaaf-e199-47ce-a450-1813be6a5f5c'
                    );

                    application.answers = {
                        'p-rep-confirmation-method': {
                            'q-rep-confirmation-method': 'text',
                            'q-rep-telephone-number': '07700900000'
                        },
                        system: {
                            'case-reference': '11/111111'
                        }
                    };
                    roles.forEach(role => setRole(role, application.answers));

                    const questionnaireService = createQuestionnaireService();
                    const actionResults = await Promise.allSettled(
                        await questionnaireService.runOnCompleteActions(application)
                    );
                    const expectedActionData = {
                        templateId,
                        phoneNumber: '07700900000',
                        personalisation: {
                            caseReference: '11/111111'
                        },
                        reference: null
                    };

                    expect(mockedLegacyMessageBusService.sendSms).toHaveBeenNthCalledWith(
                        1,
                        expectedActionData
                    );
                    expect(mockedLegacyMessageBusService.sendSms).toHaveBeenCalledTimes(1);
                    expect(actionResults).toEqual([
                        {status: 'fulfilled', value: {some: 'response'}}
                    ]);
                });
            });
        });
    });
});
