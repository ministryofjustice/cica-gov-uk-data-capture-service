'use strict';

const VError = require('verror');
const createDBQuery = require('../db');

function questionnaireDAL(spec) {
    const {logger} = spec;
    const db = createDBQuery({logger});

    async function createQuestionnaire(uuidV4, questionnaire) {
        try {
            await db.query(
                'INSERT INTO questionnaire (id, questionnaire, created, modified) VALUES($1, $2, current_timestamp, current_timestamp)',
                [uuidV4, questionnaire]
            );
        } catch (err) {
            throw err;
        }
    }

    async function updateQuestionnaire(questionnaireId, questionnaire) {
        // TODO: throw in no rows returned e.g. questionnaireId does not exist
        let result;

        try {
            result = await db.query(
                'UPDATE questionnaire SET questionnaire = $1, modified = current_timestamp WHERE id = $2',
                [questionnaire, questionnaireId]
                // Currently replacing the whole questionnaire object. The following commented query/params could be used to update only the answers object:
                // 'UPDATE questionnaire SET questionnaire = jsonb_set(questionnaire, $1, $2, TRUE), modified = current_timestamp WHERE id = $3',
                // [`{answers,${sectionId}}`, answers, questionnaireId]
            );
        } catch (err) {
            throw err;
        }

        return result;
    }

    async function getQuestionnaire(questionnaireId) {
        let questionnaire;

        try {
            questionnaire = await db.query(
                'SELECT questionnaire FROM questionnaire WHERE id = $1',
                [questionnaireId]
            );

            if (questionnaire.rows.length === 0) {
                // No instance was found
                throw new VError(
                    {
                        name: 'ResourceNotFound'
                    },
                    `Questionnaire "${questionnaireId}" not found`
                );
            }
        } catch (err) {
            throw err;
        }

        return questionnaire;
    }

    async function getQuestionnaireSubmissionStatus(questionnaireId) {
        let result;
        try {
            result = await db.query('SELECT submission_status FROM questionnaire WHERE id = $1', [
                questionnaireId
            ]);

            if (result.rows.length === 0) {
                // No instance was found
                throw new VError(
                    {
                        name: 'ResourceNotFound'
                    },
                    `Questionnaire "${questionnaireId}" not found`
                );
            }
        } catch (err) {
            throw err;
        }

        return result.rows[0].submission_status;
    }

    async function updateQuestionnaireSubmissionStatus(questionnaireId, submissionStatus) {
        let result;

        try {
            result = await db.query(
                'UPDATE questionnaire SET submission_status = $1, modified = current_timestamp WHERE id = $2',
                [submissionStatus, questionnaireId]
            );
            const resultCheck = await getQuestionnaireSubmissionStatus(questionnaireId);
            if (resultCheck !== submissionStatus) {
                throw new VError(
                    {
                        name: 'UpdateNotSuccessful'
                    },
                    `Questionnaire "${questionnaireId}" submission status not successfully updated to "${submissionStatus}"`
                );
            }
        } catch (err) {
            throw err;
        }

        return result;
    }

    async function createQuestionnaireSubmission(questionnaireId, submissionStatus) {
        try {
            const result = await getQuestionnaire(questionnaireId);
            const {questionnaire} = result.rows && result.rows[0];
            // UPSERT query (refer to end of query for UPSERT syntax).
            await db.query(
                `INSERT INTO questionnaire_submissions (id, questionnaire, created, modified, submission_status) VALUES($1, $2, current_timestamp, current_timestamp, $3) ON CONFLICT ON CONSTRAINT questionnaire_submissions_pkey DO UPDATE SET submission_status = $3`,
                [questionnaire.id, questionnaire, submissionStatus]
            );
        } catch (err) {
            throw err;
        }

        return true;
    }

    return Object.freeze({
        createQuestionnaire,
        updateQuestionnaire,
        getQuestionnaire,
        getQuestionnaireSubmissionStatus,
        updateQuestionnaireSubmissionStatus,
        createQuestionnaireSubmission
    });
}

module.exports = questionnaireDAL;
