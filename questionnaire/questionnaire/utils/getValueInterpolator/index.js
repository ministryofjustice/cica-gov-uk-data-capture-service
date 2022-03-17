'use strict';

const replaceJsonPointer = require('../replaceJsonPointer');

function getValueInterpolator(data) {
    return (key, value) => {
        if (typeof value === 'string') {
            return replaceJsonPointer(value, data);
        }

        return value;
    };
}

module.exports = getValueInterpolator;
