# Admin Portal Backend - Supabase Version

## 🚀 **Live Deployment**

- **URL**: https://admin-portal-uax8.onrender.com
- **Health Check**: https://admin-portal-uax8.onrender.com/api/health
- **Database**: Supabase PostgreSQL

## 🏗️ **Architecture**

- **Framework**: Flask (Python)
- **Database**: Supabase PostgreSQL
- **ORM**: SQLAlchemy
- **Hosting**: Render
- **PDF Generation**: FPDF2

## 📋 **Features**

- **Employee Management** - CRUD operations
- **Attendance Tracking** - Dual shift support
- **Expense Management** - Travel and general expenses
- **Advance Management** - Employee advances
- **PDF Reports** - Generate reports and salary slips
- **REST API** - Complete API for frontend

## 🔧 **Setup**

### **Local Development**

1. **Install Dependencies**
   ```bash
   pip install -r requirements_supabase.txt
   ```

2. **Set Environment Variables**
   ```env
   SUPABASE_DB_HOST=your_supabase_host
   SUPABASE_DB_NAME=postgres
   SUPABASE_DB_USER=postgres
   SUPABASE_DB_PASSWORD=your_password
   SUPABASE_DB_PORT=5432
   ```

3. **Run Application**
   ```bash
   python app_supabase.py
   ```

### **Production Deployment**

1. **Deploy to Render**
   - Connect GitHub repository
   - Set root directory to `admin-portal-backend`
   - Add environment variables
   - Deploy!

2. **WSGI Configuration**
   - Uses `wsgi_supabase.py` for production
   - Handles port configuration automatically

## 📊 **API Endpoints**

### **Health Check**
- `GET /api/health` - Check backend and database status

### **Employee Management**
- `GET /api/employees` - List all employees
- `POST /api/employees` - Add new employee
- `DELETE /api/employees/{id}` - Remove employee

### **Attendance**
- `POST /api/attendance` - Log attendance
- `GET /api/attendance/view` - View day attendance
- `DELETE /api/attendance` - Delete attendance entry

### **Expenses**
- `POST /api/expenses/travel` - Log travel expense
- `POST /api/expenses/general` - Log general expenses
- `GET /api/expenses/summary` - Get expense summary

### **Reports**
- `POST /api/reports/generate` - Generate PDF reports
- `POST /api/ai/scan-expenses` - AI anomaly detection

## 🗄️ **Database Schema**

### **Tables**
- `employees` - Employee information
- `attendance` - Daily attendance records
- `travel_expenses` - Travel expense tracking
- `general_expenses` - General expense tracking
- `advances` - Employee advance payments

### **Key Features**
- **Indexes**: Optimized for performance
- **Constraints**: Data integrity
- **Relationships**: Proper foreign keys

## 🔒 **Security**

- **CORS**: Configured for frontend access
- **Input Validation**: All inputs validated
- **SQL Injection**: Prevented with SQLAlchemy ORM
- **Error Handling**: Comprehensive error management

## 📈 **Performance**

- **Connection Pooling**: Optimized database connections
- **Query Optimization**: Efficient database queries
- **Caching**: Built-in Supabase caching
- **Auto-scaling**: Render handles traffic spikes

## 🛠️ **Dependencies**

```
Flask==2.3.3
Flask-CORS==4.0.0
Flask-SQLAlchemy==3.0.5
psycopg2-binary==2.9.7
supabase==2.0.2
fpdf2==2.7.6
python-dotenv==1.0.0
```

## 🚀 **Deployment**

### **Render Configuration**
- **Build Command**: `pip install -r requirements_supabase.txt`
- **Start Command**: `python wsgi_supabase.py`
- **Environment**: Production-ready

### **Environment Variables**
All Supabase connection details are configured via environment variables for security.

## 📞 **Support**

For issues or questions:
1. Check Render logs
2. Verify Supabase connection
3. Test API endpoints
4. Check environment variables

**Your admin portal backend is production-ready!** 🎉
