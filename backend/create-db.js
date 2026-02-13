const { Client } = require('pg');

async function createDatabase() {
    // Connect to default postgres database
    const client = new Client({
        host: 'localhost',
        port: 5432,
        user: 'postgres',
        password: 'postgres', // Change this if your password is different
        database: 'postgres',
    });

    try {
        await client.connect();
        console.log('✅ Connected to PostgreSQL');

        // Check if database exists
        const result = await client.query(
            "SELECT 1 FROM pg_database WHERE datname = 'fleet_management'"
        );

        if (result.rows.length === 0) {
            // Create database
            await client.query('CREATE DATABASE fleet_management');
            console.log('✅ Database "fleet_management" created successfully!');
        } else {
            console.log('ℹ️  Database "fleet_management" already exists');
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.log('\n💡 If you see "password authentication failed":');
        console.log('   Edit this file and change the password on line 8');
    } finally {
        await client.end();
    }
}

createDatabase();
