'use strict';

const express = require('express');
const swaggerUi = require('swagger-ui-express');

const swaggerDocument = require('../openapi/openapi.json');
const swaggerV2Document = require('../openapi/openapiV2.json');

const router = express.Router();

const options = {
    explorer: true,
    swaggerOptions: {
        urls: [
            {
                spec: swaggerDocument,
                name: 'v1'
            },
            {
                spec: swaggerV2Document,
                name: 'v2'
            }
        ]
    }
};

// Ensure JWT is valid
// router.use(validateJWT({secret: process.env.SECRET}));
router.use('/v1', swaggerUi.serve);
router.get('/v1', swaggerUi.setup(null, options));

router.use('/v2', swaggerUi.serve);
router.get('/v2', swaggerUi.setup(null, options));

module.exports = router;
