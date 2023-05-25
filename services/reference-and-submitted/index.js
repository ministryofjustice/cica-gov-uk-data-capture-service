'use strict';

const getQuestionnaire = require('../../questionnaire/questionnaire-service');

function createReferenceService() {
    /**
     * Filter questionnaire object for sectionId of p-applicant-fatal-claim.
     * Returns this object or null. Could be extended to make more generic.
     *
     * @param {object} questionnaire
     * @returns {object} questionnaire or null
     */
    function questionnaireCustomFilter(questionnaire) {
        if (
            Object.prototype.hasOwnProperty.call(questionnaire, 'sectionId') &&
            questionnaire.sectionId === 'p-applicant-fatal-claim'
        ) {
            return questionnaire;
        }

        for (let i = 0; i < Object.keys(questionnaire).length; i += 1) {
            if (typeof questionnaire[Object.keys(questionnaire)[i]] === 'object') {
                const o = questionnaireCustomFilter(questionnaire[Object.keys(questionnaire)[i]]);
                if (o != null) {
                    return o;
                }
            }
        }

        return null;
    }

    /**
     * Function extends questionnaireCustomFilter to check if fatal claim and return boolean.
     * @param {object} questionnaire
     * @returns {boolean} fatalClaim
     */
    function checkClaimType(questionnaire) {
        const sectionIdSearchFor = questionnaireCustomFilter(questionnaire);
        const fatalClaim = sectionIdSearchFor.value;

        return fatalClaim;
        // if (typeof fatalClaim !== 'undefined') {
        //     return fatalClaim ? claimTypeDefinitions.fatalClaim : claimTypeDefinitions.PIorPOA;
        // }
        // return null;
        // above code needed when outputing claim No. to db.
    }

    /**
     * Function to be called to get db to add submitted and reference to questionnaire table.
     * currently just console logs claim type.
     * @param {UUID} questionnaireId
     */
    function addSubmittedAndReference(questionnaireId) {
        // get questionare object from db.
        const questionnaire = getQuestionnaire(questionnaireId);

        const typeOfClaim = checkClaimType(questionnaire);

        // print out claim Type.
        console.log(typeOfClaim);
    }

    return Object.freeze({
        questionnaireCustomFilter,
        checkClaimType,
        addSubmittedAndReference
    });
}

module.exports = createReferenceService;
