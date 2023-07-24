'use strict';

const createQuestionnaireDAL = require('../../../../../questionnaire-dal');

/**
 * @param {questionnaire} questionnaire - The raw questionnaire object
 * @returns boolean representing whether application is fatal
 */
function getIsFatal(questionnaire) {
    const {answers} = questionnaire;

    return answers['p-applicant-fatal-claim']?.['q-applicant-fatal-claim'];
}

/**
 * @param {questionnaire} questionnaire - The raw questionnaire object
 * @returns boolean representing whether application is a split fatal/funeral application
 */
function getIsSplit(questionnaire) {
    const {answers} = questionnaire;

    return (
        answers['p-applicant-funeral-costs-paid']?.['q-applicant-funeral-costs-paid'] &&
        !answers['p-applicant-claim-type']?.['q-applicant-claim-type']
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
async function setCaseReference(questionnaire, logger, db, section) {
    const systemSection = questionnaire.answers.system;
    let caseReference;

    if (systemSection[section]) {
        logger.info(
            `Questionnaire with id ${questionnaire.id} already has ${section} ${systemSection[section]}. ${section} not updated`
        );
        return questionnaire;
    }

    logger.info(`Generating case reference number for questionnaire with id ${questionnaire.id}`);
    caseReference = await db.getReferenceNumber(getIsFatal(questionnaire), questionnaire.id);

    const dateSubmitted = await db.getQuestionnaireModifiedDate(questionnaire.id);
    logger.info(`Adding year to ${section} for questionnaire with id ${questionnaire.id}`);
    caseReference = updateCaseReferenceWithYear(caseReference, dateSubmitted);

    logger.info(`Updating questionnaire with id ${questionnaire.id} with ${section}`);
    questionnaire.answers.system[section] = caseReference;
    return questionnaire;
}

/**
 * Generates a reference number for the database
 * and updates the questionnaire object in the database.
 * @param {questionnaire} questionnaire - The raw questionnaire object
 * @returns result from update to the database.
 */
async function generateReferenceNumber({questionnaire, logger}) {
    logger.info(questionnaire.id)
    const db = createQuestionnaireDAL({logger});
    // Update application object with reference
    let updatedQuestionnaire = await setCaseReference(questionnaire, logger, db, 'case-reference');

    // If split application then we need to generate a secondary reference number too
    if (getIsSplit(questionnaire)) {
        updatedQuestionnaire = await setCaseReference(
            updatedQuestionnaire,
            logger,
            db,
            'secondary-reference'
        );
    }

    logger.info(`Updating questionnaire with id ${questionnaire.id}`);
    const result = db.updateQuestionnaire(updatedQuestionnaire.id, updatedQuestionnaire);

    // return something
    return result;
}

module.exports = {
    getIsFatal,
    getIsSplit,
    updateCaseReferenceWithYear,
    generateReferenceNumber,
    setCaseReference
};
