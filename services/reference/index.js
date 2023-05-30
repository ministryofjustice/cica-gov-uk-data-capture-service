'use strict';

function createReferenceService() {
    /**
     * Function finds if fatal claim and return boolean.
     * searches the questionnaire.answers object for the key 'p-applicant-fatal-claim'
     * @param {object} questionnaire
     * @returns {boolean} isFatal
     */
    function checkClaimType(questionnaire) {
        const isFatal =
            questionnaire.answers &&
            questionnaire.answers['p-applicant-fatal-claim'] &&
            questionnaire.answers['p-applicant-fatal-claim']['q-applicant-fatal-claim'];
        return isFatal;
    }

    return Object.freeze({
        checkClaimType
    });
}

module.exports = createReferenceService;
