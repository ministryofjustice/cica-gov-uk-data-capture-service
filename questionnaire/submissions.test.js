'use strict';

const VError = require('verror');
const createQuestionnaireService = require('./questionnaire-service');

const questionnaireCompleteWithoutCRN = require('./test-fixtures/res/questionnaireCompleteWithoutCRN');
const questionnaireCompleteWithCRN = require('./test-fixtures/res/questionnaireCompleteWithCRN');
const questionnaireIncompleteWithoutCRN = require('./test-fixtures/res/questionnaireIncompleteWithoutCRN');

const questionnaireService = createQuestionnaireService({
    logger: () => 'Logged from submissions test',
    createQuestionnaireDAL: () => ({
        getQuestionnaire: questionnaireId => {
            if (
                questionnaireId === '285cb104-0c15-4a9c-9840-cb1007f098fb' || // not started.
                questionnaireId === '3fa7bde5-bfad-453a-851d-5e3c8d206d5b' || // in progress.
                questionnaireId === '67d8e5d2-44a5-4ab7-91c0-3fd27d009235' // failed.
            ) {
                return questionnaireCompleteWithoutCRN;
            }

            if (questionnaireId === 'f197d3e9-d8ba-4500-96ed-9ea1d08f1427') {
                // completed.
                return questionnaireCompleteWithCRN;
            }

            // nonSubmittable.
            if (questionnaireId === '4fa7503f-1f73-42e7-b875-b342dee69941') {
                return questionnaireIncompleteWithoutCRN;
            }

            throw new VError(
                {
                    name: 'ResourceNotFound'
                },
                `Questionnaire "${questionnaireId}" not found`
            );
        },
        // updateQuestionnaire: () => undefined,
        getQuestionnaireSubmissionStatus: questionnaireId => {
            if (questionnaireId === '285cb104-0c15-4a9c-9840-cb1007f098fb') {
                return 'NOT_STARTED';
            }
            if (questionnaireId === '3fa7bde5-bfad-453a-851d-5e3c8d206d5b') {
                return 'IN_PROGRESS';
            }
            if (questionnaireId === '67d8e5d2-44a5-4ab7-91c0-3fd27d009235') {
                return 'FAILED';
            }
            if (questionnaireId === '4fa7503f-1f73-42e7-b875-b342dee69941') {
                return 'NOT_STARTED';
            }

            throw new VError(
                {
                    name: 'ResourceNotFound'
                },
                `Questionnaire "${questionnaireId}" not found`
            );
        },
        getQuestionnaireIdsBySubmissionStatus: submissionStatus => {
            if (submissionStatus === 'FAILED') {
                return ['67d8e5d2-44a5-4ab7-91c0-3fd27d009235'];
            }
            if (submissionStatus === 'NOT_STARTED') {
                return ['4fa7503f-1f73-42e7-b875-b342dee69941'];
            }
            if (submissionStatus === 'IN_PROGRESS') {
                return ['3fa7bde5-bfad-453a-851d-5e3c8d206d5b'];
            }

            throw new VError(
                {
                    name: 'ResourceNotFound'
                },
                `Questionnaires with submission_status "${submissionStatus}" not found`
            );
        }
    })
});

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

function errorMessageToRegExp(errorMessage) {
    return new RegExp(`^${escapeRegExp(errorMessage)}$`);
}

describe('submissions resource', () => {
    describe('GET', () => {
        it('should return a submissions resource', async () => {
            const response = await questionnaireService.getSubmissionResponseData(
                '285cb104-0c15-4a9c-9840-cb1007f098fb'
            );
            expect(response.type).toEqual('submissions');
        });
        it('should have a status of "NOT_STARTED"', async () => {
            const response = await questionnaireService.getSubmissionResponseData(
                '285cb104-0c15-4a9c-9840-cb1007f098fb'
            );
            expect(response.attributes.status).toEqual('NOT_STARTED');
        });
        it('should not be submitted', async () => {
            const response = await questionnaireService.getSubmissionResponseData(
                '285cb104-0c15-4a9c-9840-cb1007f098fb'
            );
            expect(response.attributes.submitted).toEqual(false);
        });
        it('should not have a case reference number', async () => {
            const response = await questionnaireService.getSubmissionResponseData(
                '285cb104-0c15-4a9c-9840-cb1007f098fb'
            );
            expect(response.attributes.caseReferenceNumber).toEqual(null);
        });
        it('should error', async () => {
            const rxExpectedError = errorMessageToRegExp(
                `Questionnaire "125cb104-9b78-4ebc-4032-3e9ab320cca1" not found`
            );
            await expect(
                questionnaireService.getSubmissionResponseData(
                    '125cb104-9b78-4ebc-4032-3e9ab320cca1'
                )
            ).rejects.toThrow(rxExpectedError);
        });
    });
    describe('POST', () => {
        it('should not submit an unfinished questionnaire', async () => {
            await expect(
                questionnaireService.getSubmissionResponseData(
                    '4fa7503f-1f73-42e7-b875-b342dee69941',
                    true
                )
            ).rejects.toThrow();
        });
        it('should not resubmit an in-progress questionnaire, and return a submission resource', async () => {
            const response = await questionnaireService.getSubmissionResponseData(
                '3fa7bde5-bfad-453a-851d-5e3c8d206d5b',
                true
            );
            expect(response).toEqual({
                id: '3fa7bde5-bfad-453a-851d-5e3c8d206d5b',
                type: 'submissions',
                attributes: {
                    caseReferenceNumber: null,
                    questionnaireId: '3fa7bde5-bfad-453a-851d-5e3c8d206d5b',
                    status: 'IN_PROGRESS',
                    submitted: false
                }
            });
        });
        it('should not resubmit a completed questionnaire', async () => {
            await expect(
                questionnaireService.getSubmissionResponseData(
                    'f197d3e9-d8ba-4500-96ed-9ea1d08f1427',
                    true
                )
            ).rejects.toThrow();
        });
    });
});

describe('submissions resources', () => {
    describe('GET', () => {
        it('should return a submissions resources collection', async () => {
            const response = await questionnaireService.getSubmissions('FAILED');
            expect(response.length).toEqual(1);
            expect(response).toEqual([
                {
                    id: '67d8e5d2-44a5-4ab7-91c0-3fd27d009235',
                    type: 'submissions',
                    attributes: {
                        caseReferenceNumber: null,
                        questionnaireId: '67d8e5d2-44a5-4ab7-91c0-3fd27d009235',
                        status: 'FAILED',
                        submitted: false
                    }
                }
            ]);
        });
        it('should error', async () => {
            const rxExpectedError = errorMessageToRegExp(
                `Questionnaires with submission_status "NOT_A_STATUS" not found`
            );

            await expect(questionnaireService.getSubmissions('NOT_A_STATUS')).rejects.toThrow(
                rxExpectedError
            );
        });
    });
    describe('POST', () => {
        it('should not submit an unfinished questionnaire', async () => {
            await expect(questionnaireService.postSubmissions('NOT_STARTED')).rejects.toThrow();
        });
        it('should not resubmit an in-progress questionnaire', async () => {
            await expect(questionnaireService.postSubmissions('IN_PROGRESS')).rejects.toThrow();
        });
        it('should not resubmit a completed questionnaire', async () => {
            await expect(questionnaireService.postSubmissions('COMPLETED')).rejects.toThrow();
        });
    });
});
