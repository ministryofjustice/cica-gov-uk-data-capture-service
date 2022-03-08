'use strict';

function mutateValues(value, mapFn, key) {
    if (value && typeof value === 'object') {
        Object.entries(value).forEach(([k, v]) => {
            value[k] = mutateValues(v, mapFn, k);
        });

        return value;
    }

    return mapFn(key, value);
}

module.exports = mutateValues;
