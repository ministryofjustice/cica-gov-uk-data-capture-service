'use strict';

function mutateObjectValues(value, valueTransformers, key) {
    if (value && typeof value === 'object') {
        Object.entries(value).forEach(([k, v]) => {
            value[k] = mutateObjectValues(v, valueTransformers, k);
        });

        return value;
    }

    const mutatedValue = valueTransformers.reduce((acc, transformValue) => {
        return transformValue(key, acc);
    }, value);

    return mutatedValue;
}

module.exports = mutateObjectValues;
