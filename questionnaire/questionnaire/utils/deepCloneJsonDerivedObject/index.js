'use strict';

const {entries} = Object;
const {isArray} = Array;

function deepClone(value) {
    // must be obj or array
    if (isArray(value)) {
        let i = value.length;
        const newValue = new Array(i);
        let cachedValue;

        // eslint-disable-next-line no-plusplus
        while (i--) {
            cachedValue = value[i];

            newValue[i] =
                typeof cachedValue === 'object' && cachedValue !== null
                    ? deepClone(cachedValue)
                    : cachedValue;
        }

        return newValue;
    }

    // must be obj
    const newValue = {};
    const keyValuePairs = entries(value);
    const len = keyValuePairs.length;
    let i = 0;
    let keyValuePair;
    let cachedValue;

    // eslint-disable-next-line no-plusplus
    for (; i < len; i++) {
        keyValuePair = keyValuePairs[i];
        // eslint-disable-next-line prefer-destructuring
        cachedValue = keyValuePair[1];

        newValue[keyValuePair[0]] =
            typeof cachedValue === 'object' && cachedValue !== null
                ? deepClone(cachedValue)
                : cachedValue;
    }

    return newValue;
}

module.exports = deepClone;
