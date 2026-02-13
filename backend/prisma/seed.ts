import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...');

    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create Admin User
    const admin = await prisma.user.upsert({
        where: { email: 'admin@fleet.com' },
        update: {},
        create: {
            email: 'admin@fleet.com',
            password: hashedPassword,
            name: 'Admin User',
            role: 'ADMIN',
            phone: '+1-555-0001',
        },
    });
    console.log('✅ Created ADMIN:', admin.email);

    // Create Transporter Users
    const transporter1 = await prisma.user.upsert({
        where: { email: 'transporter1@fleet.com' },
        update: {},
        create: {
            email: 'transporter1@fleet.com',
            password: hashedPassword,
            name: 'John Transport',
            role: 'TRANSPORTER',
            phone: '+1-555-0100',
            companyName: 'Swift Logistics Inc',
        },
    });

    const transporter2 = await prisma.user.upsert({
        where: { email: 'transporter2@fleet.com' },
        update: {},
        create: {
            email: 'transporter2@fleet.com',
            password: hashedPassword,
            name: 'Sarah Logistics',
            role: 'TRANSPORTER',
            phone: '+1-555-0200',
            companyName: 'Express Freight Co',
        },
    });
    console.log('✅ Created 2 TRANSPORTER users');

    // Create Vehicles
    const vehicle1 = await prisma.vehicle.upsert({
        where: { registrationNumber: 'ABC-1234' },
        update: {},
        create: {
            registrationNumber: 'ABC-1234',
            make: 'Ford',
            model: 'Transit',
            year: 2022,
            vin: 'VIN001234567890ABC',
            status: 'ACTIVE',
            fuelType: 'Diesel',
            capacity: 3500,
            fuelLevel: 75,
            odometer: 45000,
            currentLocation: JSON.stringify({ lat: 40.7128, lng: -74.0060, timestamp: new Date().toISOString() }),
        },
    });

    const vehicle2 = await prisma.vehicle.upsert({
        where: { registrationNumber: 'XYZ-5678' },
        update: {},
        create: {
            registrationNumber: 'XYZ-5678',
            make: 'Mercedes',
            model: 'Sprinter',
            year: 2023,
            vin: 'VIN567890123456XYZ',
            status: 'ACTIVE',
            fuelType: 'Diesel',
            capacity: 4000,
            fuelLevel: 60,
            odometer: 32000,
            currentLocation: JSON.stringify({ lat: 40.7580, lng: -73.9855, timestamp: new Date().toISOString() }),
        },
    });

    const vehicle3 = await prisma.vehicle.upsert({
        where: { registrationNumber: 'DEF-9012' },
        update: {},
        create: {
            registrationNumber: 'DEF-9012',
            make: 'Volkswagen',
            model: 'Crafter',
            year: 2021,
            vin: 'VIN901234567890DEF',
            status: 'IN_MAINTENANCE',
            fuelType: 'Diesel',
            capacity: 3000,
            fuelLevel: 25,
            odometer: 78000,
            currentLocation: JSON.stringify({ lat: 40.7489, lng: -73.9680, timestamp: new Date().toISOString() }),
        },
    });
    console.log('✅ Created 3 vehicles');

    // Create Driver Users (with assigned vehicles)
    const driver1 = await prisma.user.upsert({
        where: { email: 'driver1@fleet.com' },
        update: {},
        create: {
            email: 'driver1@fleet.com',
            password: hashedPassword,
            name: 'Mike Wilson',
            role: 'DRIVER',
            phone: '+1-555-1001',
            licenseNumber: 'DL-001-2024',
            licenseExpiry: new Date('2027-12-31'),
            assignedVehicleId: vehicle1.id,
        },
    });

    const driver2 = await prisma.user.upsert({
        where: { email: 'driver2@fleet.com' },
        update: {},
        create: {
            email: 'driver2@fleet.com',
            password: hashedPassword,
            name: 'Emily Davis',
            role: 'DRIVER',
            phone: '+1-555-1002',
            licenseNumber: 'DL-002-2024',
            licenseExpiry: new Date('2028-06-30'),
            assignedVehicleId: vehicle2.id,
        },
    });

    const driver3 = await prisma.user.upsert({
        where: { email: 'driver3@fleet.com' },
        update: {},
        create: {
            email: 'driver3@fleet.com',
            password: hashedPassword,
            name: 'Carlos Rodriguez',
            role: 'DRIVER',
            phone: '+1-555-1003',
            licenseNumber: 'DL-003-2024',
            licenseExpiry: new Date('2026-09-15'),
            assignedVehicleId: vehicle3.id,
        },
    });
    console.log('✅ Created 3 DRIVER users');

    // Create sample routes
    const route1 = await prisma.route.create({
        data: {
            vehicleId: vehicle1.id,
            startTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
            endTime: new Date(Date.now() - 1 * 60 * 60 * 1000),
            compressedCoordinates: JSON.stringify([
                { lat: 40.7128, lng: -74.0060, timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
                { lat: 40.7580, lng: -73.9855, timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString() },
                { lat: 40.7614, lng: -73.9776, timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() },
            ]),
            distance: 15.5,
            fuelConsumed: 2.3,
            averageSpeed: 45,
            maxSpeed: 65,
            idleTime: 10,
        },
    });
    console.log('✅ Created sample route');

    // Create sample trips
    const trip1 = await prisma.trip.create({
        data: {
            tripNumber: 'TRP-001-2024',
            createdById: transporter1.id,
            assignedToId: driver1.id,
            vehicleId: vehicle1.id,
            origin: 'New York, NY',
            destination: 'Boston, MA',
            waypoints: JSON.stringify(['Hartford, CT']),
            distance: 215,
            estimatedTime: 240,
            estimatedFuel: 32,
            cargoType: 'Electronics',
            cargoWeight: 1200,
            status: 'IN_PROGRESS',
            actualStartTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
            currentLocation: JSON.stringify({ lat: 41.7658, lng: -72.6734 }),
            routeId: route1.id,
        },
    });

    const trip2 = await prisma.trip.create({
        data: {
            tripNumber: 'TRP-002-2024',
            createdById: transporter1.id,
            assignedToId: driver2.id,
            vehicleId: vehicle2.id,
            origin: 'Philadelphia, PA',
            destination: 'Washington, DC',
            distance: 140,
            estimatedTime: 180,
            estimatedFuel: 18,
            cargoType: 'Medical Supplies',
            cargoWeight: 800,
            status: 'ACCEPTED',
        },
    });

    const trip3 = await prisma.trip.create({
        data: {
            tripNumber: 'TRP-003-2024',
            createdById: transporter2.id,
            status: 'PENDING',
            vehicleId: vehicle3.id,
            origin: 'Newark, NJ',
            destination: 'Baltimore, MD',
            distance: 195,
            estimatedTime: 210,
            estimatedFuel: 28,
            cargoType: 'Furniture',
            cargoWeight: 2200,
        },
    });
    console.log('✅ Created 3 trips');

    // Create maintenance records
    await prisma.maintenance.create({
        data: {
            vehicleId: vehicle1.id,
            type: 'ROUTINE',
            description: 'Oil change and filter replacement',
            scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            status: 'SCHEDULED',
            cost: 150,
        },
    });

    await prisma.maintenance.create({
        data: {
            vehicleId: vehicle3.id,
            type: 'REPAIR',
            description: 'Brake system repair',
            scheduledDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            completedDate: new Date(),
            status: 'COMPLETED',
            cost: 450,
            mileage: 78000,
        },
    });
    console.log('✅ Created 2 maintenance records');

    // Create alerts
    await prisma.alert.create({
        data: {
            vehicleId: vehicle2.id,
            type: 'SPEEDING',
            severity: 'MEDIUM',
            title: 'Speed limit exceeded',
            description: 'Vehicle exceeded speed limit by 15 km/h on I-95',
            status: 'ACTIVE',
            timestamp: new Date(Date.now() - 30 * 60 * 1000),
        },
    });

    await prisma.alert.create({
        data: {
            vehicleId: vehicle3.id,
            type: 'MAINTENANCE_DUE',
            severity: 'HIGH',
            title: 'Vehicle in maintenance',
            description: 'Brake system repair in progress',
            status: 'ACKNOWLEDGED',
            timestamp: new Date(),
        },
    });
    console.log('✅ Created 2 alerts');

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📋 Test Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('ADMIN:');
    console.log('  Email: admin@fleet.com');
    console.log('  Password: password123');
    console.log('\nTRANSPORTER 1:');
    console.log('  Email: transporter1@fleet.com');
    console.log('  Password: password123');
    console.log('  Company: Swift Logistics Inc');
    console.log('\nTRANSPORTER 2:');
    console.log('  Email: transporter2@fleet.com');
    console.log('  Password: password123');
    console.log('  Company: Express Freight Co');
    console.log('\nDRIVER 1:');
    console.log('  Email: driver1@fleet.com');
    console.log('  Password: password123');
    console.log('  Vehicle: Ford Transit (ABC-1234)');
    console.log('\nDRIVER 2:');
    console.log('  Email: driver2@fleet.com');
    console.log('  Password: password123');
    console.log('  Vehicle: Mercedes Sprinter (XYZ-5678)');
    console.log('\nDRIVER 3:');
    console.log('  Email: driver3@fleet.com');
    console.log('  Password: password123');
    console.log('  Vehicle: VW Crafter (DEF-9012)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
