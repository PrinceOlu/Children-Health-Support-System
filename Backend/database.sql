----connecting to Postgres
open cmd as an admin
copy and past "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres
Password for user postgres: ---enter your password




NB some bacsic commands: 
----- To list all databases
 \l 
----- To create a database
 CREATE DATABASE children_health_support_system; 
----- To connect to a database
 \c children_health; 
----- To list all tables
 \dt 
----- To describe a table
 \d table_name 
----- To describe all tables
 \d+ table_name 
--To create a table
CREATE TABLE users(
    users_id SERIAL PRIMARY KEY NOT NULL,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255),
);
---To show all the data in a table
SELECT * FROM todo;

---drop a database
DROP DATABASE children_health_support_system