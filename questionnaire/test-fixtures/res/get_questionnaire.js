'use strict';

const templates = require('../../templates');

const questionnaireId = '285cb104-0c15-4a9c-9840-cb1007f098fb';
let questionnaire = templates['sexual-assault'](questionnaireId);

function putQuestionnaireInToSubmittableState(questionaireInstance) {
    // This is currently how a questionnaire is deemed submittable :(
    questionaireInstance.progress.push(questionaireInstance.routes.summary);

    return questionaireInstance;
}

function populateQuestionnaireAnswersObject(questionaireInstance) {
    // eslint-disable-next-line no-param-reassign
    questionaireInstance.answers = {
        ...questionaireInstance.answers,
        // notifications need this answer to exist.
        'p-applicant-who-are-you-applying-for': {
            'q-applicant-who-are-you-applying-for': 'myself'
        },
        'p-applicant-confirmation-method': {
            'q-applicant-confirmation-method': 'email',
            'q-applicant-enter-your-telephone-number': '07701234567',
            'q-applicant-enter-your-email-address': 'somebody@cica.gov.uk'
        },
        system: {
            'case-reference': '21\\123456'
        }
    };

    return questionaireInstance;
}

questionnaire = putQuestionnaireInToSubmittableState(questionnaire);
questionnaire = populateQuestionnaireAnswersObject(questionnaire);

module.exports = questionnaire;
