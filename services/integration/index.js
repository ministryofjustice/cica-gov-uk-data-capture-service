'use strict';

const VError = require('verror');

const createS3Service = require('../s3');
const createQuestionnaireDAL = require('../../questionnaire/questionnaire-dal');
const createQuestionnaireService = require('../../questionnaire/questionnaire-service');

/**
 * Concatenate two arrays.
 * @param {Array} target - The array that will be concatenated to
 * @param {Array} source - The items to be added to the target array
 */
function mergeArrays(target, source) {
    const targetIsArray = Array.isArray(target);
    const sourceIsArray = Array.isArray(source);

    if (targetIsArray && sourceIsArray) {
        return target.concat(source);
    }

    throw new VError(
        `Target and Source must be arrays. Target type: "${
            targetIsArray ? 'array' : typeof target
        }". Source type: "${sourceIsArray ? 'array' : typeof source}"`
    );
}

/**
 * If there are multiple answers against a single questionId, then these answers
 * are flattened into a single answer with value and valueLabel being concatenated arrays.
 * @param answers - The themed output produced by transformQuestionnaire
 */
function flattenAnswers(answers) {
    Object.values(answers).forEach(theme => {
        const values = [];

        theme.values.forEach(question => {
            const existingQuestion = values.find(value => {
                return value.id === question.id;
            });

            if (existingQuestion) {
                existingQuestion.value = mergeArrays(existingQuestion.value, question.value);
                existingQuestion.valueLabel = mergeArrays(
                    existingQuestion.valueLabel,
                    question.valueLabel
                );
            } else {
                values.push(question);
            }
        });

        theme.values = values;
    });
}

/**
 * Parses the relevant declaration information from a questionnaire using its progress
 * and application type to determine which declaration has been answered.
 * @param {questionnaire} questionnaire - The raw questionnaire object
 * @returns a declaration object following the format of a standard question.
 */
function getDeclaration(questionnaire) {
    const progress = questionnaire.getProgress();
    const declarationSectionAndQuestionIds = {
        'p-applicant-declaration': 'q-applicant-declaration',
        'p-mainapplicant-declaration-under-12': 'q-mainapplicant-declaration',
        'p-mainapplicant-declaration-12-and-over': 'q-mainapplicant-declaration',
        'p-rep-declaration-under-12': 'q-rep-declaration',
        'p-rep-declaration-12-and-over': 'q-rep-declaration'
    };
    const declarationSectionIds = Object.keys(declarationSectionAndQuestionIds);
    const declarationSectionId = progress.find(sectionId =>
        declarationSectionIds.includes(sectionId)
    );

    if (declarationSectionId !== undefined) {
        const section = questionnaire.getSection(declarationSectionId);
        const sectionSchema = section.getSchema();
        const sectionAnswers = questionnaire.getAnswers()[declarationSectionId];
        const questionId = declarationSectionAndQuestionIds[declarationSectionId];
        const descriptionId = questionId.replace('q-', '');
        const {description} = sectionSchema.allOf[0].properties[descriptionId];
        const value = sectionAnswers[questionId];
        const valueLabel = sectionSchema.allOf[1].properties[questionId].title;

        return {
            type: 'simple',
            id: declarationSectionId,
            label: description,
            value,
            valueLabel
        };
    }

    return undefined;
}

/**
 * Transforms the questionnaire object into the necessary downstream format.
 * @param {questionnaire} questionnaire - The raw questionnaire object
 * @returns A themed object with attached metadata and declaration content.
 */
function transformQuestionnaire(questionnaire) {
    const section = questionnaire.getSection('p--check-your-answers');
    const sectionSchema = section.getSchema();
    const themeContent =
        sectionSchema.properties['p-check-your-answers'].properties.summaryInfo.summaryStructure;
    flattenAnswers(themeContent);

    return {
        meta: {
            caseReference: questionnaire.getAnswers().system['case-reference']
        },
        themes: themeContent,
        declaration: getDeclaration(questionnaire)
    };
}

/**
 * Transforms the questionnaire object into the necessary downstream format
 * and uploads to S3 for downstream components to use.
 * @param {questionnaire} questionnaire - The raw questionnaire object
 * @returns JSON object from bucket with key matching given key
 */
async function transformAndUpload(data) {
    data.logger.info(`Transforming questionnaire with id: ${data.questionnaire.getId()}`);
    const output = transformQuestionnaire(data.questionnaire);

    // Populate the dateSubmitted from the database
    const db = createQuestionnaireDAL({logger: data.logger}); // TODO: doesn't compile due to not injecting logger
    output.meta.dateSubmitted = await db.getQuestionnaireModifiedDate(data.questionnaire.getId());

    // Upload transformed JSON into S3
    const s3Service = createS3Service({}); // TODO: doesn't compile due to not injecting logger
    const submissionResponse = await s3Service.uploadFile(
        output,
        process.env.S3_BUCKET_NAME,
        `${data.questionnaire.getId()}.json`
    );
    return submissionResponse;
}

/**
 * @param {questionnaire} questionnaire - The raw questionnaire object
 * @returns boolean representing whether application is fatal
 */
function getIsFatal(questionnaire) {
    const answers = questionnaire.getAnswers();

    return (
        answers['p-applicant-fatal-claim'] &&
        answers['p-applicant-fatal-claim']['q-applicant-fatal-claim']

    );
}

/**
 *
 * @param {string} caseReference generated caseReference
 * @param {date} dateSubmitted the date the questionnaire was submitted
 * @returns
 */
function updateCaseReferenceWithYear(caseReference, dateSubmitted) {
    const year = (dateSubmitted.getFullYear() % 100).toString();
    return `${year}\\${caseReference}`;
}

/**
 *
 * @param {string} caseReference
 * @param {questionnaire} questionnaire
 * @returns result of update
 */
function setCaseReference(caseReference, data) {
    const systemSection = data.questionnaire.getSection('system');
    const questionnaireService = createQuestionnaireService({logger: data.logger})
    systemSection['case-reference'] = caseReference;
    const result = questionnaireService.createAnswers(data.questionnaire.getId(), 'system', systemSection);
    return result;
}

/**
 * Generates a reference number for the database
 * and updates the questionnaire object in the database.
 * @param {questionnaire} questionnaire - The raw questionnaire object
 * @returns result from update to the database.
 */
async function generateReferenceNumber(data) {
    // Get new references from db
    let caseReference;
    const db = createQuestionnaireDAL({logger: data.logger});
    caseReference = await db.getReferenceNumber(
        getIsFatal(data.questionnaire),
        data.questionnaire.getId()
    );

    const dateSubmitted = await db.getQuestionnaireModifiedDate(data.questionnaire.getId());
    caseReference = updateCaseReferenceWithYear(caseReference, dateSubmitted);
    // Update application object with reference
    const result = setCaseReference(
        caseReference,
        data
    );

    // return something
    return result;
}

module.exports = {
    transformAndUpload,
    transformQuestionnaire,
    getIsFatal,
    updateCaseReferenceWithYear,
    generateReferenceNumber
};
