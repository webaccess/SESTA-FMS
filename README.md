# SESTA-FMS

## Project Description
Sesta uses a technology solution to track the following:
* Track livelihood activities of the community service providers
* Loan management system to track the loan repayment process 

## Installation
### Frontend
- Technology used: ReactJS
- Steps for project setup:
  - Create a file .env
  - Copy contents of file .env.txt to file .env
  - In terminal use commands below:
  
    ``` cd webapp ```
    
    ``` npm install ```
    
### Backend
- Technology used: Strapi.io
- Database: PostgreSql
- Steps for project setup:
  - In terminal use commands below:
  
    ``` cd backend ```
    
    ``` cd strapi ```
    
    ``` yarn install ```
    
  - Configure Database settings in /backend/strapi/config/environments/development/database.json 
  - In terminal use commands below:
  
    ``` yarn build ```
    
    ``` yarn develop ```
