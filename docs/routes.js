'use strict';

const express = require('express');
const swaggerUi = require('swagger-ui-express');
const path = require('path');

const swaggerDocument = require('../openapi/openapi.json');

const router = express.Router();

const options = {
    explorer: true,
    swaggerOptions: {
        urls: [
            {
                url: '/docs/openapi.json',
                name: 'Spec1'
            },
            {
                url: '/docs/openapi-v2.json',
                name: 'Spec2'
            }
        ]
    }
};

// console.log('>>>>>>>>>>>>>>>>>: ', path.join(__dirname, '/openapi/openapi.json'));

router.use('/openapi.json', express.static(path.join(__dirname, '../openapi/openapi.json')));
router.use('/openapi-v2.json', express.static(path.join(__dirname, '../openapi/openapi-v2.json')));


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
