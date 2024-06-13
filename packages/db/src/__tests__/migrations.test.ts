// TODO: write tests for DB migrations

// This query pulls all the tables and columns in the public schema of a PostgreSQL database, along with their data types and constraints.
// I used it to manually test what the migration produced vs. sequelize's .sync() method.
;`
WITH table_columns AS (
    SELECT 
        table_name, 
        column_name, 
        data_type, 
        ordinal_position
    FROM 
        information_schema.columns
    WHERE 
        table_schema = 'public'
),
table_constraints AS (
    SELECT 
        tc.table_name, 
        kcu.column_name, 
        tc.constraint_type
    FROM 
        information_schema.table_constraints tc
    JOIN 
        information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
    WHERE 
        tc.table_schema = 'public'
)
SELECT 
    tc.table_name, 
    tc.column_name, 
    tc.data_type, 
    COALESCE(tc2.constraint_type, 'None') AS constraint_type
FROM 
    table_columns tc
LEFT JOIN 
    table_constraints tc2 
    ON tc.table_name = tc2.table_name 
    AND tc.column_name = tc2.column_name
ORDER BY 
    tc.table_name, 
    tc.ordinal_position;
`
