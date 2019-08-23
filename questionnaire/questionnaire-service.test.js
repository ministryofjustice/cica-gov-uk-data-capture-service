'use strict';

const createQuestionnaireService = require('./questionnaire-service');

describe('Questionnaire Service', () => {
    let questionnaireService;
    beforeEach(() => {
        questionnaireService = createQuestionnaireService({logger: () => {}});
    });
    describe('Should resolve pipes in a section schema', () => {
        it('When replacements are in the answers object', () => {
            // eslint-disable-next-line global-require
            const questionnaireInstance = require('./test-fixtures/questionnaireWithCRNandNameAnswers');
            const section = questionnaireInstance.sections['p--confirmation'];
            const expected = {
                $schema: 'http://json-schema.org/draft-07/schema#',
                type: 'object',
                additionalProperties: false,
                properties: {
                    confirmation: {
                        description:
                            '\n                    {{ govukPanel({\n                        titleText: "Application submitted",\n                        html: "<p>Your reference number is <strong>19\\654321</strong></p><p>We have sent a confirmation email to <strong>mr.test.email@dcs-test.com</strong></p>"\n                    }) }}\n                    \n                    <p class="govuk-body-l">Thank you for submitting your application.</p>\n                    <h2 class="govuk-heading-m">What happens next</h2>\n                    <p class="govuk-body">We will:</p>\n                    <ul class="govuk-list govuk-list--bullet">\n                    <li>ask the police for evidence</li>\n                    <li>use the police evidence to make a decision</li>\n                    <li>send our decision letter by post</li>\n                    </ul>\n                    <p class="govuk-body">We will usually make a decision within 4 months.</p>\n                    {{ govukWarningText({\n                        text: "You must inform us immediately if any of the information you have given us changes, especially your address, telephone number or email address.",\n                        iconFallbackText: "Warning"\n                    }) }}\n                    <p class="govuk-body">You can contact our Customer Service Centre on 0300 003 3601. Select option 8 when the call is answered.</p>\n                    <h2 class="govuk-heading-m">Help us improve this service</h2>\n                    <p class="govuk-body">You can complete a short survey to help us improve this service.</p>\n                    <p class="govuk-body">It does not ask for any details about your case, and has no effect on your application.</p>\n                    <p class="govuk-body"><a href="https://www.surveymonkey.com/r/Privatebetafeedback">Tell us what you think of our service</a> (takes 30 seconds)</p>\n            '
                    }
                }
            };
            const actual = questionnaireService.resolvePipesInSection(
                questionnaireInstance,
                section
            );
            expect(actual).toEqual(expected);
        });

        it('When replacements are not in the answers object', () => {
            // eslint-disable-next-line global-require
            const questionnaireInstance = require('./test-fixtures/questionnaireWithoutCRNandNameAnswers');
            const section = questionnaireInstance.sections['p--confirmation'];
            const expected = {
                $schema: 'http://json-schema.org/draft-07/schema#',
                type: 'object',
                additionalProperties: false,
                properties: {
                    confirmation: {
                        description:
                            '\n                    {{ govukPanel({\n                        titleText: "Application submitted",\n                        html: "<p>Your reference number is <strong></strong></p><p>We have sent a confirmation email to <strong></strong></p>"\n                    }) }}\n                    \n                    <p class="govuk-body-l">Thank you for submitting your application.</p>\n                    <h2 class="govuk-heading-m">What happens next</h2>\n                    <p class="govuk-body">We will:</p>\n                    <ul class="govuk-list govuk-list--bullet">\n                    <li>ask the police for evidence</li>\n                    <li>use the police evidence to make a decision</li>\n                    <li>send our decision letter by post</li>\n                    </ul>\n                    <p class="govuk-body">We will usually make a decision within 4 months.</p>\n                    {{ govukWarningText({\n                        text: "You must inform us immediately if any of the information you have given us changes, especially your address, telephone number or email address.",\n                        iconFallbackText: "Warning"\n                    }) }}\n                    <p class="govuk-body">You can contact our Customer Service Centre on 0300 003 3601. Select option 8 when the call is answered.</p>\n                    <h2 class="govuk-heading-m">Help us improve this service</h2>\n                    <p class="govuk-body">You can complete a short survey to help us improve this service.</p>\n                    <p class="govuk-body">It does not ask for any details about your case, and has no effect on your application.</p>\n                    <p class="govuk-body"><a href="https://www.surveymonkey.com/r/Privatebetafeedback">Tell us what you think of our service</a> (takes 30 seconds)</p>\n            '
                    }
                }
            };
            const actual = questionnaireService.resolvePipesInSection(
                questionnaireInstance,
                section
            );
            expect(actual).toEqual(expected);
        });
    });
});
