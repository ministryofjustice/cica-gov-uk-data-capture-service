'use strict';

const express = require('express');
const swaggerUi = require('swagger-ui-express');
const path = require('path');

const router = express.Router();

// Server OpenAPI specs to allow Swagger UI to switch between definitions
router.use('/openapi.json', express.static(path.join(__dirname, '../openapi/openapi.json')));
router.use(
    '/openapi-admin.json',
    express.static(path.join(__dirname, '../openapi/openapi-admin.json'))
);

const swaggerUiOptions = {
    explorer: true,
    swaggerOptions: {
        validatorUrl: null,
        urls: [
            {
                url: '/docs/openapi.json',
                name: 'Version 2023-05-17'
            },
            {
                url: '/docs/openapi-admin.json',
                name: 'Admin'
            }
        ]
    }
};

router.use('/', swaggerUi.serve);
router.get('/', swaggerUi.setup(null, swaggerUiOptions));

module.exports = router;
