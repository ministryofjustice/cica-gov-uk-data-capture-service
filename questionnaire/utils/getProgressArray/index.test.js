'use strict';

const getProgress = require('./index');

const singleTaskTemplate = {
    type: 'apply-for-compensation',
    version: 'foobar',
    sections: {},
    routes: {
        initial: 'old-routes',
        referrer: '',
        summary: ['old-routes'],
        confirmation: 'old-routes',
        states: {}
    },
    answers: {},
    onSubmit: {},
    progress: ['old-routes'],
    taxonomies: {},
    meta: {},
    attributes: {}
};
const multiTaskTemplate = {
    id: 'foobar',
    meta: {},
    type: 'apply-for-compensation',
    routes: {
        id: 'foobar',
        type: 'parallel',
        states: {
            A: {
                id: 'A',
                states: {
                    'p-page-one': {}
                },
                initial: 'p-page-one',
                progress: ['p-page-one'],
                currentSectionId: 'p-page-one'
            },
            B: {
                id: 'B',
                states: {
                    'p-page-two': {}
                },
                initial: 'p-page-two',
                progress: ['p-page-two'],
                currentSectionId: 'p-page-two'
            },
            C: {
                id: 'C',
                states: {
                    'p-page-three': {}
                },
                initial: 'p-page-three',
                progress: ['p-page-three'],
                currentSectionId: 'p-page-three'
            }
        },
        summary: ['foobar'],
        referrer: 'foobar',
        confirmation: 'foobar'
    },
    answers: {},
    version: 'foobar',
    sections: {},
    attributes: {},
    taxonomies: {},
    currentSectionId: 'foobar'
};

describe('getProgress', () => {
    it('should return a progress array when passed a single-task template', () => {
        expect(getProgress(singleTaskTemplate)).toEqual(['old-routes']);
    });

    it('should return a progress array when passed a multi-task template', () => {
        expect(getProgress(multiTaskTemplate)).toEqual([
            'p-page-one',
            'p-page-two',
            'p-page-three'
        ]);
    });

    it('should filter states that are not valid page Ids', () => {
        multiTaskTemplate.routes.states.C.progress[0] = 'complete';
        expect(getProgress(multiTaskTemplate)).toEqual(['p-page-one', 'p-page-two']);
    });
});
