'use strict';

const semverSatisfies = require('semver/functions/satisfies');

module.exports = (questionnaireDefinition, routerCompatibility) => {
    const {version} = questionnaireDefinition;

    const compatibleRouter = Object.values(routerCompatibility).find(router =>
        semverSatisfies(version, router.versionRange)
    );
    if (compatibleRouter) {
        return compatibleRouter.router;
    }

    throw new Error(`Questionnaire version "${version}" is not supported by any available router`);
};
