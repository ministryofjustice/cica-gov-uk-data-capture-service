'use strict';

const defaults = {};
defaults.createQuestionnaireDAL = require('../questionnaire-dal');

function createTaskListService() {
    function getTaskListSchema(sectionSchema, questionnaireDefinition) {
        const newSectionSchema = {...sectionSchema};
        newSectionSchema.properties['task-list'].properties.taskListInfo.taskListData = [
            {
                title: 'Tell us about your application',
                id: 's-about-application',
                tasks: [
                    {
                        id: 't-about-application',
                        title: 'About your application',
                        hint: 'This is a hint',
                        href: '/apply/applicant-who-are-you-applying-for',
                        status: 'completed'
                    }
                ]
            },
            {
                title: 'Provide your details',
                id: 's_applicant_details',
                tasks: [
                    {
                        id: 't_applicant_personal-details',
                        title: 'Your details',
                        href: '/apply/info-context-applicant-details',
                        status: 'incomplete'
                    },
                    {
                        id: 't_applicant_residency-and-nationality',
                        title: 'Your residency and nationality',
                        // href: '/apply/info-context-residency-and-nationality',
                        status: 'cannotStartYet'
                    }
                ]
            },
            {
                title: 'Tell us about the person who died',
                id: 's_deceased_details',
                tasks: [
                    {
                        id: 't_deceased_relationship-to-applicant',
                        title: 'Your relationship to the person who died',
                        // href: '/apply/info-context-relationship-to-deceased',
                        status: {
                            text: 'custom status',
                            classes: 'govuk-task-list__status--cannot-start-yet'
                        }
                    },
                    {
                        id: 't_deceased_personal-details',
                        title: 'About the person who died',
                        // href: '/apply/info-context-deceased-details',
                        status: 'cannotStartYet'
                    },
                    {
                        id: 't_deceased_funeral-costs',
                        title: 'Funeral costs',
                        // href: '/apply/info-context-funeral-costs',
                        status: 'cannotStartYet'
                    }
                ]
            },
            {
                title: 'Provide details of the crime and offender',
                id: 's_offender_details',
                tasks: [
                    {
                        id: 't_offender_about-the-crime', // t-about-the-crime ?
                        title: 'About the crime',
                        // href: '/apply/info-before-you-continue',
                        status: 'cannotStartYet'
                    },
                    {
                        id: 't_offender_about-the-offender', // t-about-the-offender ?
                        title: 'About the offender',
                        // href: '/apply/info-context-offender',
                        status: 'cannotStartYet'
                    }
                ]
            },
            {
                title: 'Provide details of other compensation applications',
                id: 's-other-compensation-details',
                tasks: [
                    {
                        id: 't-other-compensation-details',
                        title: 'Other compensation',
                        // href: '/apply/info-context-compensation',
                        status: 'cannotStartYet'
                    }
                ]
            },
            {
                title: 'Check your answers and submit',
                id: 's-check-your-answers',
                tasks: [
                    {
                        id: 't-check-your-answers',
                        title: 'Check your answers and submit application',
                        // href: '/apply/check-your-answers',
                        status: 'cannotStartYet'
                    }
                ]
            }
        ];

        return newSectionSchema;
    }

    return Object.freeze({
        getTaskListSchema
    });
}

module.exports = createTaskListService;
