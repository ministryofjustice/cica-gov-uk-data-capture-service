'use strict';

const VError = require('verror');
const createSqsService = require('../../../../../../services/sqs/index');
const createQuestionnaireHelper = require('../../../../questionnaire');

async function sendNotifyMessageToSQS({questionnaire, logger}) {
    const questionnaireId = questionnaire.id;
    logger.info(`Sending notify message to SQS for questionnaire with id ${questionnaireId}`);
    const sqsService = createSqsService({logger});
    const questionnaireDef = createQuestionnaireHelper({questionnaire});
    const permittedActions = questionnaireDef.getPermittedActions();
    let sqsResponse;
    logger.info(`actions ${permittedActions}`);

    permittedActions.map(async action => {
        logger.info(`action type ${action.type}`);
        try {
            if (action.type === 'sendEmail') {
                logger.info(
                    `Sending notify email to SQS for questionnaire with id ${questionnaireId}`
                );
                const payload = {
                    templateId: action.data.templateId,
                    emailAddress: action.data.emailAddress,
                    personalisation: {
                        caseReference: action.data.personalisation.caseReference
                    },
                    reference: null
                };
                sqsResponse = await sqsService.send(payload, process.env.DCS_NOTIFY_SQS_URL);
                logger.info(
                    `Email sent to Notify SQS for questionnaire with id ${questionnaireId}`
                );
                return sqsResponse;
            }

            if (action.type === 'sendSms') {
                const payload = {
                    templateId: action.data.templateId,
                    // needs to be SMS
                    emailAddress: action.data.sms,
                    personalisation: {
                        caseReference: action.data.personalisation.caseReference
                    },
                    reference: null
                };
                sqsResponse = await sqsService.send(payload, process.env.DCS_NOTIFY_SQS_URL);
                logger.info(`SMS sent to Notify SQS for questionnaire with id ${questionnaireId}`);
                return sqsResponse;
            }
            return sqsResponse;
        } catch (error) {
            logger.error(
                `Message not sent to Notify SQS for questionnaire with id ${questionnaireId} with error ${error}`
            );
            throw new VError(
                {
                    name: 'SendMessageFailed'
                },
                `Message not sent to Notify SQS for questionnaire with id ${questionnaireId}`
            );
        }
    });
}

module.exports = sendNotifyMessageToSQS;
