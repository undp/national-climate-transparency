# National Climate Transparency Tool
 
<a name="about"></a>

![GitHub last commit](https://img.shields.io/github/last-commit/undp/carbon-registry)
[![SparkBlue Chat](https://img.shields.io/badge/chat-SparkBlue-blue)](https://www.sparkblue.org/group/keeping-track-digital-public-goods-paris-agreement)

The National Climate Transparency Tool is your gateway to ensure robust Measurement, Reporting and Verification (MRV) toward the Enhanced Transparency Framework (ETF) and to accelerate implementation of the Nationally Determined Contribution (NDC).

In an era where climate action is not just an aspiration but a responsibility, the National Climate Transparency System is a tool to support the country's uncompromising commitment towards environmental stewardship. This module is an integral part of our open-source software ecosystem, to support countries in easing the process of developing national data management systems for NDC tracking, GHG inventory data management and Biennal Transparency Reporting (BTR). The interface co-designed with countries, coupled with a robust backend ensures that managing complex climate data becomes a seamless experience, fostering a culture of transparency and accountability.

By employing the National Climate Transparency tool, countries can effortlessly align their climate actions with international standards, ensuring a harmonized approach towards a sustainable future. The tool is engineered to provide a clear lens into the progress and impact of NDC actions, making compliance with international commitments and national institutional arrangements a streamlined process. This Digital Public Good codebase envisions to encapsulate the essence of effective climate action management, which countries can configure, adapt and build on to meet national circumstance.

The system has 3 key features, and to be uploaded by the third quarter of 2024.

* **NDC Actions Tracking:** Effortlessly track and report NDC mitigation / adaptation actions, programmes, projects, activities and support. The system is intended to support monitoring and reporting of national activities and finance, facilitating compliance with international reporting commitments. The codebase can be configured to national institutional arrangements and NDC context.
* **GHG Inventory:** Maintains a comprehensive inventory of greenhouse gas (GHG) emissions with ease. The system allows for accurate data collection (with Excel integration), automated calculations, and reporting, supporting informed decision-making.
* **Reporting Module:** Pulls together data collected and managed across the above two modules into a format that is required for reporting to UNFCCCC. The standard codebase uses the recently approved Common Tabular Format and can be configured to any other format. 

<!-- **The National MRV System can be interoperable with the [National Carbon Registry DPG](https://github.com/undp/carbon-registry)** -->

## Index
Below contents are planned to be updated by the third quarter of 2024 based on user feedback and recent change in international requirements. 
* [About](#about)
* [Standards](#standards)
* [System Architecture](#architecture)
* [Project Structure](#structure)
* [Run Services as Containers](#container)
* [Run Services Locally](#local)
* [Deploy System on the AWS Cloud](#cloud)
* [Modules](#modules)
* [Web Frontend](#frontend)
* [Localization](#localization)
* [API (Application Programming Interface)](#api)
* [Status Page](#status)
* [User Manual](#manual)
* [Demonstration Video](#demo)
* [Data Sovereignty](#data)
* [Governance and Support](#support)

<a name="standards"></a>

## Standards

This codebase aims to fulfill the [Digital Public Goods standard](https://digitalpublicgoods.net/standard/), adheres to the [UNDP Data Principles](https://data.undp.org/data-principles), and it is built according to the [Principles for Digital Development](https://digitalprinciples.org/).

<a name="architecture"></a>

## System Architecture

Coming soon...

<a name="deployment"></a>

### Deployment

System services can deploy in 2 ways.

* **As a Container** - Each service boundary containerized in to a docker container and can deploy on any container orchestration service. [Please refer Docker Compose file](./docker-compose.yml)
* **As a Function** - Each service boundary packaged as a function (Serverless) and host on any Function As A Service (FaaS) stack. [Please refer Serverless configuration file](./backend/services/serverless.yml)

### **External Service Providers**

All the external services access through a generic interface. It will decouple the system implementation from the external services and enable extendability to multiple services.

<!-- #### Geo Location Service

Currently implemented for 2 options.

1. File based approach. User has to manually add the regions with the geo coordinates. [Sample File](./backend/services/regions.csv). To apply new file changes, replicator service needs to restart.
2. [Mapbox](https://mapbox.com). Dynamically query geo coordinates from the Mapbox API.

Can add more options by implementing [location interface](./backend/services/src/shared/location/location.interface.ts)

Change by environment variable `LOCATION_SERVICE`. Supported types are `FILE` (default) and `MAPBOX`. -->

#### File Service

Implemented 2 options for static file hosting.

1. NestJS static file hosting using the local storage and container volumes.
2. AWS S3 file storage.

Can add more options by implementing [file handler interface](./backend/services/src/shared/file-handler/filehandler.interface.ts)

Change by environment variable `FILE_SERVICE`. Supported types are `LOCAL` (default) and `S3`.

<a name="structure"></a>

## Project Structure

```text
.
├── .github                         # CI/CD [Github Actions files]
├── deployment                      # Declarative configuration files for initial resource creation and setup [AWS Cloudformation]
├── backend                         # System service implementation
    ├── services                    # Services implementation [NestJS application]
        ├── src
            ├── national-api        # National API [NestJS module]      
            ├── stats-api           # Statistics API [NestJS module]
            ├── async-ops-handler   # Async Operations Handler [NestJS module]     
        ├── serverless.yml          # Service deployment scripts [Serverless + AWS Lambda]
├── libs
    ├── carbon-credit-calculator    # Implementation for the Carbon credit calculation library [Node module + Typescript]
├── web                             # System web frontend implementation [ReactJS]
├── .gitignore
├── docker-compose.yml              # Docker container definitions
└── README.md
```

<a name="container"></a>

## Run Services As Containers

* Update [docker compose file](./docker-compose.yml) env variables as required.
  * Currently all the emails are disabled using env variable `IS_EMAIL_DISABLED`. When the emails are disabled email payload will be printed on the console. User account passwords needs to extract from this console log. Including root user account, search for a log line starting with `Password (temporary)` on national container (`docker logs -f climate-transparency-national-1`).
  * Add / update following environment variables to enable email functionality.
    * `IS_EMAIL_DISABLED`=false
    * `SOURCE_EMAIL` (Sender email address)
    * `SMTP_ENDPOINT`
    * `SMTP_USERNAME`
    * `SMTP_PASSWORD`
  * Use `DB_PASSWORD` env variable to change PostgreSQL database password
  * Configure system root account email by updating environment variable `ROOT EMAIL`. If the email service is enabled, on the first docker start, this email address will receive a new email with the root user password.
  <!-- * By default frontend does not show map images on dashboard and programme view. To enable them please update `REACT_APP_MAP_TYPE` env variable to `Mapbox` and add new env variable `REACT_APP_MAPBOXGL_ACCESS_TOKEN` with [MapBox public access token](https://docs.mapbox.com/help/tutorials/get-started-tokens-api/) in web container. -->
* Add user data
  <!-- * Update [organisations.csv](./organisations.csv) file to add organisations. -->
  * Update [users.csv](./users.csv) file to add users.
  * When updating file keep the header and replace existing dummy data with your data.
  * These users will be added to the system each docker restart.
* Run `docker-compose up -d --build`. This will build and start containers for following services:
  * PostgresDB container
  * National service
  * Analytics service
  * Replicator service
  * React web server with Nginx.
* Web frontend on <http://localhost:9030/>
* API Endpoints,
  * <http://localhost:9000/national/>
  * <http://localhost:9100/stats/>

<a name="local"></a>

* Swagger documentation will be available on <http://localhost:9000/local/national>

 ## Run Services Locally
<!--
* Setup postgreSQL locally and create a new database.
* Update following DB configurations in the `.env.local` file (If the file does not exist please create a new `.env.local`)
  * `DB_HOST` (default `localhost`)
  * `DB_PORT` (default `5432`)
  * `DB_USER` (default `root`)
  * `DB_PASSWORD`
  * `DB_NAME` (default `carbondbdev`)
* Move to folder `cd backend/service`
* Run `yarn run sls:install` -->
<!-- * Initial user data setup

```sh
serverless invoke local --stage=local --function setup --data '{"rootEmail": "<Root user email>","systemCountryCode": "<System country Alpha 2 code>", "name": "<System country name>", "logoBase64": "<System country logo base64>"}'
```

* Start all the services by executing
  
```sh
sls offline --stage=local
``` -->

Follow same steps mentioned above to run the services locally using docker. 

<a name="cloud"></a>

## Deploy System on the AWS Cloud

* Execute to create all the required resources on the AWS.

```sh
aws cloudformation deploy --template-file ./deployment/aws-formation.yml --stack-name carbon-registry-basic --parameter-overrides EnvironmentName=<stage> DBPassword=<password> --capabilities CAPABILITY_NAMED_IAM
```

* Setup following Github Secrets to enable CI/CD
  * `AWS_ACCESS_KEY_ID`
  * `AWS_SECRET_ACCESS_KEY`
* Run it manually to deploy all the lambda services immediately. It will create 2 lambda layers and following lambda functions,
  * national-api: Handle all carbon registry user and program creation. Trigger by external http request.
  * replicator: Replicate Ledger database entries in to Postgres database for analytics. Trigger by new record on the Kinesis stream.
  * setup: Function to add initial system user data.
* Create initial user data in the system by invoking setup lambda function by executing

```sh
aws lambda invoke \
    --function-name carbon-registry-services-dev-setup --cli-binary-format raw-in-base64-out\
    --payload '{"rootEmail": "<Root user email>","systemCountryCode": "<System country Alpha 2 code>", "name": "<System country name>", "logoBase64": "<System country logo base64>"}' \
    response.json
```

<a name="modules"></a>

## Modules

### Carbon Credit Calculator

Carbon credit calculation is implemented in a separate node module. [Please refer to this](./libs/carbon-credit-calculator/README.md) for more information.

### UNDP Platform for Voluntary Bilateral Cooperation

UNDP Platform for Voluntary Bilateral Cooperation generation is implemented in a separate node module. [Please refer this](./modules/Platform%20for%20Voluntary%20Bilateral%20Cooperation/README.md) for more information.

<a name="frontend"></a>

### Web Frontend

Web frontend implemented using ReactJS framework. Please refer [getting started with react app](./web/README.md) for more information.

<a name="localization"></a>

### Localization

* Languages (Current): English
* Languages (In progress): French, Spanish

For updating translations or adding new ones, reference <https://github.com/undp/carbon-registry/tree/main/web/public/Assets/i18n>

<a name="api"></a>

### API (Application Programming Interface)

For integration, reference RESTful Web API Documentation documentation via Swagger. To access

* National API: `api.APP_URL`/national
* Status API: `api.APP_URL`/stats

Our [Data Dictionary](./Data%20Dictionary.csv) is available for field analysis.

<a name="resource"></a>

### Resource Requirements

| Resource | Minimum | Recommended |
| :---         |           ---: |          ---: |
| Memory   | 4 GB    | 8 GB    |
| CPU     | 4 Cores       |   4 Cores   |
| Storage     |  20 GB       |   50 GB   |
| OS     | Linux <br/> Windows Server 2016 and later versions.      |      |

Note: Above resource requirement mentioned for a single instance from each microservice.status.APP_URL

<a name="status"></a>

### Status Page

Coming soon...

<a name="manual"></a>

### User Manual

Coming soon...

<a name="demo"></a>

### Demonstration Video

Coming soon...

<a name="data"></a>

### Data Sovereignty

The code is designed with data sovereignty at its core, empowering nations and organizations to have greater control and governance over their environmental data. Here are the key points highlighting how this system promotes data sovereignty:

- **Local Control**: 
   - Allows nations and entities to store, manage, and process their data locally or in a preferred jurisdiction, adhering to local laws and regulations.
- **Open Source Architecture**:
   - Facilitates transparency, customization, and control over the software, enabling adaptation to specific legal and regulatory requirements.
- **Decentralized Infrastructure**:
   - Supports a decentralized data management approach, minimizing reliance on external or centralized systems.
- **Standardized yet Flexible Protocols**:
   - Provides standardized protocols for data management while allowing for local customization, aligning with the diverse legal landscapes.
- **Secure Data Sharing and Access Control**:
   - Implements robust access control and secure data sharing mechanisms, ensuring only authorized entities can access or alter the data.
- **Audit Trails**:
   - Offers comprehensive audit trails for all data transactions, ensuring traceability and accountability in data handling and reporting.
- **Enhanced Privacy Compliance**:
   - Helps in ensuring compliance with privacy laws and regulations by providing tools for secure data handling and consent management.

By integrating these features, the code significantly contributes to achieving data sovereignty, promoting a more localized and accountable management of environmental data in line with the goals of the Paris Agreement.

<a name="support"></a>

### Governance and Support

[Digital For Climate (D4C)](https://www.theclimatewarehouse.org/work/digital-4-climate) is responsible for managing the application. D4C is a collaboration between the [European Bank for Reconstruction and Development (EBRD)](https://www.ebrd.com), [United Nations Development Program (UNDP)](https://www.undp.org), [United Nations Framework Convention on Climate Change (UNFCCC)](https://www.unfccc.int), [International Emissions Trading Association (IETA)](https://www.ieta.org), [European Space Agency (ESA)](https://www.esa.int), and [World Bank Group](https://www.worldbank.org) that aims to coordinate respective workflows and create a modular and interoperable end-to-end digital ecosystem for the carbon market. The overarching goal is to support a transparent, high integrity global carbon market that can channel capital for impactful climate action and low-carbon development.

This code is managed by [United Nations Development Programme](https://www.undp.org) as custodian, detailed in the [press release](https://www.undp.org/news/newly-accredited-digital-public-good-national-carbon-registry-will-help-countries-meet-their-climate-targets). For any questions, contact us at [digital4planet@undp.org](mailto:digital4planet@undp.org).