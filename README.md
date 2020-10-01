# SESTA-FMS

## Project Description

Sesta uses a technology solution to track the following:

- Track livelihood activities of the community service providers
- Loan management system to track the loan repayment process

## Installation

### Frontend

- Technology used: ReactJS
- Steps for project setup:

  - Create a file .env
  - Copy contents of file .env.txt to file .env
  - In terminal use commands below:

    `cd webapp`

    `npm install`

### Backend

- Technology used: Strapi.io
- Database: PostgreSql
- Steps for project setup:

  - Create a file .env
  - Copy contents of file .env.sample to file .env
  - In terminal use commands below:

    `cd backend/strapi`

    `yarn install`

  - Configure Database settings in backend/strapi/config/database.js, backend/strapi/config/config.js, backend/ strapi/config/bookshelf.js
  - Take a clone of crmplatform plugin https://github.com/webaccess/crmplatform.git and place it in backend/strapi/plugins
  - In terminal use commands below:

    `yarn build`

    `yarn develop`

  - To get loan models, users and activity types data, go to path backend/strapi/scripts/migratedata and run following command:

    `node index.js`
