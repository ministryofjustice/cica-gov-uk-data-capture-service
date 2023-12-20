# Data Capture Service
[![GitHub repo size](https://img.shields.io/github/repo-size/CriminalInjuriesCompensationAuthority/data-capture-service)](https://github.com/CriminalInjuriesCompensationAuthority/data-capture-service)
[![GitHub repo version](https://img.shields.io/github/package-json/v/CriminalInjuriesCompensationAuthority/data-capture-service)](https://github.com/CriminalInjuriesCompensationAuthority/data-capture-service/releases/latest)
[![GitHub repo npm version](https://img.shields.io/badge/npm_version->=9.5.0-blue)](https://github.com/CriminalInjuriesCompensationAuthority/data-capture-service/blob/master/package.json#L5)
[![GitHub repo node version](https://img.shields.io/badge/node_version->=18.16.1-blue)](https://github.com/CriminalInjuriesCompensationAuthority/data-capture-service/blob/master/package.json#L6)
[![GitHub repo contributors](https://img.shields.io/github/contributors/CriminalInjuriesCompensationAuthority/data-capture-service)](https://github.com/CriminalInjuriesCompensationAuthority/data-capture-service/graphs/contributors)
[![GitHub repo license](https://img.shields.io/github/package-json/license/CriminalInjuriesCompensationAuthority/data-capture-service)](https://github.com/CriminalInjuriesCompensationAuthority/data-capture-service/blob/master/LICENSE)


Data Capture Service is an API that returns data about an application for compensation. Back-office API for the [Apply](https://claim-criminal-injuries-compensation.service.justice.gov.uk/apply/) service. Consumed by [Cica Web](https://github.com/CriminalInjuriesCompensationAuthority/cica-web).


## Prerequisites
* Windows machine running docker desktop.
* You have Node Version Manager (NVM) installed globally. <sup>(_recommended, not required_)</sup>
* You have NPM `">=9.5.0"` installed globally.
* You have Node `">=18.16.1"` installed globally.
* You have the Postgres `create-tables.sql` file in a sibling directory named `postgres-scripts` (this mapping is defined in the `docker-compose.yml` file)

## Installing Data Capture Service

Make sure that this repo is installed in a sibling directory to Cica Web. This directory structure is already configured in the `docker-compose.yml` file that are used to run the containers.

Clone the data-capture-service repo, and `npm install`

## Using Data Capture Service
In order to fully run and use the API, you will need to clone and install the [Cica Web](https://github.com/CriminalInjuriesCompensationAuthority/cica-web). The neccessary `docker-compose.yml` file is found in the dev-utilities repo.

This Docker Compose configuration will assume that there is a cica-web, and data-capture-service directory, both with the respective installed repos in them for it to run correctly.

> Full instructions on the required directory structure and configuration is found in the `Docker-compose-setup-for-CW,-DCS,-Postgres` Utilities Wiki article <sup>(_private repo_)</sup>.

To build and run the API, run these commands:
* `docker-compose -f docker-compose.dev build`
* `docker-compose -f docker-compose.dev up`

Once it is built and running, navigate to http://localhost:3100/docs to use the API Swagger UI.

## Contributors
Thanks to the following people who have contributed to this project:
* [@armoj](https://github.com/armoj)
* [@neil-stephen-mcgonigle](https://github.com/neil-stephen-mcgonigle)
* [@BarryPiccinni](https://github.com/BarryPiccinni)
* [@sinclairs](https://github.com/sinclairs)
* [@stephenjmcneill1971](https://github.com/stephenjmcneill1971)
* [@tjbburton](https://github.com/tjbburton)


## License
This project uses the following license: MIT.
