'use strict';

const express = require('express');
const swaggerUi = require('swagger-ui-express');

const swaggerDocument = require('../openapi/openapi.json');

const router = express.Router();

const options = {
    explorer: true,
    swaggerOptions: {
        urls: [
            {
                url: 'http://localhost:3100/openapi.json',
                name: 'Spec1'
            },
            {
                url: 'http://localhost:3100/openapi2.json',
                name: 'Spec2'
            }
        ]
    }
};

// Ensure JWT is valid
// router.use(validateJWT({secret: process.env.SECRET}));
router.use('/', swaggerUi.serve);
router.get('/', swaggerUi.setup(null, options /*swaggerDocument, {explorer: true}*/));

module.exports = router;

/*'use strict';

const express = require('express');
const swaggerUi = require('swagger-ui-express');

const swaggerDocumentOne = require('../openapi/openapi.json');
const swaggerDocumentTwo = require('../openapi/openapi.json');

const router = express.Router();
const options = {}


router.use(
    '/api-docs-one',
    swaggerUi.serveFiles(swaggerDocumentOne, options),
    swaggerUi.setup(swaggerDocumentOne)
);

router.use(
    '/api-docs-two',
    swaggerUi.serveFiles(swaggerDocumentTwo, options),
    swaggerUi.setup(swaggerDocumentTwo)
);

router.use(
    '/',
    function(req, res, next) {
        req.swaggerDoc = swaggerDocumentOne;
        next();
    },
    swaggerUi.serveFiles(),
    swaggerUi.setup()
);

module.exports = router;*/
