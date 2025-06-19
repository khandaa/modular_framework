 I want to build a modular structure software that will help me create modules right from backend to Api, to which can be reused in any new software that I develop. I want to use SQLI as my bank database. I want to use flask KPI is for my API development using python, and I want to use react as my content help me design a structure and architecture that can help me create new modules which are pluggable and can be used for all future software developments


 create a module builder template that will have the following 
 ask for Module name 
ask clarifying questions core functionality
ask for any specific tables, relationships, data fields in data tables
create a list of tasks 
execute the tasks 
should be self sufficient
DB script to create database tables create module_db_script.sql 
create tables 
create a folder with module_name under modules folder
create backend,test and frontend folders
implement all api functionality inside backend
list all the api endpoints it exposes 
 implement UI in frontend
 automate testing using test scripts and they should be placed in test folder
inter module communication using events 
always write error logs 
always log all user actions for auditing
excellent error handling 
exception handling 

 
 create a module for user management. It should have capabilities to register a new user, login for existing users, role management, role based access management, a user can be assigned multiple roles, a user can be activated or deactivated. user registration should have userid, username, salutation, firstname,lastname, mobile_number and email. Mobile_number should be mandatory for user registration.
 user session data should be managed every time a user logs into the system 
 multiple roles should be available to be assigned to users. The mandatory roles are admin and viewer. Role based access control to all  the features developed
