'use strict';

const VError = require('verror');
const createSqsService = require('../../../../../../services/sqs');

/**
 * Builds the body of the SQS message
 * @param {questionnaireId} questionnaireId - The id of the questionnaire
 * @returns The body of the SQS message
 */
function buildMessageBody(questionnaireId, questionnaire) {
    const [year, refNo] = questionnaire.answers.system['case-reference'].split('\\');
    const s3Directory = `${year}-${refNo}`;
    return {applicationJSONDocumentSummaryKey: `${s3Directory}/${questionnaireId}.json`};
}

/**
 * Sends message to sqs with reference to the application json file in s3
 * @param {questionnaire} questionnaire - The raw questionnaire object
 * @returns result from the sqs service.
 */
async function sendSubmissionMessageToSQS({questionnaire, logger}) {
    const questionnaireId = questionnaire.id;

    const body = buildMessageBody(questionnaireId, questionnaire);
    logger.info(`Sending submission message to SQS for questionnaire with id ${questionnaireId}`);
    const sqsService = createSqsService({logger});
    const sqsResponse = await sqsService.send(body, process.env.AWS_SQS_ID);

    logger.info(sqsResponse);

    if (!sqsResponse || !sqsResponse.MessageId) {
        logger.error(
            `Message not sent to SQS for questionnaire with id ${questionnaireId} with error ${sqsResponse}`
        );
        throw new VError(
            {
                name: 'SendMessageFailed'
            },
            `Message not sent to SQS for questionnaire with id ${questionnaireId}`
        );
    }

    // return something
    return sqsResponse;
}

module.exports = {
    buildMessageBody,
    sendSubmissionMessageToSQS
};
