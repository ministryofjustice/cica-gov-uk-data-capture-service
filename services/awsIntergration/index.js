'use strict';

const createS3Service = require('../s3');

function createAwsIntergrationService({logger}) {
    async function putCheckYourAnswersInS3(questionnaire, questionnaireId) {
        const section = questionnaire.getSection('p--check-your-answers');
        const sectionSchema = section.getSchema();
        const jsnObj =
            sectionSchema.properties['p-check-your-answers'].properties.summaryInfo
                .summaryStructure;

        const s3Service = createS3Service({logger});
        const submissionResponse = await s3Service.uploadFile(
            jsnObj,
            process.env.S3_BUCKET_NAME,
            questionnaireId
        );

        return submissionResponse;
    }

    return Object.freeze({
        putCheckYourAnswersInS3
    });
}

module.exports = createAwsIntergrationService;
