'use strict';

const checkInstanceCompatibility = require('../checkTemplateCompatibility');
const createQuestionnaireService = require('../../questionnaire/questionnaire-service');

const routerCompatibility = {
    legacyRouter: {
        versionRange: '>=1.5.0 <2.0.0',
        router: 'legacyRouter'
    },
    linearRouter: {
        versionRange: '>=2.0.0 <3.0.0',
        router: 'linearRouter'
    },
    taskListRouter: {
        versionRange: '>=3.0.0 <13.0.0',
        router: 'taskListRouter'
    }
};

async function main() {
    try {
        console.log('Fetching questionnaire IDs by submission status...');

        const questionnaireService = createQuestionnaireService({
            logger: {},
            ownerId: undefined
        });
        const instanceVersionArray = await questionnaireService.getInflightQuestionnaireVersions();

        console.log('Validating version compatibility...');

        checkInstanceCompatibility(instanceVersionArray, routerCompatibility);

        console.log('All versions are compatible.');
    } catch (error) {
        console.error(`Validation failed: ${error}`);
        process.exit(1); // Exit with a non-zero status to fail the pipeline
    }
}

// Run the main function
main();
