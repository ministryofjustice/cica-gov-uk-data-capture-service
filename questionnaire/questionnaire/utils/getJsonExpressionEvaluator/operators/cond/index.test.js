'use strict';

const jr = require('json-rules')();

const operatorCond = require('./index');

jr.addOperator('|cond', operatorCond, true);

describe('|cond operator', () => {
    describe('Given a series of test/expression pairs', () => {
        it('should return the result associated with the first successful test', () => {
            // prettier-ignore
            const expression = ['|cond',
                ['==', 'foo', 'bar'], 1,
                ['==', 'foo', 'foo'], 2,
                ['==', 'foo', 'biz'], 3
            ];

            const result = jr.evaluate(expression);

            expect(result).toEqual(2);
        });

        it('should allow a default result to be set with a test that always evaluates to true', () => {
            // prettier-ignore
            const expression = ['|cond',
                ['==', 'foo', 'bar'], 1,
                ['==', 'foo', 'baz'], 2,
                ['==', 'foo', 'biz'], 3,
                true, 'some default value'
            ];

            const result = jr.evaluate(expression);

            expect(result).toEqual('some default value');
        });

        it('should return null if no tests pass', () => {
            // prettier-ignore
            const expression = ['|cond',
                ['==', 'foo', 'bar'], 1,
                ['==', 'foo', 'baz'], 2,
                ['==', 'foo', 'biz'], 3
            ];

            const result = jr.evaluate(expression);

            expect(result).toEqual(null);
        });

        it('should throw if there are an odd number of arguments', () => {
            // prettier-ignore
            const expression = ['|cond',
                ['==', 'foo', 'bar'], 1,
                ['==', 'foo', 'baz'],
                ['==', 'foo', 'biz'], 3
            ];

            expect(() => jr.evaluate(expression)).toThrow(
                `JSON expression operator expected an even number of args. Recieved 5. Signature: [cond, result, cond, result, ...]`
            );
        });
    });
});
