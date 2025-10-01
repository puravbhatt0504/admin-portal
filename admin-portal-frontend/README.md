# Admin Portal Frontend

## 🚀 **Live Deployment**

- **URL**: https://admin-portal-dusky.vercel.app/
- **Backend**: https://admin-portal-uax8.onrender.com
- **Hosting**: Vercel

## 🏗️ **Architecture**

- **Frontend**: Vanilla HTML5, CSS3, JavaScript
- **UI Framework**: Bootstrap 5
- **Charts**: Chart.js
- **Data Tables**: DataTables
- **Icons**: Font Awesome
- **Backend**: Flask API with Supabase

## 📋 **Features**

- **📊 Dashboard** - Real-time statistics and charts
- **👥 Employee Management** - Add, edit, remove employees
- **⏰ Attendance Tracking** - Dual shift support with time parsing
- **💰 Expense Management** - Travel and general expenses
- **📄 PDF Reports** - Generate salary slips and reports
- **🌙 Dark Mode** - Toggle between light and dark themes
- **📱 Responsive** - Works on all devices

## 🎨 **UI Components**

### **Dashboard**
- Live attendance statistics
- Interactive charts and graphs
- Quick access to all features
- Real-time data updates

### **Employee Management**
- Employee list with search
- Add/remove employees
- Data validation
- Error handling

### **Attendance System**
- Dual shift support (morning/evening)
- Time parsing (12/24 hour format)
- Status calculation (Present/Late/Absent)
- Bulk operations

### **Expense Management**
- Travel expenses with odometer readings
- General expenses with multiple items
- Automatic calculations
- Rate configuration

### **Reporting**
- PDF generation
- Data export
- Custom date ranges
- AI-powered insights

## 🔧 **Configuration**

### **API Configuration**
```javascript
// Backend API URL
let API_BASE_URL = 'https://admin-portal-uax8.onrender.com';
```

### **Features**
- **Auto-detection**: Automatically detects backend URL
- **Error Handling**: Comprehensive error management
- **Mobile Support**: Optimized for mobile devices
- **Offline Handling**: Graceful offline behavior

## 📱 **Mobile Features**

- **Responsive Design**: Works on all screen sizes
- **Touch Support**: Optimized for touch interactions
- **Mobile Menu**: Collapsible navigation
- **Error Handling**: Mobile-specific error management

## 🎨 **Styling**

### **CSS Framework**
- **Bootstrap 5**: Modern UI components
- **Custom CSS**: Additional styling in `style.css`
- **Dark Mode**: CSS variables for theme switching
- **Responsive**: Mobile-first design

### **JavaScript Features**
- **ES6+**: Modern JavaScript features
- **Async/Await**: Modern async handling
- **Error Handling**: Comprehensive error management
- **Mobile Support**: Touch and mobile optimizations

## 🚀 **Deployment**

### **Vercel Configuration**
- **Framework**: Static Site
- **Build Command**: (none - static files)
- **Output Directory**: Root directory
- **Auto-deploy**: From GitHub main branch

### **Files**
- `index.html` - Main HTML file
- `static/script.js` - Main JavaScript
- `static/style.css` - Custom styles
- `vercel.json` - Vercel configuration
- `package.json` - Project metadata

## 🔗 **API Integration**

### **Endpoints Used**
- `GET /api/health` - Health check
- `GET /api/employees` - Employee list
- `POST /api/employees` - Add employee
- `DELETE /api/employees/{id}` - Remove employee
- `POST /api/attendance` - Log attendance
- `GET /api/attendance/view` - View attendance
- `POST /api/expenses/travel` - Travel expenses
- `POST /api/expenses/general` - General expenses
- `POST /api/reports/generate` - Generate reports

### **Error Handling**
- Network error handling
- API error responses
- User-friendly error messages
- Retry mechanisms

## 🎯 **Performance**

- **Fast Loading**: Optimized assets
- **Efficient API Calls**: Minimal requests
- **Caching**: Browser caching enabled
- **Compression**: Gzip compression

## 🔒 **Security**

- **CORS**: Configured for backend access
- **Input Validation**: Client-side validation
- **XSS Protection**: Sanitized inputs
- **HTTPS**: Secure connections

## 🛠️ **Development**

### **Local Development**
1. Open `index.html` in browser
2. Backend API calls work with live deployment
3. No build process required

### **File Structure**
```
admin-portal-frontend/
├── index.html              # Main HTML file
├── static/
│   ├── script.js           # Main JavaScript
│   ├── style.css           # Custom styles
│   └── assets/
│       └── logo.png        # Logo image
├── vercel.json             # Vercel configuration
└── package.json            # Project metadata
```

## 📞 **Support**

For issues or questions:
1. Check browser console for errors
2. Verify backend API is running
3. Test network connectivity
4. Check API endpoint responses

**Your admin portal frontend is production-ready!** 🎉
