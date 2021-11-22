'use strict';

const express = require('express');

const permissions = require('../../middleware/route-permissions');
const createDatasetService = require('./dataset-service');

const router = express.Router();

router
    .route('/:questionnaireId/dataset')
    .get(permissions('read:questionnaires', 'read:answers'), async (req, res, next) => {
        try {
            const {questionnaireId} = req.params;
            const datasetService = createDatasetService({logger: req.log});
            const resourceCollection = await datasetService.getResource(questionnaireId);

            res.status(200).json({
                data: resourceCollection
            });
        } catch (err) {
            next(err);
        }
    });

module.exports = router;
