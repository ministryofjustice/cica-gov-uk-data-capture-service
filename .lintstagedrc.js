const config = {
    '*.js': ['eslint --fix --color'],
    '*.{json,yml,yaml}': ['prettier --write'],
    './openapi/src/**/*.{js,json}': 'npm run openapi:build',
    './openapi/openapi.json': 'speccy lint ./openapi/openapi.json',
    './openapi/openapi-admin.json': 'speccy lint ./openapi/openapi-admin.json'
};

module.exports = config;
