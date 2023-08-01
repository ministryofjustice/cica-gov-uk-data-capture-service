'use strict';

// eslint-disable-next-line import/no-extraneous-dependencies
const $RefParser = require('json-schema-ref-parser');
const fs = require('fs');
// eslint-disable-next-line import/no-extraneous-dependencies
const prettier = require('prettier');
const conf = require('../../.prettierrc.js');

(async () => {
    const dereferencedContract = await $RefParser.dereference('openapi/openapi-admin.json');
    const contractJson = JSON.stringify(dereferencedContract, null, 4);
    const formattedContractJson = prettier.format(contractJson, {
        ...conf,
        parser: 'json',
        endOfLine: 'crlf'
    });

    fs.writeFile('openapi/openapi-admin.json', formattedContractJson, err => {
        // throws an error, you could also catch it here
        if (err) {
            throw err;
        }

        // success case, the file was saved
        // eslint-disable-next-line
        console.log('Admin dereferenced contract saved');
    });
})();
