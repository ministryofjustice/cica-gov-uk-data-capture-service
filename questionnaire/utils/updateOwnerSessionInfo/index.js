'use strict';

function updateOwnerSession(ownerAnswers, modifiedDate) {
    const modifiedTime = new Date(modifiedDate).getTime();
    const sessionUpdateTimestamp = new Date();
    const sessionUpdateTime = new Date(sessionUpdateTimestamp).getTime();
    const timeDifference = sessionUpdateTime - modifiedTime;

    if (timeDifference <= process.env.DCS_SESSION_DURATION) {
        ownerAnswers['session-time'] += timeDifference;
    } else {
        ownerAnswers['session-number'] += 1;
    }

    return {ownerAnswers, sessionUpdateTimestamp};
}

module.exports = updateOwnerSession;
