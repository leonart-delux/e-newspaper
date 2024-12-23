import fnKnex from 'knex';

const db = fnKnex({
    client: 'mysql2',
    connection:
        {
            host: '127.0.0.1',
            port: 3306,
            user: 'root',
            password: '',
            database: 'web_programming_final_project'
        },
    pool: {min: 0, max: 7}
});
export default db