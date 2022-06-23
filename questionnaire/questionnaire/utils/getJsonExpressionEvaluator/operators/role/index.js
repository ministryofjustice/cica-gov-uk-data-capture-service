'use strict';

function any(rule, data, evaluate) {
    const {roles} = data;

    for (let i = 1, len = rule.length; i < len; i += 1) {
        const roleKey = rule[i];
        const roleExpression = roles[roleKey].schema.const;

        if (evaluate(roleExpression, data) === true) {
            return true;
        }
    }

    return false;
}

function all(rule, data, evaluate) {
    const {roles} = data;

    for (let i = 1, len = rule.length; i < len; i += 1) {
        const roleKey = rule[i];
        const roleExpression = roles[roleKey].schema.const;

        if (evaluate(roleExpression, data) !== true) {
            return false;
        }
    }

    return true;
}

module.exports = {
    any,
    all
};
