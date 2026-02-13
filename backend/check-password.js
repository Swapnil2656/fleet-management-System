const { Client } = require('pg');

const commonPasswords = [
    'postgres',
    'admin',
    'password',
    '1234',
    '12345',
    'root',
    'fleet',
    'fleet_management'
];

async function checkPasswords() {
    console.log('🔍 Testing common passwords...');

    for (const password of commonPasswords) {
        const client = new Client({
            host: 'localhost',
            port: 5432,
            user: 'postgres',
            password: password,
            database: 'postgres',
        });

        try {
            await client.connect();
            console.log(`\n✅ SUCCESS! The password is: "${password}"`);
            await client.end();
            return; // Exit after finding the correct password
        } catch (error) {
            // Ignore authentication errors and continue
            if (error.code !== '28P01') {
                // Log other errors if they aren't auth errors (e.g. connection refused)
                console.log(`⚠️  Error with "${password}": ${error.message}`);
            }
        }
    }

    console.log('\n❌ None of the common passwords worked.');
    console.log('You will need to reset the password manually.');
}

checkPasswords();
