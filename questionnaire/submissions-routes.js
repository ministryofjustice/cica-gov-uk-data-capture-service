'use strict';

const express = require('express');
const validateJWT = require('express-jwt');

const createSubmissionsService = require('./submissions-service');
const permissions = require('../middleware/route-permissions');

const router = express.Router();

router.use(validateJWT({secret: process.env.DCS_JWT_SECRET, algorithms: ['HS256']}));

router
    .route('/resubmit-failed')
    .post(permissions('update:questionnaires'), async (req, res, next) => {
        let response;
        try {
            const submissionsService = createSubmissionsService({logger: req.log});
            response = await submissionsService.postFailedSubmissions();
        } catch (err) {
            next(err);
        }
        res.status(200).json(response);
    });

module.exports = router;
