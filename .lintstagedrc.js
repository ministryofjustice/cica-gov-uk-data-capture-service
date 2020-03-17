/*! m0-start */
const config = {
    '*.js': ['eslint --fix --color', 'git add'],
    '*.{json,yml,yaml}': ['prettier --write', 'git add']
};
/*! m0-end */

config['./openapi/*.json'] = ["speccy lint ./openapi/openapi.json", "git add"];

/*! m0-start */
module.exports = config;
/*! m0-end */

