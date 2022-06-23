'use strict';

function isJsonExpression(value) {
    return value && Array.isArray(value) && typeof value[0] === 'string' && value[0][0] === '|';
}

module.exports = isJsonExpression;
