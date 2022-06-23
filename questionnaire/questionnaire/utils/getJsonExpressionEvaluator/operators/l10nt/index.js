'use strict';

const operatorCond = require('../cond');

function l10nt(rule, data, evaluate) {
    const l10nId = operatorCond(rule, data, evaluate);

    if (l10nId !== null) {
        return `l10nt:${l10nId}{?ns,context,lng}`;
    }

    return l10nId;
}

module.exports = l10nt;
