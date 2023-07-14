'use strict';

const express = require('express');

const permissions = require('../../middleware/route-permissions');
const createMetadataService = require('./metadata-service');

const router = express.Router();

router.route('/metadata').get(permissions('read:questionnaires'), async (req, res, next) => {
    try {
        const metadataService = createMetadataService({
            logger: req.log,
            apiVersion: req.get('Dcs-Api-Version'),
            ownerId: req.get('On-Behalf-Of')
        });
        const metaData = await metadataService.getMetadata();
        res.status(200).json(metaData);
    } catch (err) {
        next(err);
    }
});

router
    .route('/:questionnaireId/metadata')
    .get(permissions('read:questionnaires'), async (req, res, next) => {
        try {
            const metadataService = createMetadataService({
                logger: req.log,
                apiVersion: req.get('Dcs-Api-Version'),
                ownerId: req.get('On-Behalf-Of')
            });
            const metaData = await metadataService.getMetadataByQuestionnaire(
                req.params.questionnaireId
            );
            res.status(200).json(metaData);
        } catch (err) {
            next(err);
        }
    });

module.exports = router;
