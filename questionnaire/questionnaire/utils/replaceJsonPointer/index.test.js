'use strict';

const replaceJsonPointer = require('./index');

describe('replace-json-pointer', () => {
    it('should replace a single JSON pointer in a string', () => {
        const content = 'foo ||/foo/bar|| baz';
        const result = replaceJsonPointer(content, {
            foo: {
                bar: 'bar'
            }
        });

        expect(result).toEqual('foo bar baz');
    });

    it('should replace multiple JSON pointers in a string', () => {
        // https://tools.ietf.org/html/rfc6901#page-5
        const pointers = [
            '/foo',
            '/',
            '/a~1b',
            '/c%d',
            '/e^f',
            '/g|h',
            '/i\\j',
            '/k"l',
            '/ ',
            '/m~0n'
        ];
        const dataPrimatives = {
            foo: 'foo',
            '': 0,
            'a/b': 1,
            'c%d': 2,
            'e^f': 3,
            'g|h': 4,
            'i\\j': 5,
            'k"l': true,
            ' ': false,
            'm~n': null
        };

        const content = `||${pointers.join('||, ||')}||`;
        const result = replaceJsonPointer(content, dataPrimatives);

        expect(result).toEqual('foo, 0, 1, 2, 3, 4, 5, true, false, null');
    });

    it('should return the JSON pointer if it maps to no value', () => {
        const content = 'foo ||/foo/does-not-exist|| baz';
        const result = replaceJsonPointer(content, {
            foo: {
                bar: 'bar'
            }
        });
        expect(result).toBe(content);
    });

    it('should throw if the JSON pointer maps to a non-primitive value e.g. Object/Array', () => {
        const content = 'foo ||/foo/bar|| baz';

        expect(() => {
            replaceJsonPointer(content, {
                foo: {
                    bar: ['bar']
                }
            });
        }).toThrow(
            'Only primitive values are supported. JSON pointer ( /foo/bar ) references a non primitive value ( ["bar"] )'
        );
    });
});
