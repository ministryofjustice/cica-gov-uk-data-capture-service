'use strict';

function questionnaireResource(spec) {
    const {questionnaire} = spec;
    const {id, type, version, routes} = questionnaire;

    return Object.freeze({
        type: 'questionnaires',
        id: questionnaire.id,
        attributes: {
            id,
            type,
            version,
            routes: {
                initial: routes.states.filter(state => state.id === routes.initial)[0].initial
            }
        }
    });
}

module.exports = questionnaireResource;
