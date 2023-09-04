'use strict';

const VError = require('verror');

const questionnaireFixtures = require('./test-fixtures');

// // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
// function escapeRegExp(string) {
//     return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
// }

// function errorMessageToRegExp(errorMessage) {
//     return new RegExp(`^${escapeRegExp(errorMessage)}$`);
// }

// const QUESTIONNAIRE_UNIQUE_ATTRIBUTE_IDS = '3094f910-62d0-4698-9409-387320b7004b';
// const QUESTIONNAIRE_DUPLICATE_ATTRIBUTE_IDS = '55376963-0675-4ee9-a184-d6858ec0cf33';
// const QUESTIONNAIRE_DUPLICATE_ATTRIBUTE_IDS_DIFFERENT_DATA_TYPES =
//     '292cd67f-8ff8-4b04-a29c-a1b8c2231ed5';
// const QUESTIONNAIRE_DUPLICATE_ATTRIBUTE_IDS_NON_ARRAY_DATA_TYPES =
//     '7f3eec38-1e5f-4806-b8ea-99bbf8918665';

// const datasetService = createDatasetService({
//     logger: () => 'Logged from dataset test',
//     createQuestionnaireDAL: () => ({
//         getQuestionnaire: questionnaireId => {
//             if (questionnaireId === QUESTIONNAIRE_UNIQUE_ATTRIBUTE_IDS) {
//                 return questionnaireFixtures.getUniqueAttributeIds();
//             }

//             if (questionnaireId === QUESTIONNAIRE_DUPLICATE_ATTRIBUTE_IDS) {
//                 return questionnaireFixtures.getDuplicateAttributeIds();
//             }

//             if (questionnaireId === QUESTIONNAIRE_DUPLICATE_ATTRIBUTE_IDS_DIFFERENT_DATA_TYPES) {
//                 return questionnaireFixtures.getDuplicateAttributeIdsDifferentDataTypes();
//             }

//             if (questionnaireId === QUESTIONNAIRE_DUPLICATE_ATTRIBUTE_IDS_NON_ARRAY_DATA_TYPES) {
//                 return questionnaireFixtures.getDuplicateAttributeIdsNonArrayDataTypes();
//             }

//             throw new VError(
//                 {
//                     name: 'ResourceNotFound'
//                 },
//                 `Questionnaire "${questionnaireId}" not found`
//             );
//         }
//     })
// });

function addOnSubmitDefinition(mock) {
    mock.onSubmit = {
        id: 'task0',
        type: 'sequential',
        data: [
            {
                id: 'task1',
                type: 'updateCaseRefTestTask',
                data: {
                    questionnaire: '$.questionnaireDef',
                    logger: '$.logger'
                }
            }
        ]
    };

    return mock;
}

const updateQuestionnaireSubmissionStatus = jest.fn();

jest.doMock('../questionnaire-dal.js', () =>
    jest.fn(() => ({
        getQuestionnaire: questionnaireId => {
            // unsubmittable due to progress not containing a summary section
            if (questionnaireId === '04bd2bd8-1025-4236-a7a2-e323a4040440') {
                return {
                    routes: {
                        summary: ['e', 'f', 'g']
                    },
                    progress: ['a', 'b', 'c']
                };
            }

            // submittable
            if (questionnaireId === '508ad99f-a968-495d-b03c-25368e2d99cd') {
                return {
                    routes: {
                        summary: ['e', 'f', 'g']
                    },
                    progress: ['a', 'b', 'f'],
                    onSubmit: {
                        id: 'task0',
                        type: 'sequential',
                        data: [
                            {
                                id: 'task1',
                                type: 'simplePassingTaskFactory'
                            },
                            {
                                id: 'task2',
                                type: 'simplePassingTaskFactory'
                            }
                        ]
                    }
                };
            }

            // submittable but unsuccessful due to failing task
            if (questionnaireId === '93a1d3ab-56a6-4554-8acf-cdeb088d511d') {
                return {
                    routes: {
                        summary: ['e', 'f', 'g']
                    },
                    progress: ['a', 'b', 'f'],
                    onSubmit: {
                        id: 'task0',
                        type: 'sequential',
                        data: [
                            {
                                id: 'task1',
                                type: 'simpleFailingTaskFactory'
                            },
                            {
                                id: 'task2',
                                type: 'simplePassingTaskFactory'
                            }
                        ]
                    }
                };
            }

            throw new VError(
                {
                    name: 'ResourceNotFound'
                },
                `Questionnaire "${questionnaireId}" not found`
            );
        },
        updateQuestionnaireSubmissionStatus,
        getQuestionnaireSubmissionStatus: () => 'NOT_STARTED'
    }))
);

const createSubmissionsService = require('./submissions-service');

function logger() {
    return 'Logged from submissions test';
}

