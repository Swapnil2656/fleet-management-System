# Fleet Management System

A modern, multi-role fleet management system with real-time tracking, trip management, and route optimization.

## 🚀 Features

- **Multi-Role Dashboards**: Admin, Transporter, and Driver interfaces
- **Real-Time Vehicle Tracking**: OpenStreetMap integration with live positions
- **Route Optimization**: Powered by OpenRouteService API
- **Trip Management**: Complete lifecycle from creation to completion
- **Role-Based Access Control**: Secure authentication with JWT

## 🛠️ Tech Stack

**Backend:**
- Node.js + Express
- Prisma ORM
- SQLite Database
- JWT Authentication

**Frontend:**
- Next.js 14 (App Router)
- React + TypeScript
- Tailwind CSS
- Leaflet (OpenStreetMap)

## 📦 Installation

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fleet-management-System
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   npx prisma db push
   npx prisma db seed
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## 🔐 Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@fleet.com | password123 |
| Transporter 1 | transporter1@fleet.com | password123 |
| Transporter 2 | transporter2@fleet.com | password123 |
| Driver 1 | driver1@fleet.com | password123 |
| Driver 2 | driver2@fleet.com | password123 |
| Driver 3 | driver3@fleet.com | password123 |

## 🗺️ OpenRouteService Configuration

The system uses OpenRouteService for route optimization:

1. Get your API key from https://openrouteservice.org/dev/#/signup
2. Configure in `frontend/src/config/route-config.ts`
3. Routes are optimized for fastest delivery times

## 📱 Access Dashboards

- **Login**: http://localhost:3000/login
- **Admin**: http://localhost:3000/admin
- **Transporter**: http://localhost:3000/transporter
- **Driver**: http://localhost:3000/driver

## 🎯 Key Workflows

### Trip Creation (Transporter)
1. Login as transporter
2. Create new trip with origin/destination
3. Assign to driver
4. Track progress on map

### Trip Execution (Driver)
1. Login as driver
2. View pending assignments
3. Accept trip
4. Start trip to see navigation map
5. Complete delivery

### System Oversight (Admin)
1. View all vehicles on fleet map
2. Monitor active trips
3. Manage users and vehicles
4. Track system analytics

## 📊 Features by Role

### Admin Dashboard
- Fleet tracking map with all vehicles
- System-wide statistics
- User and vehicle management
- Cross-dashboard access

### Transporter Dashboard
- Trip creation and management
- Driver assignment
- Route visualization with OpenRouteService
- Delivery tracking

### Driver Dashboard
- Pending trip assignments
- Active trip navigation
- Turn-by-turn route display
- Trip completion tracking

## 🔧 Development

**Backend** (Port 5000):
```bash
cd backend
npm run dev
```

**Frontend** (Port 3000):
```bash
cd frontend
npm run dev
```

## 📝 Database Schema

- **User**: Multi-role (Admin, Transporter, Driver)
- **Vehicle**: Fleet vehicles with tracking data
- **Trip**: Complete trip lifecycle management
- **Route**: Optimized route storage
- **Maintenance**: Vehicle maintenance records
- **Alert**: System alerts and notifications

##License

MIT License - See LICENSE file for details

## 🙋 Support

For issues or questions, please open an issue on the repository.
