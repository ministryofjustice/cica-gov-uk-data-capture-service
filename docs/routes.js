'use strict';

const express = require('express');
const swaggerUi = require('swagger-ui-express');
const path = require('path');

const router = express.Router();

// Server OpenAPI specs to allow Swagger UI to switch between definitions
router.use('/openapi.json', express.static(path.join(__dirname, '../openapi/openapi.json')));
router.use('/openapi-v2.json', express.static(path.join(__dirname, '../openapi/openapi-v2.json')));

const swaggerUiOptions = {
    explorer: true,
    swaggerOptions: {
        validatorUrl: null,
        urls: [
            {
                url: '/docs/openapi.json',
                name: 'Spec V1'
            },
            {
                url: '/docs/openapi-v2.json',
                name: 'Spec V2'
            }
        ]
    }
};

router.use('/', swaggerUi.serve);
router.get('/', swaggerUi.setup(null, swaggerUiOptions));

module.exports = router;
