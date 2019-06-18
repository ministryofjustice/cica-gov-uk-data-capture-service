'use strict';

const db = require('../db');

function questionnaireDAL() {
    async function createQuestionnaire(uuidV4, questionnaire) {
        await db.query(
            'INSERT INTO questionnaire (id, questionnaire, created, modified) VALUES($1, $2, current_timestamp, current_timestamp)',
            [uuidV4, questionnaire]
        );
    }

    return Object.freeze({
        createQuestionnaire
    });
}

module.exports = questionnaireDAL;
