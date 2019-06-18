'use strict';

const uuidv4 = require('uuid/v4');
const templates = require('./templates');
const db = require('./questionnaire-dal')();

function createQuestionnaireService() {
    async function createQuestionnaire(templateName) {
        if (!(templateName in templates)) {
            const err = Error(`Template "${templateName}" does not exist`);
            err.name = 'HTTPError';
            err.statusCode = 404;
            err.error = '404 Not Found';
            throw err;
        }

        const uuidV4 = uuidv4();
        const questionnaire = templates[templateName](uuidV4);

        await db.createQuestionnaire(uuidV4, questionnaire);

        return {
            data: {
                type: 'questionnaires',
                id: questionnaire.id,
                attributes: questionnaire
            }
        };
    }

    return Object.freeze({
        createQuestionnaire
    });
}

module.exports = createQuestionnaireService;
