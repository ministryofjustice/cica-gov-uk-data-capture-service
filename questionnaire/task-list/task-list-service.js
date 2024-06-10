'use strict';

const taskStatusPrecedence = [
    'notApplicable',
    'cannotStartYet',
    'completed',
    'incomplete',
    'applicable'
];

const taskAvailableStatus = ['completed', 'incomplete', 'applicable'];

function createTaskListService() {
    function isTaskListSchema({sectionSchema, sectionId} = {}) {
        if (sectionSchema) {
            const pageType = sectionSchema?.meta?.pageType;
            if (pageType === 'task-list') {
                return true;
            }
        }

        // TODO: pass in the sectionSchema, not the sectionId. OR
        // TODO: get schema from sectionId and interrogate the shape instead of the IDs value.
        if (sectionId) {
            if (sectionId === 'p-task-list') {
                return true;
            }
        }

        return false;
    }

    function getInitialPageIdOfTask(taskId, questionnaireDefinition) {
        return questionnaireDefinition.routes.states[taskId].initial;
    }

    function decoratePageId(pageId) {
        if (pageId.startsWith('p--')) {
            return pageId.replace(/^p--/, 'info-');
        }
        return pageId.replace(/^p-/, '');
    }

    function getTaskStatus(taskId, questionnaireDefinition) {
        const taskCompletionStatus =
            questionnaireDefinition.routes.states?.[`${taskId}__completion-status`]
                .currentSectionId;
        const taskApplicabilityStatus =
            questionnaireDefinition.routes.states?.[`${taskId}__applicability-status`]
                .currentSectionId;

        // the lower the index, the higher the precedent.
        if (
            taskStatusPrecedence.indexOf(taskCompletionStatus) <
            taskStatusPrecedence.indexOf(taskApplicabilityStatus)
        ) {
            return taskCompletionStatus;
        }

        return taskApplicabilityStatus;
    }

    function addDataToTaskDefinitions(questionnaireDefinition, taskListSectionsDefinitions) {
        taskListSectionsDefinitions.forEach(taskListSectionDefinition => {
            taskListSectionDefinition.tasks.forEach(task => {
                task.status = getTaskStatus(task.id, questionnaireDefinition);
                if (taskAvailableStatus.includes(task.status)) {
                    task.href = decoratePageId(
                        getInitialPageIdOfTask(task.id, questionnaireDefinition)
                    );
                }
            });
        });
    }

    function updateTaskListSchema(questionnaireDefinition, templateSectionDefinition) {
        const taskListSectionsDefinitions =
            templateSectionDefinition.schema.properties['task-list'].properties.taskListInfo
                .sections;
        addDataToTaskDefinitions(questionnaireDefinition, taskListSectionsDefinitions);
    }

    return Object.freeze({
        isTaskListSchema,
        updateTaskListSchema
    });
}

module.exports = createTaskListService;
