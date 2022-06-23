'use strict';

const jr = require('json-rules')();

const isJsonExpression = require('../isJsonExpression');
const operatorCond = require('./operators/cond');
const operatorL10nt = require('./operators/l10nt');
const operatorRole = require('./operators/role');

jr.addOperator('|cond', operatorCond, true);
jr.addOperator('|l10nt', operatorL10nt, true);
jr.addOperator('|role.any', operatorRole.any, true);
jr.addOperator('|role.all', operatorRole.all, true);

function evaluateJsonExpression(data) {
    return (key, value) => {
        if (isJsonExpression(value)) {
            return jr.evaluate(value, data);
        }

        return value;
    };
}

module.exports = evaluateJsonExpression;
