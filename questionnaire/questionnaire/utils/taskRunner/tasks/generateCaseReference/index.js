'use strict';

const createQuestionnaireDAL = require('../../../../../questionnaire-dal');

/**
 * @param {questionnaire} questionnaire - The raw questionnaire object
 * @returns boolean representing whether application is fatal
 */
function getIsFatal(questionnaire) {
    const {answers} = questionnaire;

    return (
        answers['p-applicant-fatal-claim'] &&
        answers['p-applicant-fatal-claim']['q-applicant-fatal-claim']
    );
}

/**
 *
 * @param {string} caseReference generated caseReference
 * @param {date} dateSubmitted the date the questionnaire was submitted
 * @returns
 */
function updateCaseReferenceWithYear(caseReference, dateSubmitted) {
    const year = (dateSubmitted.getFullYear() % 100).toString();
    return `${year}\\${caseReference}`;
}

/**
 *
 * @param {string} caseReference
 * @param {questionnaire} questionnaire
 * @returns result of update
 */
async function setCaseReference(data, db) {
    const systemSection = data.questionnaire.answers.system;
    let caseReference;

    if (systemSection['case-reference']) {
        data.logger.info(
            `Questionnaire with id ${data.questionnaire.id} already has case reference ${systemSection['case-reference']}. Case reference not updated`
        );
        return data.questionnaire;
    }

    data.logger.info(
        `Generating case reference number for questionnaire with id ${data.questionnaire.id}`
    );
    caseReference = await db.getReferenceNumber(
        getIsFatal(data.questionnaire),
        data.questionnaire.id
    );

    const dateSubmitted = await db.getQuestionnaireModifiedDate(data.questionnaire.id);
    data.logger.info(
        `Adding year to case reference for questionnaire with id ${data.questionnaire.id} and case reference ${caseReference}`
    );
    caseReference = updateCaseReferenceWithYear(caseReference, dateSubmitted);

    data.logger.info(
        `Updating questionnaire with id ${data.questionnaire.id} with case reference ${caseReference}`
    );
    data.questionnaire.answers.system['case-reference'] = caseReference;
    return data.questionnaire;
}

/**
 * Generates a reference number for the database
 * and updates the questionnaire object in the database.
 * @param {questionnaire} questionnaire - The raw questionnaire object
 * @returns result from update to the database.
 */
async function generateReferenceNumber(data) {
    const db = createQuestionnaireDAL({logger: data.logger});
    // Update application object with reference
    const updatedQuestionnaire = await setCaseReference(data, db);

    data.logger.info(`Updating questionnaire with id ${data.questionnaire.id}`);
    const result = db.updateQuestionnaire(updatedQuestionnaire.id, updatedQuestionnaire);

    // return something
    return result;
}

module.exports = {
    getIsFatal,
    updateCaseReferenceWithYear,
    generateReferenceNumber
};
