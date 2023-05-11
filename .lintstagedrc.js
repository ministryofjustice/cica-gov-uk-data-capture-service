const config = {
    '*.js': ['eslint --fix --color'],
    '*.{json,yml,yaml}': ['prettier --write']
};

// Rebuild the OpenAPI spec any time the src files are changed
config['./openapi/src/**/*.{js,json}'] = ['npm run openapi:build'];

config['./openapi/*.json'] = ['speccy lint ./openapi/openapi.json'];

module.exports = config;
