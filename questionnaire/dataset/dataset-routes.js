'use strict';

const express = require('express');

const permissions = require('../../middleware/route-permissions');
const createDatasetService = require('./dataset-service');

const router = express.Router();

// TODO: Remove this "setDefaultResourceVersion" middleware once legacy stack is in sync
function setDefaultResourceVersion(req, res, next) {
    if (process.env.APP_ENV !== 'test' && res.locals.rawAcceptVersion === undefined) {
        req.headers['accept-version'] = '1.0.0';
    }

    next();
}

router
    .route('/:questionnaireId/dataset')
    .get(
        permissions('read:questionnaires', 'read:answers'),
        setDefaultResourceVersion,
        async (req, res, next) => {
            try {
                const {questionnaireId} = req.params;
                const resourceVersion = req.get('Accept-Version');
                const datasetService = createDatasetService({logger: req.log});

                const resourceCollection = await datasetService.getResource(
                    questionnaireId,
                    resourceVersion
                );

                res.header('Content-Version', resourceVersion);
                res.status(200).json({
                    data: resourceCollection
                });
            } catch (err) {
                next(err);
            }
        }
    );

module.exports = router;
