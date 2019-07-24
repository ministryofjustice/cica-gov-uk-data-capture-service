'use strict';

function createProgressEntriesService() {
    function buildProgressEntry({progressEntryId, sectionId, questionnaire}) {
        const progressEntry = {
            data: [
                {
                    type: 'progress-entries',
                    id: progressEntryId, // index of the progress array.
                    attributes: {
                        sectionId
                    },
                    relationships: {
                        section: {
                            links: {
                                related: `/api/v1/questionnaires/${questionnaire.id}/sections/${sectionId}`
                            },
                            data: {
                                type: 'sections',
                                id: sectionId
                            }
                        },
                        answer: {
                            links: {
                                related: `/api/v1/questionnaires/${questionnaire.id}/sections/${sectionId}/answers`
                            },
                            data: {
                                type: 'answers',
                                id: sectionId
                            }
                        }
                    },
                    links: {
                        self: `/api/v1/progress-entries/?progressEntryId=${progressEntryId}&questionnaireId=${questionnaire.id}`,
                        first: `/api/v1/progress-entries/?progressEntryId=0&questionnaireId=${questionnaire.id}`, // useful?
                        prev:
                            progressEntryId > 0
                                ? `/api/v1/progress-entries/?progressEntryId=${progressEntryId -
                                      1}&questionnaireId=${questionnaire.id}`
                                : undefined
                        // next: '',
                        // last: ''
                    }
                }
            ],
            included: [
                {
                    type: 'sections',
                    id: sectionId,
                    attributes: questionnaire.sections[sectionId]
                },
                {
                    type: 'answers',
                    id: sectionId,
                    attributes: questionnaire.answers[sectionId]
                }
            ],
            meta: {
                initial: questionnaire.routes.initial,
                final: !!(
                    questionnaire.routes.states[sectionId] &&
                    questionnaire.routes.states[sectionId].type &&
                    questionnaire.routes.states[sectionId].type === 'final'
                ),
                summary: questionnaire.routes.summary
            }
        };

        return progressEntry;
    }

    function getProgressEntryBySectionId(questionnaire, sectionId) {
        const {progress} = questionnaire;
        const requestedSectionName = sectionId;
        const resultantProgressEntryId = progress.indexOf(requestedSectionName);
        const resultantSectionName = requestedSectionName;

        return buildProgressEntry({
            progressEntryId: resultantProgressEntryId,
            sectionId: resultantSectionName,
            questionnaire
        });
    }

    function getProgressEntryById(questionnaire, progressEntryId) {
        const {progress} = questionnaire;
        const requestedSectionName = progress[progressEntryId];
        const resultantProgressEntryId = progressEntryId;
        const resultantSectionName = requestedSectionName;

        return buildProgressEntry({
            progressEntryId: resultantProgressEntryId,
            sectionId: resultantSectionName,
            questionnaire
        });
    }

    function getPreviousProgressEntry(questionnaire, currentSection) {
        const {progress} = questionnaire;
        const requestedSectionId = currentSection;

        // where in the progress is the requested section name?
        const currentSectionProgressIndex = progress.indexOf(requestedSectionId);

        // we want the section previous to the section name specified
        // in `before` because `before` specifies the section that you
        // want to navigate from, not to.
        const resultantProgressEntryId = currentSectionProgressIndex - 1;
        let resultantSectionId = progress[resultantProgressEntryId];

        if (!resultantSectionId) {
            resultantSectionId = questionnaire.routes.referrer;
        }

        return buildProgressEntry({
            progressEntryId: resultantProgressEntryId,
            sectionId: resultantSectionId,
            questionnaire
        });
    }

    function getCurrentProgressEntry(questionnaire) {
        const {progress} = questionnaire;
        const requestedSectionId = progress[progress.length - 1];
        const requestedSectionIndex = progress.indexOf(requestedSectionId);

        const resultantProgressEntryId = requestedSectionIndex;
        const resultantSectionName = requestedSectionId;

        return buildProgressEntry({
            progressEntryId: resultantProgressEntryId,
            sectionId: resultantSectionName,
            questionnaire
        });
    }

    function getProgressEntry(page, questionnaire) {
        if (page.id) {
            return getProgressEntryById(questionnaire, page.id);
        }
        if (page.before) {
            return getPreviousProgressEntry(questionnaire, page.before);
        }
        if (page.sectionId) {
            return getProgressEntryBySectionId(questionnaire, page.sectionId);
        }
        return getCurrentProgressEntry(questionnaire);
    }

    return Object.freeze({
        getProgressEntry,
        getProgressEntryById,
        getProgressEntryBySectionId,
        getPreviousProgressEntry,
        getCurrentProgressEntry
    });
}

module.exports = createProgressEntriesService;
