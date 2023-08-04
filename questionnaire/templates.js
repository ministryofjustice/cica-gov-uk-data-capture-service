'use strict';

const applicationTemplate = require('q-templates-application');

const applicationTemplateAsJson = JSON.stringify(applicationTemplate);

function getApplicationTemplateCopy() {
    return JSON.parse(applicationTemplateAsJson);
}

// function modifyTemplateToHaveOneQuestion(template) {
//     const {routes} = template;
//     const modifiedRoutes = {
//         initial: routes.initial,
//         referrer: routes.referrer,
//         summary: [routes.summary[0]],
//         confirmation: routes.confirmation,
//         states: {
//             'p--new-or-existing-application': {
//                 on: {
//                     ANSWER: [
//                         {
//                             target: 'p--check-your-answers',
//                             cond: [
//                                 '==',
//                                 '$.answers.p--new-or-existing-application.q--new-or-existing-application',
//                                 'existing'
//                             ]
//                         },
//                         {target: 'p--check-your-answers'}
//                     ]
//                 }
//             },
//             'p--check-your-answers': {
//                 on: {
//                     ANSWER: [
//                         {
//                             target: 'p-applicant-declaration'
//                         }
//                     ]
//                 }
//             },
//             'p-applicant-declaration': {
//                 on: {
//                     ANSWER: [
//                         {
//                             target: 'p--confirmation'
//                         }
//                     ]
//                 }
//             },
//             'p--confirmation': {
//                 type: 'final'
//             }
//         }
//     };
//     template.routes = modifiedRoutes;

//     const defaultAnswers = {
//         system: {
//             'case-reference': '11\\DEFAULT'
//         },
//         'p-applicant-confirmation-method': {
//             'q-applicant-enter-your-email-address':
//                 'DEFAULT@aad319c0-4912-440a-bf44-708530c3959c.gov.uk'
//         }
//     };

//     template.answers = defaultAnswers;

//     const confirmationSection = template.sections['p--confirmation'];
//     const confirmationContent =
//         confirmationSection.l10n.translations[0].resources.confirmation.description.adult;

//     delete confirmationSection.l10n;
//     template.sections[
//         'p--confirmation'
//     ].schema.properties.confirmation.description = confirmationContent;

//     template.onSubmit = {
//         id: 'task0',
//         type: 'sequential',
//         data: [
//             {
//                 id: 'task1',
//                 type: 'updateCaseRefTestTask',
//                 data: {
//                     questionnaire: '$.questionnaireDef',
//                     logger: '$.logger'
//                 }
//             }
//         ]
//     };

//     return template;
// }

// eslint-disable-next-line no-unused-vars
function modifyTemplateToIncludeTaskDefinition(template) {
    // This was taken from Jennifer's branch
    template.onSubmit = {
        id: 'task0',
        type: 'sequential',
        data: [
            {
                id: 'task1',
                type: 'generateReferenceNumber',
                data: {
                    questionnaire: '$.questionnaireDef',
                    logger: '$.logger'
                }
            },
            {
                id: 'task2',
                type: 'transformAndUpload',
                data: {
                    questionnaireDef: '$.questionnaireDef',
                    logger: '$.logger'
                }
            },
            {
                id: 'task3',
                type: 'sendSubmissionMessageToSQS',
                data: {
                    questionnaire: '$.questionnaireDef',
                    logger: '$.logger'
                }
            },
            {
                id: 'task4',
                type: 'sendNotifyMessageToSQS',
                data: {
                    questionnaire: '$.questionnaireDef',
                    logger: '$.logger'
                }
            }
        ]
    };

    return template;
}

function modifyTemplate(template) {
    // Use the next line to quickly test the trigger via CW. COMMENT OUT WHEN FINISHED.
    // Allows for quick testing of task trigger
    // let modifiedTemplate;
    // modifiedTemplate = modifyTemplateToHaveOneQuestion(template);

    // Uncomment the next line when all tasks in the definition are ready
    const modifiedTemplate = modifyTemplateToIncludeTaskDefinition(template);

    return modifiedTemplate;
}

module.exports = {
    'sexual-assault': id => ({
        id,
        // Rather than add things to the template and have to re-install it,
        // We'll modify the template here. Once things are working, we can
        // move any modifications in to the actual template properly
        ...modifyTemplate(getApplicationTemplateCopy())
    })
};
