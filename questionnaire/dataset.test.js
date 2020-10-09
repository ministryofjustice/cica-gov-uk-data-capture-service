'use strict';

const createQuestionnaireService = require('./questionnaire-service');

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

function errorMessageToRegExp(errorMessage) {
    return new RegExp(`^${escapeRegExp(errorMessage)}$`);
}

describe('Dataset resource', () => {
    it('should return a dataset resource', async () => {
        const questionnaireService = createQuestionnaireService({
            logger: () => 'Logged from dataset test',
            createQuestionnaireDAL: () => ({
                getQuestionnaire: () => ({
                    progress: ['page-a', 'page-b', 'page-c', 'page-x', 'page-z'],
                    answers: {
                        'page-a': {
                            foo: 'foo'
                        },
                        'page-b': {
                            bar: 'bar'
                        },
                        'page-c': {
                            baz: 'baz'
                        },
                        'page-x': {
                            biz: true
                        },
                        'page-z': {
                            qux: ['a', 'b', 'c']
                        }
                    }
                })
            })
        });

        const dataset = await questionnaireService.getDataset();

        expect(dataset[0]).toEqual({
            type: 'dataset',
            id: 0,
            attributes: {
                foo: 'foo',
                bar: 'bar',
                baz: 'baz',
                biz: true,
                qux: ['a', 'b', 'c']
            }
        });
    });

    describe('Given multiple sections with the same question id', () => {
        it('should combine answers agaist a single id instance', async () => {
            const questionnaireService = createQuestionnaireService({
                logger: () => 'Logged from dataset test',
                createQuestionnaireDAL: () => ({
                    getQuestionnaire: () => ({
                        progress: ['page-a', 'page-b', 'page-c', 'page-x', 'page-z'],
                        answers: {
                            'page-a': {
                                foo: 'foo'
                            },
                            'page-b': {
                                bar: ['bar1', 'bar2']
                            },
                            'page-c': {
                                bar: ['bar3', 'bar4', 'bar5']
                            },
                            'page-x': {
                                baz: true
                            },
                            'page-z': {
                                bar: ['bar6']
                            }
                        }
                    })
                })
            });

            const dataset = await questionnaireService.getDataset();

            expect(dataset[0]).toEqual({
                type: 'dataset',
                id: 0,
                attributes: {
                    foo: 'foo',
                    bar: ['bar1', 'bar2', 'bar3', 'bar4', 'bar5', 'bar6'],
                    baz: true
                }
            });
        });

        it('should throw if the answers to be combined are of different types', async () => {
            const questionnaireService = createQuestionnaireService({
                logger: () => 'Logged from dataset test',
                createQuestionnaireDAL: () => ({
                    getQuestionnaire: () => ({
                        progress: ['page-a', 'page-b', 'page-x', 'page-z'],
                        answers: {
                            'page-a': {
                                foo: 'foo'
                            },
                            'page-b': {
                                bar: ['bar1', 'bar2']
                            },
                            'page-x': {
                                baz: true
                            },
                            'page-z': {
                                bar: 'bar3'
                            }
                        }
                    })
                })
            });

            const rxExpectedError = errorMessageToRegExp(
                `Question id "bar" found more than once with different answer types. Unable to combine type "array" with "string"`
            );

            await expect(questionnaireService.getDataset()).rejects.toThrow(rxExpectedError);
        });

        it('should throw if the answers to be combined are not arrays', async () => {
            const questionnaireService = createQuestionnaireService({
                logger: () => 'Logged from dataset test',
                createQuestionnaireDAL: () => ({
                    getQuestionnaire: () => ({
                        progress: ['page-a', 'page-b', 'page-x', 'page-z'],
                        answers: {
                            'page-a': {
                                foo: 'foo'
                            },
                            'page-b': {
                                bar: 'bar1'
                            },
                            'page-x': {
                                baz: true
                            },
                            'page-z': {
                                bar: 'bar2'
                            }
                        }
                    })
                })
            });

            const rxExpectedError = errorMessageToRegExp(
                `Question id "bar" found more than once with unsupported type "string". Only arrays can be used to combine answers for a single id`
            );

            await expect(questionnaireService.getDataset()).rejects.toThrow(rxExpectedError);
        });
    });
});
