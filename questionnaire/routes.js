const express = require('express');

const q = require('./questionnaire');
const router = express.Router();

router.route('/:questionnaireId/sections/answers').get((req, res) => {
    // /questionnaires/68653be7-877f-4106-b91e-4ba8dac883f3/sections/answers

    const response = {
        data: {
            type: 'answers',
            id: '68653be7-877f-4106-b91e-4ba8dac883f3',
            attributes: q.answers
        }
    };

    res.type('application/vnd.api+json');
    res.json(response);
});

module.exports = router;
