'use strict';

const isJsonExpression = require('./index');

describe('isJsonExpression', () => {
    describe('Given an array representing a JSON expression', () => {
        it('should return true', () => {
            // prettier-ignore
            const expression = ['|cond',
                ['==', 'foo', 'bar'], 1,
                ['==', 'foo', 'foo'], 2,
                ['==', 'foo', 'biz'], 3
            ];
            const result = isJsonExpression(expression);

            expect(result).toEqual(true);
        });
    });

    describe('Given an array representing data', () => {
        it('should return false', () => {
            // prettier-ignore
            const expression = ['foo', 'bar', 'baz'];
            const result = isJsonExpression(expression);

            expect(result).toEqual(false);
        });
    });
});