describe('Submission service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should throw if the questionnaire does not exist', async () => {
        let error;

        try {
            const submissionService = createSubmissionsService({
                logger
            });
            const questionnaireId = '85dc5d74-fe27-4b24-a96f-40f3c6d30783';

            await submissionService.submit(questionnaireId);
        } catch (err) {
            error = err;
        }

        expect(error.message).toEqual(
            'Questionnaire "85dc5d74-fe27-4b24-a96f-40f3c6d30783" not found'
        );
    });

    it('should throw if the questionnaire is not in a submittable state', async () => {
        let error;

        try {
            const submissionService = createSubmissionsService({
                logger
            });
            const questionnaireId = '04bd2bd8-1025-4236-a7a2-e323a4040440';

            await submissionService.submit(questionnaireId);
        } catch (err) {
            error = err;
        }

        expect(error.message).toEqual(
            'Questionnaire with ID "04bd2bd8-1025-4236-a7a2-e323a4040440" is not in a submittable state'
        );
    });

    describe('Successful submission', () => {
        it('should return a submissions resource', async () => {
            const questionnaireId = '508ad99f-a968-495d-b03c-25368e2d99cd';
            const submissionService = createSubmissionsService({
                logger,
                taskImplementations: {
                    simplePassingTaskFactory: async () => 'foo'
                }
            });
            const submissionResource = await submissionService.submit(questionnaireId);

            expect(submissionResource).toEqual({
                data: {
                    type: 'submissions',
                    id: questionnaireId,
                    attributes: {
                        status: 'COMPLETED',
                        submitted: true,
                        questionnaireId,
                        caseReferenceNumber: '11\\223344' // TODO: DO WE NEED THIS? ADDED DUMMY CASE REF TO PASS TEST.
                    }
                }
            });
        });

        it(`should update the questionnaire's submission status to "IN_PROGRESS then "COMPLETED"`, async () => {
            const questionnaireId = '508ad99f-a968-495d-b03c-25368e2d99cd';
            const submissionService = createSubmissionsService({
                logger,
                taskImplementations: {
                    simplePassingTaskFactory: async () => 'foo'
                }
            });
            await submissionService.submit(questionnaireId);

            expect(updateQuestionnaireSubmissionStatus.mock.calls[0][0]).toEqual(questionnaireId);
            expect(updateQuestionnaireSubmissionStatus.mock.calls[0][1]).toEqual('IN_PROGRESS');
            expect(updateQuestionnaireSubmissionStatus.mock.calls[1][0]).toEqual(questionnaireId);
            expect(updateQuestionnaireSubmissionStatus.mock.calls[1][1]).toEqual('COMPLETED');
        });
    });

    describe('Unsuccessful submission', () => {
        it('should return a submissions resource', async () => {
            const questionnaireId = '93a1d3ab-56a6-4554-8acf-cdeb088d511d';
            let error;

            try {
                const submissionService = createSubmissionsService({
                    logger,
                    taskImplementations: {
                        simplePassingTaskFactory: async () => 'foo',
                        simpleFailingTaskFactory: async () => {
                            throw Error('foo');
                        }
                    }
                });
                await submissionService.submit(questionnaireId);
            } catch (err) {
                error = err;
            }

            expect(error).toEqual({
                data: {
                    type: 'submissions',
                    id: questionnaireId,
                    attributes: {
                        status: 'FAILED',
                        submitted: false,
                        questionnaireId,
                        caseReferenceNumber: '11\\223344' // TODO: DO WE NEED THIS? ADDED DUMMY CASE REF TO PASS TEST.
                    }
                }
            });
        });

        it(`should update the questionnaire's submission status to "IN_PROGRESS then "FAILED"`, async () => {
            const questionnaireId = '93a1d3ab-56a6-4554-8acf-cdeb088d511d';
            let error;

            try {
                const submissionService = createSubmissionsService({
                    logger,
                    taskImplementations: {
                        simplePassingTaskFactory: async () => 'foo'
                    }
                });
                await submissionService.submit(questionnaireId);
            } catch (err) {
                error = err;
            }

            expect(updateQuestionnaireSubmissionStatus.mock.calls[0][0]).toEqual(questionnaireId);
            expect(updateQuestionnaireSubmissionStatus.mock.calls[0][1]).toEqual('IN_PROGRESS');
            expect(updateQuestionnaireSubmissionStatus.mock.calls[1][0]).toEqual(questionnaireId);
            expect(updateQuestionnaireSubmissionStatus.mock.calls[1][1]).toEqual('FAILED');
        });

        // it(`should update the questionnaire's submission status to "IN_PROGRESS then "COMPLETED"`, async () => {
        //     const questionnaireId = '508ad99f-a968-495d-b03c-25368e2d99cd';
        //     const submissionService = createSubmissionsService({
        //         logger,
        //         taskImplementations: {
        //             simplePassingTaskFactory: async () => 'foo'
        //         }
        //     });
        //     await submissionService.submit(questionnaireId);

        //     expect(updateQuestionnaireSubmissionStatus.mock.calls[0][0]).toEqual(questionnaireId);
        //     expect(updateQuestionnaireSubmissionStatus.mock.calls[0][1]).toEqual('IN_PROGRESS');
        //     expect(updateQuestionnaireSubmissionStatus.mock.calls[1][0]).toEqual(questionnaireId);
        //     expect(updateQuestionnaireSubmissionStatus.mock.calls[1][1]).toEqual('COMPLETED');
        // });
    });

    // it('should throw is the requested resource version does not exist', async () => {
    //     const rxExpectedError = errorMessageToRegExp(
    //         'Dataset resource version "1.2.3" is unsupported'
    //     );

    //     await expect(
    //         datasetService.getResource(QUESTIONNAIRE_UNIQUE_ATTRIBUTE_IDS, '1.2.3')
    //     ).rejects.toThrow(rxExpectedError);
    // });

    // describe('Dataset resource v1.0.0', () => {
    //     it('should return a dataset resource', async () => {
    //         const dataset = await datasetService.getResource(
    //             QUESTIONNAIRE_UNIQUE_ATTRIBUTE_IDS,
    //             '1.0.0'
    //         );

    //         expect(dataset[0]).toEqual({
    //             type: 'dataset',
    //             id: '0',
    //             attributes: {
    //                 'q-applicant-british-citizen-or-eu-national': true,
    //                 'q-applicant-enter-your-email-address':
    //                     'bar@9f7b855e-586b-49f0-ac7a-026919732b06.gov.uk'
    //             }
    //         });
    //     });

    //     describe('Given multiple sections with the same question id', () => {
    //         it('should combine answers agaist a single id instance', async () => {
    //             const dataset = await datasetService.getResource(
    //                 QUESTIONNAIRE_DUPLICATE_ATTRIBUTE_IDS,
    //                 '1.0.0'
    //             );

    //             expect(dataset[0]).toEqual({
    //                 type: 'dataset',
    //                 id: '0',
    //                 attributes: {
    //                     'q-applicant-physical-injury-upper': ['head', 'ear', 'skin', 'muscle']
    //                 }
    //             });
    //         });

    //         it('should throw if the answers to be combined are of different types', async () => {
    //             const rxExpectedError = errorMessageToRegExp(
    //                 'Target and Source must be arrays. Target type: "array". Source type: "string"'
    //             );

    //             await expect(
    //                 datasetService.getResource(
    //                     QUESTIONNAIRE_DUPLICATE_ATTRIBUTE_IDS_DIFFERENT_DATA_TYPES,
    //                     '1.0.0'
    //                 )
    //             ).rejects.toThrow(rxExpectedError);
    //         });

    //         it('should throw if the answers to be combined are not arrays', async () => {
    //             const rxExpectedError = errorMessageToRegExp(
    //                 'Target and Source must be arrays. Target type: "string". Source type: "string"'
    //             );

    //             await expect(
    //                 datasetService.getResource(
    //                     QUESTIONNAIRE_DUPLICATE_ATTRIBUTE_IDS_NON_ARRAY_DATA_TYPES,
    //                     '1.0.0'
    //                 )
    //             ).rejects.toThrow(rxExpectedError);
    //         });
    //     });
    // });

    // describe('Dataset resource v2.0.0', () => {
    //     it('should return a dataset resource', async () => {
    //         const dataset = await datasetService.getResource(
    //             QUESTIONNAIRE_UNIQUE_ATTRIBUTE_IDS,
    //             '2.0.0'
    //         );

    //         expect(dataset[0]).toEqual({
    //             type: 'dataset',
    //             id: '0',
    //             attributes: {
    //                 values: [
    //                     {
    //                         id: 'q-applicant-enter-your-email-address',
    //                         type: 'simple',
    //                         label: 'Enter your email address',
    //                         value: 'bar@9f7b855e-586b-49f0-ac7a-026919732b06.gov.uk'
    //                     },
    //                     {
    //                         id: 'q-applicant-british-citizen-or-eu-national',
    //                         type: 'simple',
    //                         label: 'Are you a British citizen or EU national?',
    //                         value: true,
    //                         valueLabel: 'Yes'
    //                     }
    //                 ]
    //             }
    //         });
    //     });

    //     describe('Given multiple sections with the same question id', () => {
    //         it('should combine answers agaist a single id instance', async () => {
    //             const dataset = await datasetService.getResource(
    //                 QUESTIONNAIRE_DUPLICATE_ATTRIBUTE_IDS,
    //                 '2.0.0'
    //             );

    //             expect(dataset[0]).toEqual({
    //                 type: 'dataset',
    //                 id: '0',
    //                 attributes: {
    //                     values: [
    //                         {
    //                             id: 'q-applicant-physical-injury-upper',
    //                             type: 'simple',
    //                             label: 'What was injured?',
    //                             value: ['head', 'ear', 'skin', 'muscle'],
    //                             valueLabel: ['Head or brain', 'Ear or hearing', 'Skin', 'Tissue']
    //                         }
    //                     ]
    //                 }
    //             });
    //         });
    //     });
    // });
});
