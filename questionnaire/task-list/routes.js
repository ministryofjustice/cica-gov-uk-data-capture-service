'use strict';

const express = require('express');
const createTaskListService = require('./task-list-service');
const permissions = require('../../middleware/route-permissions');

const router = express.Router();

router
    .route('/:questionnaireId/task-list')
    .get(permissions('read:questionnaires', 'read:answers'), async (req, res, next) => {
        try {
            const taskListService = createTaskListService({
                logger: req.log,
                apiVersion: req.get('Dcs-Api-Version'),
                ownerId: req.get('On-Behalf-Of')
            });
            const {questionnaireId} = req.params;
            const taskListData = await taskListService.getTaskListData(questionnaireId);
            res.status(200).json(taskListData);
        } catch (err) {
            next(err);
        }
    });

module.exports = router;
