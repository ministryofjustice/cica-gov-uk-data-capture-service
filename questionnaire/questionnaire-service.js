'use strict';

const Ajv = require('ajv');
const AjvErrors = require('ajv-errors');
const VError = require('verror');
const createQRouter = require('q-router');
const uuidv4 = require('uuid/v4');
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
            // Ensure the requested sectionId is available
            section = qRouter.current(sectionId);

            if (!section) {
                throw new VError(`Section "${sectionId}" not found`);
            }
        }

        return section;
    }

    async function createAnswers(questionnaireId, sectionId, answers) {
        // TODO: throw if more than one request to create same answers

        // Make a copy of the supplied answers. These will be returned if they fail validation
        const rawAnswers = JSON.parse(JSON.stringify(answers));
        let answerResource;

        try {
            // 1 - load the questionnaire
            const result = await getQuestionnaire(questionnaireId);

            // 2 - get questionnaire instance
            const {questionnaire} = result.rows[0];

            // 3 - is the section allowed to be posted to e.g. is it in their progress
            const qRouter = createQRouter(questionnaire);
            const section = getSection(sectionId, qRouter);

            // 4 - Section is available. Validate the answers against it
            const sectionSchema = questionnaire.sections[section.id];
            const validate = ajv.compile(sectionSchema);
            const valid = validate(answers);

            if (!valid) {
                // TODO: Refactor errorhandler to accept a logger and move this in to it
                logger.error({err: validate.errors}, 'SCHEMA VALIDATION FAILED');

                const validationError = new VError({
                    name: 'JSONSchemaValidationError',
                    info: {
                        schema: sectionSchema,
                        answers: rawAnswers,
                        schemaErrors: validate.errors
                    }
                });

                throw validationError;
            }

            // 5 - If we're here all is good
            // Pass the answers to the router which will update the context (questionnaire) with these answers.
            let answeredQuestionnaire;

            // TODO: need to bodge this for "system" id (see getSection for more bodging). Bypass the router again.
            if (section.id === 'system') {
                const currentSection = qRouter.current();
                currentSection.context.answers.system = answers;
                answeredQuestionnaire = currentSection.context;
                // TODO: ^^ this is end of bodge
            } else {
                const nextSection = qRouter.next(answers, section.id);
                answeredQuestionnaire = nextSection.context;
            }

            // Store the updated questionnaire object
            await db.updateQuestionnaire(questionnaireId, answeredQuestionnaire);

            answerResource = {
                data: {
                    type: 'answers',
                    id: section.id,
                    attributes: answers
                }
            };
        } catch (err) {
            // re-throw for the moment
            // central error handler will collect it
            throw err;
        }

        return answerResource;
    }

    return Object.freeze({
        createQuestionnaire,
        createAnswers
    });
}

module.exports = createQuestionnaireService;
