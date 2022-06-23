'use strict';

function cond(rule, data, evaluate) {
    const argsCount = rule.length - 1;
    const hasEvenNumberOfArgs = argsCount % 2 === 0;

    if (hasEvenNumberOfArgs === true) {
        for (let i = 1, len = rule.length; i < len; i += 2) {
            const condition = rule[i];
            const result = rule[i + 1];

            if (evaluate(condition, data) === true) {
                return result;
            }
        }

        return null;
    }

    throw Error(
        `JSON expression operator expected an even number of args. Recieved ${argsCount}. Signature: [cond, result, cond, result, ...]`
    );
}

module.exports = cond;
