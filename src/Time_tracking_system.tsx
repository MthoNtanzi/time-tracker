import React, { useState, useEffect } from 'react';
import { Clock, Users, AlertCircle, Mail, User, Coffee, LogOut, LogIn } from 'lucide-react';

// Mock database - In real implementation, this would be PostgreSQL
const mockEmployees = [
  { id: 1, name: 'Bongani Mkhize', email: 'bmkhize@company.com', department: 'Engineering' },
  { id: 2, name: 'Jane Smith', email: 'jane@company.com', department: 'Marketing' },
  { id: 3, name: 'Mike Johnson', email: 'mike@company.com', department: 'Sales' },
  { id: 4, name: 'Sarah Wilson', email: 'sarah@company.com', department: 'HR' },
  { id: 5, name: 'David Brown', email: 'david@company.com', department: 'Finance' }
];

const TimeTrackingSystem = () => {
  const [currentUser, setCurrentUser] = useState('employee'); // 'employee' or 'admin'
  const [timeRecords, setTimeRecords] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedEmail, setSelectedEmail] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Check for late employees at 9 AM
  useEffect(() => {
    const checkLateEmployees = () => {
      const now = new Date();
      const hour = now.getHours();
      const minute = now.getMinutes();
      
      // Check if it's past 9 AM
      if (hour >= 9) {
        const today = now.toDateString();
        const clockedInToday = timeRecords
          .filter(record => 
            record.date === today && 
            record.type === 'clock_in'
          )
          .map(record => record.employeeId);
        
        const lateEmployees = mockEmployees.filter(emp => 
          !clockedInToday.includes(emp.id)
        );
        
        if (lateEmployees.length > 0) {
          const notification = {
            id: Date.now(),
            type: 'late_employees',
            message: `${lateEmployees.length} employees haven't clocked in yet`,
            employees: lateEmployees,
            timestamp: now
          };
          
          setNotifications(prev => {
            // Avoid duplicate notifications for the same day
            const existingNotification = prev.find(n => 
              n.type === 'late_employees' && 
              n.timestamp.toDateString() === today
            );
            
            if (!existingNotification) {
              return [notification, ...prev];
            }
            return prev;
          });
        }
      }
    };
    
    const interval = setInterval(checkLateEmployees, 60000); // Check every minute
    checkLateEmployees(); // Check immediately
    
    return () => clearInterval(interval);
  }, [timeRecords]);

  const handleClockAction = (actionType) => {
    if (!selectedEmployee || !selectedEmail) {
      alert('Please select both Employee ID and Email');
      return;
    }

    const employee = mockEmployees.find(emp => 
      emp.id.toString() === selectedEmployee && emp.email === selectedEmail
    );

    if (!employee) {
      alert('Invalid employee credentials');
      return;
    }

    const now = new Date();
    const newRecord = {
      id: Date.now(),
      employeeId: employee.id,
      employeeName: employee.name,
      email: employee.email,
      type: actionType,
      timestamp: now,
      date: now.toDateString(),
      time: now.toLocaleTimeString()
    };

    setTimeRecords(prev => [newRecord, ...prev]);
    
    // Show success message
    const actionMessages = {
      'clock_in': 'Clocked in successfully!',
      'break_start': 'Break started!',
      'break_end': 'Break ended!',
      'clock_out': 'Clocked out successfully!'
    };
    
    alert(actionMessages[actionType]);
  };

  const calculateHoursWorked = (employeeId, date) => {
    const dayRecords = timeRecords.filter(record => 
      record.employeeId === employeeId && record.date === date
    );
    
    const clockIn = dayRecords.find(r => r.type === 'clock_in');
    const clockOut = dayRecords.find(r => r.type === 'clock_out');
    
    if (!clockIn || !clockOut) return 'Incomplete';
    
    const hoursWorked = (clockOut.timestamp - clockIn.timestamp) / (1000 * 60 * 60);
    return `${hoursWorked.toFixed(2)} hours`;
  };

  const getTodayRecords = () => {
    const today = new Date().toDateString();
    return timeRecords.filter(record => record.date === today);
  };

  const getEmployeeStatus = (employeeId) => {
    const today = new Date().toDateString();
    const todayRecords = timeRecords
      .filter(record => record.employeeId === employeeId && record.date === today)
      .sort((a, b) => b.timestamp - a.timestamp);
    
    if (todayRecords.length === 0) return 'Not clocked in';
    
    const lastAction = todayRecords[0].type;
    const statusMap = {
      'clock_in': 'Working',
      'break_start': 'On Break',
      'break_end': 'Working',
      'clock_out': 'Clocked Out'
    };
    
    return statusMap[lastAction] || 'Unknown';
  };

  if (currentUser === 'employee') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                <Clock className="mr-2" />
                Time Clock
              </h1>
              <button
                onClick={() => setCurrentUser('admin')}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Admin View
              </button>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-mono text-gray-700">
                {currentTime.toLocaleTimeString()}
              </div>
              <div className="text-sm text-gray-500">
                {currentTime.toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Employee Selection */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Employee Login</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Employee ID
              </label>
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Employee ID</option>
                {mockEmployees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.id} - {emp.name}</option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <select
                value={selectedEmail}
                onChange={(e) => setSelectedEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Email</option>
                {mockEmployees.map(emp => (
                  <option key={emp.id} value={emp.email}>{emp.email}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleClockAction('clock_in')}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center transition-colors"
              >
                <LogIn className="mr-2 h-5 w-5" />
                Clock In
              </button>
              
              <button
                onClick={() => handleClockAction('break_start')}
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center transition-colors"
              >
                <Coffee className="mr-2 h-5 w-5" />
                Start Break
              </button>
              
              <button
                onClick={() => handleClockAction('break_end')}
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center transition-colors"
              >
                <Coffee className="mr-2 h-5 w-5" />
                End Break
              </button>
              
              <button
                onClick={() => handleClockAction('clock_out')}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center transition-colors"
              >
                <LogOut className="mr-2 h-5 w-5" />
                Clock Out
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Admin View
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-800 flex items-center">
              <Users className="mr-3" />
              Admin Dashboard
            </h1>
            <button
              onClick={() => setCurrentUser('employee')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Employee View
            </button>
          </div>
        </div>

        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold text-red-800 flex items-center mb-3">
              <AlertCircle className="mr-2" />
              Notifications
            </h2>
            {notifications.map(notification => (
              <div key={notification.id} className="mb-2">
                <div className="flex items-center justify-between">
                  <span className="text-red-700">{notification.message}</span>
                  <div className="flex items-center text-sm text-red-600">
                    <Mail className="mr-1 h-4 w-4" />
                    Email Sent
                  </div>
                </div>
                <div className="text-sm text-red-600 mt-1">
                  Employees: {notification.employees.map(emp => emp.name).join(', ')}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Employee Status */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Current Employee Status</h2>
            <div className="space-y-3">
              {mockEmployees.map(employee => (
                <div key={employee.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">{employee.name}</div>
                    <div className="text-sm text-gray-600">{employee.department}</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-medium px-2 py-1 rounded-full ${
                      getEmployeeStatus(employee.id) === 'Working' ? 'bg-green-100 text-green-800' :
                      getEmployeeStatus(employee.id) === 'On Break' ? 'bg-yellow-100 text-yellow-800' :
                      getEmployeeStatus(employee.id) === 'Clocked Out' ? 'bg-gray-100 text-gray-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {getEmployeeStatus(employee.id)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Hours: {calculateHoursWorked(employee.id, new Date().toDateString())}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Today's Activity</h2>
            <div className="max-h-96 overflow-y-auto space-y-2">
              {getTodayRecords().map(record => (
                <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-gray-400 mr-2" />
                    <div>
                      <div className="font-medium text-sm">{record.employeeName}</div>
                      <div className="text-xs text-gray-600">
                        {record.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-mono">{record.time}</div>
                    <div className="text-xs text-gray-500">{record.date}</div>
                  </div>
                </div>
              ))}
              {getTodayRecords().length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  No activity recorded today
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Hours Summary */}
        <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">Hours Summary (Today)</h2>
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-3">Employee</th>
                  <th className="text-left p-3">Department</th>
                  <th className="text-left p-3">Clock In</th>
                  <th className="text-left p-3">Clock Out</th>
                  <th className="text-left p-3">Hours Worked</th>
                  <th className="text-left p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {mockEmployees.map(employee => {
                  const today = new Date().toDateString();
                  const employeeRecords = timeRecords.filter(r => 
                    r.employeeId === employee.id && r.date === today
                  );
                  const clockIn = employeeRecords.find(r => r.type === 'clock_in');
                  const clockOut = employeeRecords.find(r => r.type === 'clock_out');
                  
                  return (
                    <tr key={employee.id} className="border-b">
                      <td className="p-3 font-medium">{employee.name}</td>
                      <td className="p-3 text-gray-600">{employee.department}</td>
                      <td className="p-3">{clockIn ? clockIn.time : '-'}</td>
                      <td className="p-3">{clockOut ? clockOut.time : '-'}</td>
                      <td className="p-3">{calculateHoursWorked(employee.id, today)}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          getEmployeeStatus(employee.id) === 'Working' ? 'bg-green-100 text-green-800' :
                          getEmployeeStatus(employee.id) === 'On Break' ? 'bg-yellow-100 text-yellow-800' :
                          getEmployeeStatus(employee.id) === 'Clocked Out' ? 'bg-gray-100 text-gray-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {getEmployeeStatus(employee.id)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeTrackingSystem;