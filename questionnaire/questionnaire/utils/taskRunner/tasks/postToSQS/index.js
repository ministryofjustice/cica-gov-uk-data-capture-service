'use strict';

const VError = require('verror');
const createSqsService = require('../../../../../../services/sqs');

/**
 * Builds the body of the SQS message
 * @param {questionnaireId} questionnaireId - The id of the questionnaire
 * @returns The body of the SQS message
 */
function buildMessageBody(questionnaireId) {
    const s3Directory = process.env.S3_DIRECTORY ? process.env.S3_DIRECTORY : 'application_json';
    return `{"applicationJSONDocumentSummaryKey": "${s3Directory}/${questionnaireId}.json"}`;
}

/**
 * Sends message to sqs with reference to the application json file in s3
 * @param {questionnaire} questionnaire - The raw questionnaire object
 * @returns result from the sqs service.
 */
async function sendSubmissionMessageToSQS(data) {
    const questionnaireId = data.questionnaire.id;

    const body = buildMessageBody(questionnaireId);
    data.logger.info(
        `Sending submission message to SQS for questionnaire with id ${questionnaireId}`
    );
    const sqsService = createSqsService({logger: data.logger});
    const sqsResponse = await sqsService.send(body, process.env.AWS_SQS_ID);

    data.logger.info(sqsResponse);

    if (!sqsResponse || !sqsResponse.MessageId) {
        data.logger.error(
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
