'use strict';

const {createAppError} = require('../../../../../../middleware/error-handler/createAppError');

async function runTasksSequentially(tasks, runTask) {
    const taskStates = [];

    for (let index = 0; index < tasks.length; index += 1) {
        const task = tasks[index];
        try {
            // eslint-disable-next-line no-await-in-loop
            const result = await runTask(task);
            taskStates.push(result.task);
        } catch (error) {
            throw createAppError({
                name: 'SequentialTaskError',
                message: `Sequential task failed at index ${index}, task id: ${task.id}, task type: ${task.type}`,
                error
            });
        }
    }

    return taskStates;
}

module.exports = runTasksSequentially;
