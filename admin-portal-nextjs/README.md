# Admin Portal - Next.js Full-Stack Application

A comprehensive employee management system built with Next.js, featuring attendance tracking, expense management, and PDF report generation.

## Features

- **Dashboard**: Overview of employees, attendance, and key metrics
- **Employee Management**: Add, edit, and delete employee records
- **Attendance Tracking**: Mark and track employee attendance
- **Reports**: Generate PDF reports for attendance, expenses, and employees
- **Settings**: Configure application parameters
- **Dark Mode**: Toggle between light and dark themes
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Next.js API Routes
- **Database**: Supabase PostgreSQL
- **Styling**: Bootstrap 5, Tailwind CSS
- **Charts**: Chart.js
- **PDF Generation**: Custom PDF generation
- **Icons**: Bootstrap Icons

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd admin-portal-nextjs
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file with your Supabase credentials:
```env
SUPABASE_DB_USER=your_db_user
SUPABASE_DB_PASSWORD=your_db_password
SUPABASE_DB_HOST=your_db_host
SUPABASE_DB_NAME=your_db_name
SUPABASE_DB_PORT=5432
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The application uses the following tables:

- **employees**: Employee information
- **attendance**: Attendance records
- **expenses**: Expense tracking

## API Endpoints

- `GET /api/dashboard` - Dashboard data
- `GET /api/employees` - List employees
- `POST /api/employees` - Create employee
- `PUT /api/employees/[id]` - Update employee
- `DELETE /api/employees/[id]` - Delete employee
- `GET /api/attendance` - List attendance records
- `POST /api/attendance` - Create attendance record
- `DELETE /api/attendance/[id]` - Delete attendance record
- `GET /api/reports/pdf` - Generate PDF reports
- `GET /api/settings` - Get settings
- `POST /api/settings` - Update settings

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

### Other Platforms

The application can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Features in Detail

### Dashboard
- Real-time statistics
- Attendance overview charts
- Recent activity feed
- Quick action buttons

### Employee Management
- Complete CRUD operations
- Form validation
- Search and filter capabilities
- Responsive table design

### Attendance Tracking
- Mark check-in/check-out times
- Automatic hours calculation
- Status tracking (Present, Late, Absent)
- Date range filtering

### Reports
- PDF generation for all data types
- Custom date range selection
- Quick report options (Today, Week, Month)
- Downloadable reports

### Settings
- Configurable parameters
- System information
- Dark mode toggle
- Data management options

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, please open an issue in the GitHub repository or contact the development team.