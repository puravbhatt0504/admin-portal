# Admin Portal - Complete Employee Management System

A comprehensive admin portal for managing employees, attendance, expenses, and more. Built with Flask backend and modern frontend.

## 🌟 Features

- **Employee Management** - Add, remove, and manage employees
- **Attendance Tracking** - Log and view daily attendance with shift support
- **Travel Expenses** - Track travel expenses with automatic rate calculation
- **General Expenses** - Log multiple expense items per day
- **Employee Advances** - Manage advance payments
- **Salary Management** - Generate salary slips and reports
- **AI Insights** - Anomaly detection and attrition analysis
- **Real-time Dashboard** - Live statistics and charts
- **Responsive Design** - Works on all devices
- **Dark Mode** - Toggle between light and dark themes

## 🏗️ Architecture

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Python Flask with SQLAlchemy
- **Database**: MySQL
- **Deployment**: 
  - Frontend: Vercel
  - Backend: PythonAnywhere
- **UI Framework**: Bootstrap 5 with custom styling

## 📁 Project Structure

```
admin-portal/
├── admin-portal-frontend/          # Frontend application
│   ├── index.html                  # Main HTML file
│   ├── static/                     # Static assets
│   │   ├── style.css              # Custom styles
│   │   ├── script.js              # Main JavaScript
│   │   └── assets/                # Images and icons
│   ├── vercel.json                # Vercel configuration
│   └── package.json               # Project metadata
├── admin-portal-backend/           # Backend API
│   ├── app.py                     # Flask application
│   ├── models.py                  # Database models
│   ├── wsgi.py                    # WSGI configuration
│   ├── requirements.txt           # Python dependencies
│   ├── config.json                # Application config
│   └── seed.py                    # Database seeding
└── README.md                      # This file
```

## 🚀 Quick Start

### Backend Setup (PythonAnywhere)
1. Upload backend files to PythonAnywhere
2. Install dependencies: `pip install -r requirements.txt`
3. Configure database connection
4. Set environment variables
5. Deploy using WSGI configuration

### Frontend Setup (Vercel)
1. Connect GitHub repository to Vercel
2. Deploy automatically from main branch
3. Frontend will auto-connect to backend

### Local Development
1. Clone the repository
2. Open `admin-portal-frontend/index.html` in browser
3. Backend API calls will work with live deployment

## 🔧 Configuration

### Backend Configuration
- Database credentials in `app.py`
- Environment variables for sensitive data
- CORS enabled for frontend communication

### Frontend Configuration
- API base URL auto-detected from backend
- Responsive design for all screen sizes
- Dark mode support with localStorage

## 📊 API Endpoints

### Employee Management
- `GET /api/employees` - List all employees
- `POST /api/employees` - Add new employee
- `DELETE /api/employees/{id}` - Remove employee

### Attendance
- `POST /api/attendance` - Log attendance
- `GET /api/attendance/view` - View day attendance
- `DELETE /api/attendance` - Delete attendance entry

### Expenses
- `POST /api/expenses/travel` - Log travel expense
- `POST /api/expenses/general` - Log general expenses
- `GET /api/expenses/summary` - Get expense summary

### Reports & Analytics
- `GET /api/dashboard` - Dashboard statistics
- `POST /api/reports/generate` - Generate reports
- `POST /api/ai/scan-expenses` - AI anomaly detection

## 🛠️ Technologies Used

### Frontend
- HTML5, CSS3, JavaScript (ES6+)
- Bootstrap 5
- Chart.js for data visualization
- DataTables for data management
- Font Awesome icons

### Backend
- Python 3.x
- Flask web framework
- SQLAlchemy ORM
- MySQL database
- FPDF for PDF generation

### Deployment
- Vercel (Frontend hosting)
- PythonAnywhere (Backend hosting)
- MySQL (Database hosting)

## 📱 Features in Detail

### Dashboard
- Real-time attendance statistics
- Live charts and graphs
- Quick access to all features
- Responsive design

### Employee Management
- Add/remove employees
- Employee selection dropdowns
- Data validation and error handling

### Attendance System
- Dual shift support
- Time parsing (12/24 hour format)
- Status calculation (Present/Late/Absent)
- Bulk operations

### Expense Management
- Travel expenses with odometer readings
- General expenses with multiple items
- Automatic calculations
- Rate configuration

### Reporting
- PDF generation
- Data export
- Custom date ranges
- AI-powered insights

## 🔒 Security Features

- Input validation
- SQL injection prevention
- CORS configuration
- Error handling
- Data sanitization

## 🌐 Deployment URLs

- **Frontend**: https://admin-portal-dusky.vercel.app/
- **Backend**: https://finalboss0504.pythonanywhere.com
- **API Documentation**: Available at backend URL

## 📝 License

MIT License - feel free to use and modify as needed.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For issues and questions, please create an issue in the GitHub repository.

---

**Built with ❤️ for efficient employee management**
