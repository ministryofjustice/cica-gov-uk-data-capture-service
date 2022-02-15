'use strict';

const templates = require('../../templates');

const questionnaireId = '285cb104-0c15-4a9c-9840-cb1007f098fb';
let questionnaire = templates['sexual-assault'](questionnaireId);

function putQuestionnaireInToSubmittableState(questionnaireInstance) {
    // This is currently how a questionnaire is deemed submittable :(
    questionnaireInstance.progress.push(...questionnaireInstance.routes.summary);

    return questionnaireInstance;
}

questionnaire = putQuestionnaireInToSubmittableState(questionnaire);

module.exports = questionnaire;
