'use strict';

const express = require('express');

const permissions = require('../../middleware/route-permissions');
const createMetadataService = require('./metadata-service');

const router = express.Router();

router.route('/meta').get(permissions('read:questionnaires'), async (req, res, next) => {
    try {
        const metadataService = createMetadataService({logger: req.log});
        const metaData = await metadataService.getMetadata(req.query);
        res.status(200).json(metaData);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
