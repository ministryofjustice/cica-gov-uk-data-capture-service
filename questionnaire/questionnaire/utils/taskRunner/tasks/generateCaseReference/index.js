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
 * @param {questionnaire} questionnaire - The raw questionnaire object
 * @returns boolean representing whether application is a split fatal/funeral application
 */
function getIsSplit(questionnaire) {
    const {answers} = questionnaire;

    return (
        answers['p-applicant-funeral-costs-paid'] &&
        answers['p-applicant-funeral-costs-paid']['q-applicant-funeral-costs-paid'] &&
        !(
            answers['p-applicant-claim-type'] &&
            answers['p-applicant-claim-type']['q-applicant-claim-type']
        )
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
async function setCaseReference(data, db, section) {
    const systemSection = data.questionnaire.answers.system;
    let caseReference;

    if (systemSection[section]) {
        data.logger.info(
            `Questionnaire with id ${data.questionnaire.id} already has ${section} ${systemSection[section]}. ${section} not updated`
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
        `Adding year to ${section} for questionnaire with id ${data.questionnaire.id} and case reference ${caseReference}`
    );
    caseReference = updateCaseReferenceWithYear(caseReference, dateSubmitted);

    data.logger.info(
        `Updating questionnaire with id ${data.questionnaire.id} with ${section} ${caseReference}`
    );
    data.questionnaire.answers.system[section] = caseReference;
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
    let updatedQuestionnaire = await setCaseReference(data, db, 'case-reference');

    // If
    if (getIsSplit(data)) {
        updatedQuestionnaire = await setCaseReference(
            updatedQuestionnaire,
            db,
            'secondary-reference'
        );
    }

    data.logger.info(`Updating questionnaire with id ${data.questionnaire.id}`);
    const result = db.updateQuestionnaire(updatedQuestionnaire.id, updatedQuestionnaire);

    // return something
    return result;
}

module.exports = {
    getIsFatal,
    getIsSplit,
    updateCaseReferenceWithYear,
    generateReferenceNumber
};
