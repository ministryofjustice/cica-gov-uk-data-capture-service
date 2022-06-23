'use strict';

const jr = require('json-rules')();

const operatorL10nt = require('./index');

jr.addOperator('|l10nt', operatorL10nt, true);

describe('|l10nt operator', () => {
    describe('Given a series of test/expression pairs', () => {
        it('should return the l10n id associated with the first successful test', () => {
            // prettier-ignore
            const expression = ['|l10nt',
                ['==', 'foo', 'bar'], 'some.translation.id.a',
                ['==', 'foo', 'foo'], 'some.translation.id.b',
                ['==', 'foo', 'biz'], 'some.translation.id.c',
            ];

            const result = jr.evaluate(expression);

            expect(result).toEqual('l10nt:some.translation.id.b{?ns,context,lng}');
        });

        it('should allow a default result to be set with a test that always evaluates to true', () => {
            // prettier-ignore
            const expression = ['|l10nt',
                ['==', 'foo', 'bar'], 'some.translation.id.a',
                ['==', 'foo', 'baz'], 'some.translation.id.b',
                ['==', 'foo', 'biz'], 'some.translation.id.c',
                true, 'some.default.translation.id'
            ];

            const result = jr.evaluate(expression);

            expect(result).toEqual('l10nt:some.default.translation.id{?ns,context,lng}');
        });

        it('should return null if no tests pass', () => {
            // prettier-ignore
            const expression = ['|l10nt',
                ['==', 'foo', 'bar'], 'some.translation.id.a',
                ['==', 'foo', 'baz'], 'some.translation.id.b',
                ['==', 'foo', 'biz'], 'some.translation.id.c'
            ];

            const result = jr.evaluate(expression);

            expect(result).toEqual(null);
        });

        it('should throw if there are an odd number of arguments', () => {
            // prettier-ignore
            const expression = ['|l10nt',
                ['==', 'foo', 'bar'], 'some.translation.id.a',
                ['==', 'foo', 'baz'],
                ['==', 'foo', 'biz'], 'some.translation.id.c'
            ];

            expect(() => jr.evaluate(expression)).toThrow(
                `JSON expression operator expected an even number of args. Recieved 5. Signature: [cond, result, cond, result, ...]`
            );
        });
    });
});
