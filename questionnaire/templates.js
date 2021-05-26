'use strict';

const applicationTemplate = require('q-templates-application');

const applicationTemplateAsJson = JSON.stringify(applicationTemplate);

function getApplicationTemplateCopy() {
    return JSON.parse(applicationTemplateAsJson);
}

module.exports = {
    'sexual-assault': id => ({
        id,
        ...getApplicationTemplateCopy()
    })
};
