'use strict';

const Ajv = require('ajv');
const AjvErrors = require('ajv-errors');
const VError = require('verror');
const createQRouter = require('q-router');
const uuidv4 = require('uuid/v4');
// const createMessageBusCaller = require('../services/message-bus');
const templates = require('./templates');
const createQuestionaireDAL = require('./questionnaire-dal');

function createQuestionnaireService(spec) {
    const {logger} = spec;
    const db = createQuestionaireDAL({logger});
    const ajv = new Ajv({
        allErrors: true,
        jsonPointers: true,
        format: 'full',
        coerceTypes: true
    }); // options can be passed, e.g. {allErrors: true}

    AjvErrors(ajv);

    async function createQuestionnaire(templateName) {
        if (!(templateName in templates)) {
            const err = Error(`Template "${templateName}" does not exist`);
            err.name = 'HTTPError';
            err.statusCode = 404;
            err.error = '404 Not Found';
            throw err;
        }

        const uuidV4 = uuidv4();
        const questionnaire = templates[templateName](uuidV4);
        await db.createQuestionnaire(uuidV4, questionnaire);

        return {
            data: {
                type: 'questionnaires',
                id: questionnaire.id,
                attributes: questionnaire
            }
        };
    }

    async function getQuestionnaire(questionnaireId) {
        const questionnaire = await db.getQuestionnaire(questionnaireId);

        return questionnaire;
    }

    function timeout(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function retrieveCaseReferenceNumber(questionnaireId, startingDate) {
        // 15 seconds.
        if (Date.now() - startingDate >= 15000) {
            const err = Error(`The upstream server took too long to respond`);
            err.name = 'HTTPError';
            err.statusCode = 504;
            err.error = '504 Gateway Timeout';
            throw err;
        }
        // TODO: this is here temporarily until the message bus queue addition actually
        // kicks things off properly behind the scenes. after that is the case
        // then this comment and the line below (the return) can be remove.
        // return '12\\123456';
        const questionnaire = await getQuestionnaire(questionnaireId);
        const caseReference =
            questionnaire.answers &&
            questionnaire.answers.system &&
            questionnaire.answers.system['case-reference'];
        if (caseReference) {
            return caseReference;
        }

        // check again.
        await timeout(500);
        return retrieveCaseReferenceNumber(questionnaireId, startingDate);
    }

    async function submitQuestionnaire(questionnaire) {
        // const messageBus = createMessageBusCaller({logger});
        try {
            // ## application submission workflow:
            // * the DCS hits the message bus submission queue endpoint with the application (questionnaire) ID.
            // * The application service polls the Message Bus and gets the application (questionnaire) ID.
            // * *application is processed*
            // * Application Service POSTs a case reference number for that application to the DCS.
            // * DCS picks this up and then is able to retrieve the case reference number.
            // send out an email (send request to notification queue)
            // progress to the confirmation page, where the case reference number is displayed.

            // taking advantage of the single-threaded nature of JS here.
            // we want these to complete in written order.
            const submissionResponse = {body: 'Message sent'};
            // const submissionResponse = await messageBus.post('submissionQueue', {
            //     applicationId: questionnaire.id
            // });

            if (submissionResponse.body !== 'Message sent') {
                // throw error: message bus response not correct.
                // what do we do here if the message bus is down?
                // do we hold the questionnaire in a 'holding' table and
                // keep retrying to hit the message bus with these questionnaires until a success?
                // it is not the user's fault that they are unable to submit it at this time.
                return false;
            }

            // check if case reference number is updated yet.
            const caseReferenceNumber = await retrieveCaseReferenceNumber(
                questionnaire.id,
                Date.now()
            );

            if (!caseReferenceNumber) {
                // throw error: case reference number not received from Application Service.
                return false;
            }

            // TODO: this is here temporarily until the message bus queue addition actually
            // kicks things off properly behind the scenes. after that is the case
            // then this comment and the code block below can be remove.
            // eslint-disable-next-line no-use-before-define
            await createAnswers(questionnaire.id, 'system', {
                'case-reference': caseReferenceNumber
            });

            // returns `true` if successfully saved to the `questionnaire_submitted` table.
            const questionnaireSubmitted = await db.createQuestionnaireSubmitted(questionnaire);

            if (questionnaireSubmitted !== true) {
                // throw error: unable to save questionnaire.
                // what is the workflow for retrying here?
                return false;
            }

            // const questionAnswers = questionnaire.answers;
            // const applicantEmailAddress =
            //     questionAnswers['p-applicant-enter-your-email-address'][
            //         'q-applicant-email-address'
            //     ];
            // const applicantName = `${
            //     questionAnswers['p-applicant-enter-your-name']['q-applicant-name-title']
            // } ${questionAnswers['p-applicant-enter-your-name']['q-applicant-name-firstname']} ${
            //     questionAnswers['p-applicant-enter-your-name']['q-applicant-name-lastname']
            // }`;

            const notificationResponse = {body: 'Message sent'};
            // const notificationResponse = await messageBus.post('NotificationQueue', {
            //     templateId: '1ddf1d87-09b3-4a2b-aa27-d73823f4a886',
            //     email_address: applicantEmailAddress,
            //     personalisation: {
            //         email_address: applicantEmailAddress,
            //         applicant_name: applicantName,
            //         case_reference: caseReferenceNumber
            //     }
            // });

            if (notificationResponse.body === 'Message sent') {
                // throw error: message bus response not correct.
                // retry.
                return false;
            }

            // if we are here, then that means the questionnaire is updated with
            // a case reference number, it is saved to the `questionnaire_submitted`
            // table, and a request was sent to the notification queue.
        } catch (err) {
            throw err;
        }
        return true;
    }

    function getSection(sectionId, qRouter) {
        // TODO: this validation should be covered by express-openapi-validator
        // if (!validSectionIdFormat(sectionId)) {
        //     return undefined;
        // }
        let section;

        // TODO: change "system" in q-definitions to "p--system" and remove this check
        if (sectionId === 'system') {
            // TODO: "system" shouldn't be added to "user progress". We'll need to bodge this for the moment
            // TODO: the bodge involves bypassing the router!!
            const currentSection = qRouter.current();

            // TODO: bodge... simulate a response from the router
            section = {
                id: 'system',
                // steal the context (questionnaire) from the current section
                context: currentSection.context
            };
        } else {
            section = qRouter.current(sectionId);

            if (!section) {
                section = qRouter.current(`p--${sectionId}`);

                if (!section) {
                    throw new VError(`Section "${sectionId}" not found`);
                }
            }
        }

        return section;
    }

    function convertErrorsToJsonApiFormat(validationErrors) {
        const convertedErrors = {
            errors: []
        };
        validationErrors.forEach(error => {
            // in our case, dataPath is always either blank (empty string), or the name of the
            // schema property with a preceding slash (e.g. "/q--when-was-the-crime-reported-to-police").
            // if the dataPath is an empty string, then get the value of missingProperty (missingProperty
            //  is populated when a "required" property is not present.
            let invalidSchemaPropertyName;
            try {
                invalidSchemaPropertyName = error.params.errors[0].params.missingProperty;
            } catch (err) {
                invalidSchemaPropertyName = error.dataPath.replace('/', '');
            }

            // this is a more human-friendly error message that will be displayed on the frontend.
            let errorMessage;
            try {
                errorMessage = error.message;
            } catch (err) {
                // ... if that doesn't exist, then use the AJV error message.
                errorMessage = error.params.errors[0].message;
            }

            // create the JSON API error message.
            const convertedError = {
                title: invalidSchemaPropertyName,
                detail: errorMessage
            };
            // add to the list of JSON API error messages.
            convertedErrors.errors.push(convertedError);
        });

        return convertedErrors;
    }

    async function createAnswers(questionnaireId, sectionName, answers) {
        // TODO: throw if more than one request to create same answers

        let answerResource;

        try {
            // 1 - load the questionnaire
            const result = await getQuestionnaire(questionnaireId);

            // 2 - get questionnaire instance
            const {questionnaire} = result.rows[0];

            let sectionId;
            if (questionnaire.sections[sectionName]) {
                sectionId = sectionName; // for `system`.
            } else if (questionnaire.sections[`p-${sectionName}`]) {
                sectionId = `p-${sectionName}`;
            } else if (questionnaire.sections[`p--${sectionName}`]) {
                sectionId = `p--${sectionName}`;
            }

            // 3 - is the section allowed to be posted to e.g. is it in their progress
            const qRouter = createQRouter(questionnaire);
            const section = getSection(sectionId, qRouter);
            const currentSection = qRouter.current();

            // 4 - Section is available. Validate the answers against it
            const sectionSchema = questionnaire.sections[section.id];
            const validate = ajv.compile(sectionSchema);
            const valid = validate(answers);
            let errors;
            let errorsInclude;
            let errorsRelationship;
            let sectionInclude;
            let sectionRelationship;
            let nextSection;

            // no valid! create the error include, and the current section
            // include to be returned.
            if (!valid) {
                // TODO: Refactor errorhandler to accept a logger and move this in to it
                logger.error({err: validate.errors}, 'SCHEMA VALIDATION FAILED');
                errors = convertErrorsToJsonApiFormat(validate.errors, sectionSchema);

                errorsInclude = {
                    type: 'errors',
                    attributes: errors.errors
                };
                errorsRelationship = {
                    links: {
                        related: `/api/v1/questionnaires/${questionnaireId}/sections/${sectionId}`
                    },
                    data: {
                        type: 'errors'
                    }
                };

                sectionInclude = {
                    type: 'sections',
                    id: sectionId,
                    attributes: questionnaire.sections[sectionId]
                };
                sectionRelationship = {
                    links: {
                        self: `/api/v1/questionnaires/${questionnaireId}/sections/${sectionId}`
                    },
                    data: {
                        type: 'sections',
                        id: sectionId
                    }
                };
                // valid! Create the next section include to be returned.
            } else {
                try {
                    nextSection = qRouter.next(answers, section.id);

                    // if (nextSection !== false) {
                    sectionInclude = {
                        type: 'sections',
                        attributes: {
                            id: nextSection.id
                        }
                    };
                    sectionRelationship = {
                        links: {
                            next: `/api/v1/questionnaires/${questionnaireId}/sections/${nextSection.id}`
                        },
                        data: {
                            type: 'sections',
                            id: nextSection.id
                        }
                    };
                    // }
                } catch (err) {
                    nextSection = qRouter.current();
                }
            }

            // 5 - If we're here all is good
            // Pass the answers to the router which will update the context (questionnaire) with these answers.
            let answeredQuestionnaire = currentSection.context;

            // TODO: need to bodge this for "system" id (see getSection for more bodging). Bypass the router again.
            if (section.id === 'system') {
                currentSection.context.answers.system = answers;
                answeredQuestionnaire = currentSection.context;
                // TODO: ^^ this is end of bodge
            } else if (nextSection) {
                answeredQuestionnaire = nextSection.context;
            }
            // Store the updated questionnaire object
            await db.updateQuestionnaire(questionnaireId, answeredQuestionnaire);
            if (sectionId === answeredQuestionnaire.routes.summary) {
                const submissionResponse = await submitQuestionnaire(answeredQuestionnaire);
                if (!submissionResponse) {
                    const err = Error(`The server cannot handle the request`);
                    err.name = 'HTTPError';
                    err.statusCode = 503;
                    err.error = '503 Service Unavailable';
                    throw err;
                }
            }

            const included = [];
            if (sectionInclude) {
                included.push(sectionInclude);
            }
            // validation errors.
            if (errorsInclude) {
                included.push(errorsInclude);
            }

            const meta = {
                initial: questionnaire.routes.initial,
                final: !!(
                    questionnaire.routes.states[sectionId] &&
                    questionnaire.routes.states[sectionId].type &&
                    questionnaire.routes.states[sectionId].type === 'final'
                ),
                summary: questionnaire.routes.summary
            };

            answerResource = {
                data: [
                    {
                        type: 'answers',
                        id: section.id,
                        attributes: answers,
                        relationships: {
                            section: sectionRelationship,
                            errors: errorsRelationship
                        }
                    }
                ],
                included,
                meta
            };
        } catch (err) {
            // re-throw for the moment
            // central error handler will collect it
            throw err;
        }

        return answerResource;
    }

    async function updateAnswers(questionnaireId, sectionName, answers) {
        return createAnswers(questionnaireId, sectionName, answers);
    }

    return Object.freeze({
        createQuestionnaire,
        createAnswers,
        updateAnswers,
        getQuestionnaire,
        submitQuestionnaire
    });
}

module.exports = createQuestionnaireService;
