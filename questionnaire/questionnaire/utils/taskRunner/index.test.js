'use strict';

const {createTaskRunner} = require('./index');

describe('Task Runner', () => {
    describe('createTaskRunner', () => {
        it('should run a task', async () => {
            const taskRunner = createTaskRunner({
                taskImplementations: {
                    simpleTaskFactory: async () => 'foo'
                }
            });

            const {task} = await taskRunner.run({
                id: 'task1',
                type: 'simpleTaskFactory'
            });

            expect(task.id).toEqual('task1');
            expect(task.status).toEqual('succeeded');
            expect(task.result).toEqual('foo');
        });

        it('should return a run context', async () => {
            const taskRunner = createTaskRunner({
                taskImplementations: {
                    simpleTaskFactory: async () => 'foo'
                }
            });
            const {context} = await taskRunner.run({
                id: 'task1',
                type: 'simpleTaskFactory'
            });
            const {task1} = context;

            expect(task1.id).toEqual('task1');
            expect(task1.status).toEqual('succeeded');
            expect(task1.result).toEqual('foo');
        });

        it('should allow access to the run context', async () => {
            const taskRunner = createTaskRunner({
                taskImplementations: {
                    simpleTaskFactory: async data => data.baz
                },
                context: {
                    foo: 'bar'
                }
            });

            const {task} = await taskRunner.run({
                id: 'task1',
                type: 'simpleTaskFactory',
                data: {
                    baz: '$.foo'
                }
            });

            expect(task.id).toEqual('task1');
            expect(task.status).toEqual('succeeded');
            expect(task.result).toEqual('bar');
        });

        it('should return an error if the task fails', async () => {
            let task;

            try {
                const taskRunner = createTaskRunner({
                    taskImplementations: {
                        simpleTaskFactory: async () => {
                            throw Error('foo');
                        }
                    }
                });

                await taskRunner.run({
                    id: 'task1',
                    type: 'simpleTaskFactory',
                    retries: 0
                });
            } catch (err) {
                ({task} = err);
            }

            expect(task.id).toEqual('task1');
            expect(task.status).toEqual('failed');
            expect(task.result.message).toEqual('foo');
        });

        it('should retry the task if it fails', async () => {
            const retries = 3;
            let taskAttempts = 0;

            try {
                const taskRunner = createTaskRunner({
                    taskImplementations: {
                        simpleTaskFactory: async () => {
                            taskAttempts += 1;
                            throw Error('foo');
                        }
                    }
                });

                await taskRunner.run({
                    id: 'task1',
                    type: 'simpleTaskFactory',
                    retries
                });
            } catch (err) {
                // no catch required
            }

            const expectedTaskAttempts = 1 + retries;

            expect(taskAttempts).toEqual(expectedTaskAttempts);
        });

        it('should allow 0 retries', async () => {
            const retries = 0;
            let taskAttempts = 0;

            try {
                const taskRunner = createTaskRunner({
                    taskImplementations: {
                        simpleTaskFactory: async () => {
                            taskAttempts += 1;
                            throw Error('foo');
                        }
                    }
                });

                await taskRunner.run({
                    id: 'task1',
                    type: 'simpleTaskFactory',
                    retries
                });
            } catch (err) {
                // no catch required
            }

            expect(taskAttempts).toEqual(1);
        });

        it('should stop retrying the task if it succeeds', async () => {
            const retries = 10;
            const successfulTaskAttempt = 3;
            let taskAttempts = 0;

            try {
                const taskRunner = createTaskRunner({
                    taskImplementations: {
                        simpleTaskFactory: async () => {
                            taskAttempts += 1;

                            if (taskAttempts === successfulTaskAttempt) {
                                return 'foo';
                            }

                            throw Error('bar');
                        }
                    }
                });

                await taskRunner.run({
                    id: 'task1',
                    type: 'simpleTaskFactory',
                    retries
                });
            } catch (err) {
                // no catch required
            }

            expect(taskAttempts).toEqual(successfulTaskAttempt);
        });
    });
});
