const express = require('express');
const validateJWT = require('express-jwt');
const jwtAuthz = require('express-jwt-authz');
const q = require('./questionnaire');

const router = express.Router();
const rxCaseReference = /^[0-9]{2}\\[0-9]{6}$/;

// express-jwt-authz doesnt allow the "failWithError" opt to be set globally,
// wrap it to avoid passing it in manually on every call
function permissions(...scopes) {
    return jwtAuthz(scopes, {failWithError: true});
}

// Ensure JWT is valid
router.use(validateJWT({secret: process.env.SECRET}));

router.route('/:questionnaireId/sections/answers').get(permissions('read:answers'), (req, res) => {
    // /questionnaires/68653be7-877f-4106-b91e-4ba8dac883f3/sections/answers

    const response = {
        data: {
            type: 'answers',
            id: '68653be7-877f-4106-b91e-4ba8dac883f3',
            attributes: q.answers
        }
    };

    res.json(response);
});

router.route('/:questionnaireId').patch(permissions('update:questionnaires'), (req, res) => {
    if (
        req.body.data &&
        req.body.data.attributes &&
        req.body.data.attributes.caseReference &&
        rxCaseReference.test(req.body.data.attributes.caseReference)
    ) {
        q.caseReference = req.body.data.attributes.caseReference;
    } else {
        const err = Error(`Bad request`);
        err.name = 'HTTPError';
        err.statusCode = 400;
        err.error = '400 Bad Request';
        throw err;
    }

    const response = {
        data: {
            type: 'questionnaires',
            id: '68653be7-877f-4106-b91e-4ba8dac883f3',
            attributes: q
        }
    };

    res.json(response);
});

module.exports = router;
