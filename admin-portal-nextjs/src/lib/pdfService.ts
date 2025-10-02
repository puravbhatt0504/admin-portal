export interface ExpenseData {
  id: number
  employee_name: string
  category: string
  description: string
  amount: number
  date: string
  status: string
  kilometers?: number
  expense_type?: string
  receipt_number?: string
  notes?: string
}

export interface AttendanceData {
  employee_name: string
  date: string
  shift1_in?: string
  shift1_out?: string
  shift2_in?: string
  shift2_out?: string
  total_hours?: number
  status: string
}

export interface EmployeeData {
  id: number
  name: string
  position: string
  department: string
  email: string
  phone: string
  hire_date: string
  salary: number
  status: string
}

export class PDFService {
  // Generate detailed expense report
  static generateDetailedExpenseReport(
    expenses: ExpenseData[],
    startDate: string,
    endDate: string
  ): string {
    const summary = this.calculateExpenseSummary(expenses)
    const employeeExpenses = this.groupExpensesByEmployee(expenses)

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Expense Report Summary</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; color: #2e7d32; margin-bottom: 30px; }
        .summary { display: flex; justify-content: space-around; margin: 20px 0; }
        .summary-box { background: #f5f5f5; padding: 15px; border-radius: 5px; text-align: center; }
        .summary-box h3 { margin: 0; color: #666; font-size: 12px; }
        .summary-box .value { font-size: 18px; font-weight: bold; color: #2e7d32; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; font-weight: bold; }
        .employee-section { margin: 30px 0; }
        .employee-header { background: #e3f2fd; padding: 10px; border-left: 4px solid #2196f3; }
        .expense-item { margin: 5px 0; padding: 5px; background: #f9f9f9; }
        .amount { color: #2e7d32; font-weight: bold; }
        .date { color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>EXPENSE REPORT SUMMARY</h1>
        <p>Generated on: ${new Date().toLocaleString()}</p>
        <p>Date Range: ${startDate} to ${endDate}</p>
    </div>

    <div class="summary">
        <div class="summary-box">
            <h3>TOTAL EXPENSES</h3>
            <div class="value">₹${summary.totalAmount.toLocaleString()}</div>
        </div>
        <div class="summary-box">
            <h3>APPROVED</h3>
            <div class="value">₹${summary.approvedAmount.toLocaleString()}</div>
        </div>
        <div class="summary-box">
            <h3>PENDING</h3>
            <div class="value">₹${summary.pendingAmount.toLocaleString()}</div>
        </div>
        <div class="summary-box">
            <h3>RECORDS</h3>
            <div class="value">${summary.totalRecords}</div>
        </div>
    </div>

    <h2>EMPLOYEE EXPENSE SUMMARY</h2>
    <table>
        <thead>
            <tr>
                <th>Employee</th>
                <th>Total Amount</th>
                <th>Expenses Count</th>
            </tr>
        </thead>
        <tbody>
            ${Object.entries(employeeExpenses).map(([employee, exp]) => `
                <tr>
                    <td>${employee}</td>
                    <td class="amount">₹${exp.reduce((sum, e) => sum + Number(e.amount), 0).toLocaleString()}</td>
                    <td>${exp.length}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>

    <h2>DETAILED BREAKDOWN</h2>
    ${Object.entries(employeeExpenses).map(([employee, expenses]) => {
      const empTotal = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0)
      const generalExpenses = expenses.filter(exp => exp.expense_type !== 'Travel' && !this.isTravelExpense(exp))
      const travelExpenses = expenses.filter(exp => exp.expense_type === 'Travel' || this.isTravelExpense(exp))
      
      return `
        <div class="employee-section">
            <div class="employee-header">
                <h3>${employee.toUpperCase()}</h3>
                <p>Total: <span class="amount">₹${empTotal.toLocaleString()}</span></p>
            </div>
            
            ${generalExpenses.length > 0 ? `
                <h4>General Expenses:</h4>
                ${generalExpenses.map(expense => `
                    <div class="expense-item">
                        <strong>${expense.description}</strong> - 
                        <span class="amount">₹${Number(expense.amount).toLocaleString()}</span> - 
                        <span class="date">${new Date(expense.date).toLocaleDateString()} - ${expense.status}</span>
                    </div>
                `).join('')}
            ` : ''}
            
            ${travelExpenses.length > 0 ? `
                <h4>Travel Expenses:</h4>
                ${travelExpenses.map(expense => `
                    <div class="expense-item">
                        <strong>${expense.description}</strong> - 
                        <span class="amount">₹${Number(expense.amount).toLocaleString()}</span> - 
                        <span class="date">${new Date(expense.date).toLocaleDateString()}</span>
                        ${expense.kilometers ? `<br>Distance: ${expense.kilometers} km` : ''}
                        ${expense.receipt_number ? `<br>Receipt: ${expense.receipt_number}` : ''}
                        <br>Status: ${expense.status}
                    </div>
                `).join('')}
            ` : ''}
        </div>
      `
    }).join('')}
</body>
</html>
    `
  }

  // Generate general expense report
  static generateGeneralExpenseReport(
    expenses: ExpenseData[],
    startDate: string,
    endDate: string
  ): string {
    const generalExpenses = expenses.filter(exp => 
      exp.expense_type !== 'Travel' && 
      !this.isTravelExpense(exp)
    )
    
    const summary = this.calculateExpenseSummary(generalExpenses)
    const employeeExpenses = this.groupExpensesByEmployee(generalExpenses)

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>General Expense Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; color: #2e7d32; margin-bottom: 30px; }
        .summary { display: flex; justify-content: space-around; margin: 20px 0; }
        .summary-box { background: #f5f5f5; padding: 15px; border-radius: 5px; text-align: center; }
        .summary-box h3 { margin: 0; color: #666; font-size: 12px; }
        .summary-box .value { font-size: 18px; font-weight: bold; color: #2e7d32; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; font-weight: bold; }
        .employee-section { margin: 30px 0; }
        .employee-header { background: #e3f2fd; padding: 10px; border-left: 4px solid #2196f3; }
        .expense-item { margin: 5px 0; padding: 5px; background: #f9f9f9; }
        .amount { color: #2e7d32; font-weight: bold; }
        .date { color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>GENERAL EXPENSE REPORT</h1>
        <p>Date Range: ${startDate} to ${endDate}</p>
    </div>

    <div class="summary">
        <div class="summary-box">
            <h3>TOTAL AMOUNT</h3>
            <div class="value">₹${summary.totalAmount.toLocaleString()}</div>
        </div>
        <div class="summary-box">
            <h3>RECORDS</h3>
            <div class="value">${summary.totalRecords}</div>
        </div>
    </div>

    <h2>EMPLOYEE BREAKDOWN</h2>
    ${Object.entries(employeeExpenses).map(([employee, expenses]) => {
      const empTotal = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0)
      
      return `
        <div class="employee-section">
            <div class="employee-header">
                <h3>${employee.toUpperCase()}</h3>
                <p>Total: <span class="amount">₹${empTotal.toLocaleString()}</span></p>
            </div>
            
            ${expenses.map(expense => `
                <div class="expense-item">
                    <strong>${expense.description}</strong> - 
                    <span class="amount">₹${Number(expense.amount).toLocaleString()}</span> - 
                    <span class="date">${new Date(expense.date).toLocaleDateString()} - ${expense.status}</span>
                </div>
            `).join('')}
        </div>
      `
    }).join('')}
</body>
</html>
    `
  }

  // Generate travel expense report
  static generateTravelExpenseReport(
    expenses: ExpenseData[],
    startDate: string,
    endDate: string
  ): string {
    const travelExpenses = expenses.filter(exp => 
      exp.expense_type === 'Travel' || 
      this.isTravelExpense(exp)
    )
    
    const summary = this.calculateExpenseSummary(travelExpenses)
    const employeeExpenses = this.groupExpensesByEmployee(travelExpenses)
    const totalDistance = travelExpenses.reduce((sum, exp) => sum + Number(exp.kilometers || 0), 0)

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Travel Expense Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; color: #2e7d32; margin-bottom: 30px; }
        .summary { display: flex; justify-content: space-around; margin: 20px 0; }
        .summary-box { background: #f5f5f5; padding: 15px; border-radius: 5px; text-align: center; }
        .summary-box h3 { margin: 0; color: #666; font-size: 12px; }
        .summary-box .value { font-size: 18px; font-weight: bold; color: #2e7d32; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; font-weight: bold; }
        .employee-section { margin: 30px 0; }
        .employee-header { background: #e3f2fd; padding: 10px; border-left: 4px solid #2196f3; }
        .expense-item { margin: 5px 0; padding: 5px; background: #f9f9f9; }
        .amount { color: #2e7d32; font-weight: bold; }
        .date { color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>TRAVEL EXPENSE REPORT</h1>
        <p>Date Range: ${startDate} to ${endDate}</p>
    </div>

    <div class="summary">
        <div class="summary-box">
            <h3>TOTAL AMOUNT</h3>
            <div class="value">₹${summary.totalAmount.toLocaleString()}</div>
        </div>
        <div class="summary-box">
            <h3>TOTAL DISTANCE</h3>
            <div class="value">${totalDistance.toFixed(1)} km</div>
        </div>
        <div class="summary-box">
            <h3>RECORDS</h3>
            <div class="value">${summary.totalRecords}</div>
        </div>
    </div>

    <h2>EMPLOYEE TRAVEL EXPENSE SUMMARY</h2>
    <table>
        <thead>
            <tr>
                <th>Employee</th>
                <th>Total Amount</th>
                <th>Total Distance</th>
                <th>Expenses Count</th>
            </tr>
        </thead>
        <tbody>
            ${Object.entries(employeeExpenses).map(([employee, expenses]) => {
              const empTotal = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0)
              const empDistance = expenses.reduce((sum, exp) => sum + Number(exp.kilometers || 0), 0)
              return `
                <tr>
                    <td>${employee}</td>
                    <td class="amount">₹${empTotal.toLocaleString()}</td>
                    <td>${empDistance.toFixed(1)} km</td>
                    <td>${expenses.length}</td>
                </tr>
              `
            }).join('')}
        </tbody>
    </table>

    <h2>DETAILED BREAKDOWN</h2>
    ${Object.entries(employeeExpenses).map(([employee, expenses]) => {
      const empTotal = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0)
      
      return `
        <div class="employee-section">
            <div class="employee-header">
                <h3>${employee.toUpperCase()}</h3>
                <p>Total: <span class="amount">₹${empTotal.toLocaleString()}</span></p>
            </div>
            
            ${expenses.map(expense => `
                <div class="expense-item">
                    <strong>${expense.description}</strong> - 
                    <span class="amount">₹${Number(expense.amount).toLocaleString()}</span> - 
                    <span class="date">${new Date(expense.date).toLocaleDateString()}</span>
                    ${expense.kilometers ? `<br>Distance: ${expense.kilometers} km` : ''}
                    ${expense.receipt_number ? `<br>Receipt: ${expense.receipt_number}` : ''}
                    <br>Status: ${expense.status}
                </div>
            `).join('')}
        </div>
      `
    }).join('')}
</body>
</html>
    `
  }

  // Generate attendance report
  static generateAttendanceReport(
    attendance: AttendanceData[],
    startDate: string,
    endDate: string
  ): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Attendance Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; color: #2e7d32; margin-bottom: 30px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; font-weight: bold; }
        .amount { color: #2e7d32; font-weight: bold; }
    </style>
</head>
<body>
    <div class="header">
        <h1>ATTENDANCE REPORT</h1>
        <p>Date Range: ${startDate} to ${endDate}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>Employee</th>
                <th>Date</th>
                <th>Shift 1</th>
                <th>Shift 2</th>
                <th>Total Hours</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            ${attendance.map(record => `
                <tr>
                    <td>${record.employee_name}</td>
                    <td>${record.date}</td>
                    <td>${record.shift1_in && record.shift1_out ? `${record.shift1_in}-${record.shift1_out}` : 'N/A'}</td>
                    <td>${record.shift2_in && record.shift2_out ? `${record.shift2_in}-${record.shift2_out}` : 'N/A'}</td>
                    <td class="amount">${record.total_hours || 0}h</td>
                    <td>${record.status}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>
</body>
</html>
    `
  }

  // Generate employee report
  static generateEmployeeReport(employees: EmployeeData[]): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Employee Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; color: #2e7d32; margin-bottom: 30px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; font-weight: bold; }
    </style>
</head>
<body>
    <div class="header">
        <h1>EMPLOYEE REPORT</h1>
        <p>Generated on: ${new Date().toLocaleString()}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>Name</th>
                <th>Position</th>
                <th>Department</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            ${employees.map(emp => `
                <tr>
                    <td>${emp.name}</td>
                    <td>${emp.position}</td>
                    <td>${emp.department}</td>
                    <td>${emp.email}</td>
                    <td>${emp.phone}</td>
                    <td>${emp.status}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>
</body>
</html>
    `
  }

  // Helper methods
  private static calculateExpenseSummary(expenses: ExpenseData[]) {
    const totalAmount = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0)
    const approvedAmount = expenses
      .filter(exp => exp.status === 'Approved')
      .reduce((sum, exp) => sum + Number(exp.amount), 0)
    const pendingAmount = totalAmount - approvedAmount

    return {
      totalAmount,
      approvedAmount,
      pendingAmount,
      totalRecords: expenses.length
    }
  }

  private static groupExpensesByEmployee(expenses: ExpenseData[]) {
    const grouped: { [key: string]: ExpenseData[] } = {}
    expenses.forEach(expense => {
      if (!grouped[expense.employee_name]) {
        grouped[expense.employee_name] = []
      }
      grouped[expense.employee_name].push(expense)
    })
    return grouped
  }

  private static isTravelExpense(expense: ExpenseData): boolean {
    const travelCategories = ['Taxi', 'Fuel', 'Toll', 'Parking', 'Flight', 'Hotel', 'Travel', 'Transport']
    const travelKeywords = ['taxi', 'fuel', 'toll', 'parking', 'flight', 'hotel', 'travel', 'transport', 'uber', 'ola', 'metro', 'bus', 'cab', 'ride']
    
    return travelCategories.some(cat => 
      expense.category && expense.category.toLowerCase().includes(cat.toLowerCase())
    ) || travelKeywords.some(keyword => 
      expense.description && expense.description.toLowerCase().includes(keyword)
    )
  }
}