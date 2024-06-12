'use strict';

function createTaskListService() {
    function isTaskListSchema(schemaDefinition) {
        const schemaProperties = schemaDefinition?.schema?.properties;
        if (schemaProperties && 'task-list' in schemaProperties) {
            return true;
        }

        // asumed to be a state from the router...
        const state = schemaDefinition;
        
        if (state.id === 'p-task-list') {
            const taskListSchemaProperties = state?.context?.sections[state.id].schema.properties;
            if (taskListSchemaProperties && 'task-list' in taskListSchemaProperties) {
                return true;
            }
        }

        return false;
    }

    function removeRedundantTasks(questionnaireDefinition, taskListSectionsDefinitions) {
        // for each page in the progress,
        // find out which task that belongs to and keep that task
        // otherwise remove the task

        // for each task
        // check if any items in the progress is a state of that task.
        // if no match is found, delete the task.

        const questionnaireTaskStateDefinitions = questionnaireDefinition.routes.states;

        taskListSectionsDefinitions.forEach(taskListSectionDefinition => {
            taskListSectionDefinition.tasks.forEach(task => {
                // find the state corresponding to the task definition.
                const foundState = questionnaireTaskStateDefinitions.find(stateDefinition => {
                    console.log(stateDefinition.id, task.id, stateDefinition.id === task.id);
                    return stateDefinition.id === task.id;
                });
                if (foundState) {
                    // get all possible page ids that are in the task.
                    const taskPageIds = Object.keys(foundState.states);
                    console.log('#########################################################################');
                    console.log({progress: questionnaireDefinition.progress});
                    console.log({taskPageIds});
                    console.log('#########################################################################');
                    // remove the task from the task list definition if it is not in the progress.
                    if (!questionnaireDefinition.progress.some(progressItem => taskPageIds.includes(progressItem))) {
                        console.log({removed: task.id})
                        delete taskListSectionDefinition[task.id];
                    }
                };
            });
        });
    }
    
    function getInitialPageIdOfTask(taskId, questionnaireDefinition) {
        const taskDefinition =  questionnaireDefinition.routes.states.find(state => {
            return state.id === taskId;
        });
        console.log({taskDefinition});
        return taskDefinition.initial
    }

    function getStatusOfTask(taskId, questionnaireDefinition) {
        return questionnaireDefinition.taskStatuses[taskId];
    }

    function addDataToTaskDefinitions(questionnaireDefinition, taskListSectionsDefinitions) {
        taskListSectionsDefinitions.forEach(taskListSectionDefinition => {
            taskListSectionDefinition.tasks.forEach(task => {
                task.href = getInitialPageIdOfTask(task.id, questionnaireDefinition);
                task.status = getStatusOfTask(task.id, questionnaireDefinition);
            });
        });
    }

    function UpdateTaskListSchema(questionnaireDefinition, templateSectionDefinition) {
        const taskListSectionsDefinitions = templateSectionDefinition.schema.properties['task-list'].properties.taskListInfo.sections;
        // removeRedundantTasks(questionnaireDefinition, taskListSectionsDefinitions);
        addDataToTaskDefinitions(questionnaireDefinition, taskListSectionsDefinitions);
    }

    return Object.freeze({
        isTaskListSchema,
        UpdateTaskListSchema
    });
}

module.exports = createTaskListService;