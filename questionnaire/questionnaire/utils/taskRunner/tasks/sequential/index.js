'use strict';

const VError = require('verror');

async function runTasksSequentially(taskDefinitions, run) {
    const taskStates = [];

    for (let i = 0; i < taskDefinitions.length; i += 1) {
        const taskDefinition = taskDefinitions[i];
        try {
            // eslint-disable-next-line no-await-in-loop
            const result = await run(taskDefinition);
            taskStates.push(result.task);
        } catch (err) {
            throw new VError(err, `Sequential task failed: ${taskDefinition.type}`);
        }
    }

    return taskStates;
}

module.exports = runTasksSequentially;
