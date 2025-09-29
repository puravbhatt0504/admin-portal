// --- Configuration ---
// API base URL for the backend
let API_BASE_URL = 'https://finalboss0504.pythonanywhere.com';

// --- Mobile Error Handling ---
function handleMobileErrors() {
    // Global error handler for mobile
    window.addEventListener('error', (e) => {
        console.warn('Mobile error caught:', e.error);
        // Don't show error to user, just log it
    });
    
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (e) => {
        console.warn('Mobile promise rejection:', e.reason);
        e.preventDefault(); // Prevent console error
    });
    
    // Handle network errors gracefully
    window.addEventListener('online', () => {
        console.log('Network connection restored');
    });
    
    window.addEventListener('offline', () => {
        console.log('Network connection lost');
    });
}

// --- Mobile Functionality ---
function initMobileFeatures() {
    try {
        const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
        const sidebar = document.getElementById('sidebar');
        const mobileSidebarOverlay = document.getElementById('mobile-sidebar-overlay');
        const mobileDarkModeToggle = document.getElementById('mobileDarkModeToggle');
        
        // Mobile menu toggle with error handling
        if (mobileMenuToggle && sidebar) {
            mobileMenuToggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                try {
                    sidebar.classList.toggle('show');
                    if (mobileSidebarOverlay) {
                        mobileSidebarOverlay.classList.toggle('show');
                    }
                } catch (error) {
                    console.warn('Mobile menu toggle error:', error);
                }
            });
        }
        
        // Close sidebar when clicking overlay with error handling
        if (mobileSidebarOverlay) {
            mobileSidebarOverlay.addEventListener('click', (e) => {
                e.preventDefault();
                try {
                    sidebar.classList.remove('show');
                    mobileSidebarOverlay.classList.remove('show');
                } catch (error) {
                    console.warn('Mobile overlay click error:', error);
                }
            });
        }
        
        // Close sidebar when clicking nav links on mobile
        const navLinks = document.querySelectorAll('.sidebar .nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                try {
                    if (window.innerWidth <= 768) {
                        sidebar.classList.remove('show');
                        if (mobileSidebarOverlay) {
                            mobileSidebarOverlay.classList.remove('show');
                        }
                    }
                } catch (error) {
                    console.warn('Nav link click error:', error);
                }
            });
        });
        
        // Sync mobile dark mode toggle with main toggle
        if (mobileDarkModeToggle && darkModeToggle) {
            mobileDarkModeToggle.addEventListener('change', (e) => {
                try {
                    darkModeToggle.checked = e.target.checked;
                    darkModeToggle.dispatchEvent(new Event('change'));
                } catch (error) {
                    console.warn('Mobile dark mode sync error:', error);
                }
            });
            
            darkModeToggle.addEventListener('change', (e) => {
                try {
                    mobileDarkModeToggle.checked = e.target.checked;
                } catch (error) {
                    console.warn('Dark mode sync error:', error);
                }
            });
        }
        
        // Handle window resize with debouncing
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                try {
                    if (window.innerWidth > 768) {
                        sidebar.classList.remove('show');
                        if (mobileSidebarOverlay) {
                            mobileSidebarOverlay.classList.remove('show');
                        }
                    }
                } catch (error) {
                    console.warn('Window resize error:', error);
                }
            }, 100);
        });
        
        // Touch gestures for mobile with error handling
        let startX = 0;
        let startY = 0;
        let touchStartTime = 0;
        
        document.addEventListener('touchstart', (e) => {
            try {
                if (e.touches && e.touches.length === 1) {
                    startX = e.touches[0].clientX;
                    startY = e.touches[0].clientY;
                    touchStartTime = Date.now();
                }
            } catch (error) {
                console.warn('Touch start error:', error);
            }
        }, { passive: true });
        
        document.addEventListener('touchend', (e) => {
            try {
                if (!startX || !startY || !e.changedTouches) return;
                
                const touchDuration = Date.now() - touchStartTime;
                if (touchDuration > 500) return; // Ignore long touches
                
                const endX = e.changedTouches[0].clientX;
                const endY = e.changedTouches[0].clientY;
                
                const diffX = startX - endX;
                const diffY = startY - endY;
                
                // Swipe left to close sidebar
                if (Math.abs(diffX) > Math.abs(diffY) && diffX > 50 && sidebar.classList.contains('show')) {
                    sidebar.classList.remove('show');
                    if (mobileSidebarOverlay) {
                        mobileSidebarOverlay.classList.remove('show');
                    }
                }
                
                startX = 0;
                startY = 0;
            } catch (error) {
                console.warn('Touch end error:', error);
            }
        }, { passive: true });
        
        // Prevent zoom on double tap
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, { passive: false });
        
        // Handle orientation change
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                try {
                    if (window.innerWidth > 768) {
                        sidebar.classList.remove('show');
                        if (mobileSidebarOverlay) {
                            mobileSidebarOverlay.classList.remove('show');
                        }
                    }
                } catch (error) {
                    console.warn('Orientation change error:', error);
                }
            }, 100);
        });
        
    } catch (error) {
        console.error('Mobile features initialization error:', error);
    }
}

// --- DOM Elements ---
const themeContainer = document.getElementById('theme-container');
const darkModeToggle = document.getElementById('darkModeToggle');
const headerTitle = document.getElementById('header-title');
const confirmationModal = new bootstrap.Modal(document.getElementById('confirmationModal'));
const modalConfirmBtn = document.getElementById('modal-confirm-btn');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');
const addEmployeeBtn = document.getElementById('add-employee-btn');
const newEmployeeInput = document.getElementById('new-employee-name');
const removeEmployeeBtn = document.getElementById('remove-employee-btn');
const removeEmployeeSelect = document.getElementById('remove-employee-select');
const attUpdateBtn = document.getElementById('att-update-btn');
const attViewBtn = document.getElementById('att-view-btn');
const attDeleteBtn = document.getElementById('att-delete-btn');
const travelLogBtn = document.getElementById('travel-log-btn');
const travelLoadBtn = document.getElementById('travel-load-btn');
const travelViewBtn = document.getElementById('travel-view-btn');
const travelDeleteLastBtn = document.getElementById('travel-delete-last-btn');
const genSaveBtn = document.getElementById('gen-save-btn');
const genAddItemBtn = document.getElementById('gen-add-item-btn');
const genLoadBtn = document.getElementById('gen-load-btn');
const genViewBtn = document.getElementById('gen-view-btn');
const genDeleteLastBtn = document.getElementById('gen-delete-last-btn');
const advLogBtn = document.getElementById('adv-log-btn');
const advDeleteLastBtn = document.getElementById('adv-delete-last-btn');
const advViewDayBtn = document.getElementById('adv-view-day-btn');
const advViewMonthBtn = document.getElementById('adv-view-month-btn');
const salaryFetchBtn = document.getElementById('salary-fetch-btn');
const salaryPreviewBtn = document.getElementById('salary-preview-btn');
const salaryExportBtn = document.getElementById('salary-export-btn');
const salaryPeriodRadios = document.querySelectorAll('input[name="salaryPeriod"]');
const salaryMonthContainer = document.getElementById('salary-month-container');
const salaryCustomContainer = document.getElementById('salary-custom-container');
const reportGenerateBtn = document.getElementById('report-generate-btn');
const reportPresetToday = document.getElementById('report-preset-today');
const reportPresetWeek = document.getElementById('report-preset-week');
const reportPresetMonth = document.getElementById('report-preset-month');
const scanExpensesBtn = document.getElementById('scan-expenses-btn');
const analyzeAttritionBtn = document.getElementById('analyze-attrition-btn');
const settingSaveBtn = document.getElementById('setting-save-btn');
const dangerDeleteAllBtn = document.getElementById('danger-delete-all-btn');
const statPresentCount = document.getElementById('stat-present-count');
const statLateCount = document.getElementById('stat-late-count');
const statAbsentCount = document.getElementById('stat-absent-count');
const whosOutContainer = document.getElementById('whos-out-container');

// --- Global Variables ---
let attendanceChart = null, expenseChart = null;
let actionToConfirm = null;

// --- Helper Functions ---
function showButtonSpinner(button, text = 'Loading...') {
    if (!button) return null;
    button.disabled = true;
    const originalText = button.innerHTML;
    button.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> ${text}`;
    return originalText;
}

function hideButtonSpinner(button, originalText) {
    if (!button) return;
    button.disabled = false;
    if (typeof originalText === 'string') {
        button.innerHTML = originalText;
    }
}

function showToast(message, type = 'success') {
    const toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        console[type === 'success' ? 'log' : 'error'](message);
        return;
    }
    const toastId = `toast-${Date.now()}`;
    const icon = type === 'success' ? '<i class="bi bi-check-circle-fill text-success me-2"></i>' : '<i class="bi bi-exclamation-triangle-fill text-danger me-2"></i>';
    const toastHTML = `<div id="${toastId}" class="toast" role="alert" aria-live="assertive" aria-atomic="true"><div class="toast-header">${icon}<strong class="me-auto">${type === 'success' ? 'Success' : 'Error'}</strong><button type="button" class="btn-close" data-bs-dismiss="toast"></button></div><div class="toast-body">${message}</div></div>`;
    toastContainer.insertAdjacentHTML('beforeend', toastHTML);
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, { delay: 5000 });
    toast.show();
    toastElement.addEventListener('hidden.bs.toast', () => toastElement.remove());
}

function showSkeletonLoader(containerId, rows = 3) {
    const container = document.getElementById(containerId);
    if (!container) return;
    let skeletonHTML = '';
    for (let i = 0; i < rows; i++) {
        skeletonHTML += '<div class="skeleton-loader skeleton-row"></div>';
    }
    container.innerHTML = skeletonHTML;
}

function markInvalid(input, message) {
    if (!input) return;
    input.classList.add('error-state');
    showToast(message, 'error');
    setTimeout(() => input.classList.remove('error-state'), 1500);
}

// --- API Abstraction ---
function withTimeout(promise, ms = 10000, controller) {
    return new Promise((resolve, reject) => {
        const id = setTimeout(() => {
            if (controller) controller.abort();
            reject(new Error('Request timed out'));
        }, ms);
        promise.then((res) => { clearTimeout(id); resolve(res); })
               .catch((err) => { clearTimeout(id); reject(err); });
    });
}

async function apiRequest(endpoint, method = 'GET', body = null, { timeoutMs = 10000, retries = 1 } = {}) {
    const controller = new AbortController();
    const options = { method, headers: {}, signal: controller.signal };
    if (body) {
        options.headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(body);
    }
    let attempt = 0; let lastErr;
    while (attempt <= retries) {
        try {
            const resp = await withTimeout(fetch(`${API_BASE_URL}${endpoint}`, options), timeoutMs, controller);
            if (!resp.ok) {
                const errorData = await resp.json().catch(() => ({ message: 'A server error occurred.' }));
                throw new Error(errorData.message || `HTTP ${resp.status}`);
            }
            const contentType = resp.headers.get('Content-Type') || '';
            if (contentType.includes('application/pdf')) return resp.blob();
            return resp.json();
        } catch (e) {
            lastErr = e;
            if (attempt === retries || method !== 'GET') break;
            await new Promise(r => setTimeout(r, 300 * (attempt + 1))); // backoff
            attempt++;
        }
    }
    throw lastErr || new Error('Network error');
}

// API_BASE_URL is now hardcoded to the backend URL

// --- Event Listeners Setup ---
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Initialize mobile error handling first
        handleMobileErrors();
        
        // Initialize mobile features
        initMobileFeatures();
        
        // Apply theme with error handling
        try {
            applyTheme(localStorage.getItem('theme') || 'light');
        } catch (error) {
            console.warn('Theme application error:', error);
        }
        
        // Load data with error handling
        try {
            await loadDashboardData();
        } catch (error) {
            console.warn('Dashboard data load error:', error);
        }
        
        try {
            await loadEmployees();
        } catch (error) {
            console.warn('Employees load error:', error);
        }
        
        try {
            await loadConfig();
        } catch (error) {
            console.warn('Config load error:', error);
        }
        
        try {
            addGeneralExpenseItem();
        } catch (error) {
            console.warn('General expense item error:', error);
        }
        
        try {
            initializeUIEnhancements();
        } catch (error) {
            console.warn('UI enhancements error:', error);
        }
        
        // Set today's date with error handling
        try {
            const today = new Date().toISOString().split('T')[0];
            document.querySelectorAll('input[type="date"]').forEach(input => {
                if (input) input.value = today;
            });
        } catch (error) {
            console.warn('Date input error:', error);
        }
        
        // Add navigation listeners with error handling
        try {
            document.querySelectorAll('#mainTab .nav-link').forEach(link => {
                if (link && headerTitle) {
                    link.addEventListener('click', () => {
                        const title = link.getAttribute('data-header-title');
                        if (title) headerTitle.textContent = title;
                    });
                }
            });
        } catch (error) {
            console.warn('Navigation listener error:', error);
        }
        
        // Add theme toggle listener with error handling
        try {
            if (darkModeToggle) {
                darkModeToggle.addEventListener('change', handleThemeToggle);
            }
        } catch (error) {
            console.warn('Theme toggle error:', error);
        }
        
        // Add modal confirmation listener with error handling
        try {
            if (modalConfirmBtn) {
                modalConfirmBtn.addEventListener('click', () => { 
                    if (typeof actionToConfirm === 'function') actionToConfirm(); 
                });
            }
        } catch (error) {
            console.warn('Modal confirmation error:', error);
        }
        
        // Set up interval with error handling
        try {
            setInterval(() => {
                try {
                    loadTodaysAttendanceStatus();
                } catch (error) {
                    console.warn('Attendance status load error:', error);
                }
            }, 60000);
        } catch (error) {
            console.warn('Interval setup error:', error);
        }
    } catch (error) {
        console.error('Main initialization error:', error);
    }

    addEmployeeBtn.addEventListener('click', () => {
        const name = newEmployeeInput.value.trim();
        if (!name) return markInvalid(newEmployeeInput, 'Please enter employee name.');
        addEmployee();
    });

    attUpdateBtn.addEventListener('click', () => {
        const emp = document.getElementById('att-employee-select');
        const date = document.getElementById('att-date');
        if (!emp.value) return markInvalid(emp, 'Please select employee.');
        if (!date.value) return markInvalid(date, 'Please select date.');
        addUpdateAttendance();
    });

    travelLogBtn.addEventListener('click', () => {
        const emp = document.getElementById('travel-employee-select');
        const startR = document.getElementById('travel-start-reading');
        const endR = document.getElementById('travel-end-reading');
        if (!emp.value) return markInvalid(emp, 'Please select an employee.');
        if (parseFloat(endR.value) <= parseFloat(startR.value)) return markInvalid(endR, 'End reading must be greater than start reading.');
        logTravel();
    });

    genSaveBtn.addEventListener('click', () => {
        const emp = document.getElementById('gen-employee-select');
        const date = document.getElementById('gen-date');
        if (!emp.value) return markInvalid(emp, 'Please select an employee.');
        if (!date.value) return markInvalid(date, 'Please select a date.');
        const hasItem = Array.from(document.querySelectorAll('#general-items-container .row')).some(r => {
            const d = r.querySelector('.gen-item-desc')?.value.trim();
            const a = parseFloat(r.querySelector('.gen-item-amount')?.value || '0');
            return d && a > 0;
        });
        if (!hasItem) return showToast('Add at least one valid item.', 'error');
        saveGeneralExpenses();
    });

    advLogBtn.addEventListener('click', () => {
        const emp = document.getElementById('adv-employee-select');
        const amt = document.getElementById('adv-amount');
        const date = document.getElementById('adv-date');
        if (!emp.value) return markInvalid(emp, 'Please select an employee.');
        if (!date.value) return markInvalid(date, 'Please select a date.');
        if (!amt.value || parseFloat(amt.value) <= 0) return markInvalid(amt, 'Enter a valid amount.');
        logAdvance();
    });

    removeEmployeeBtn.addEventListener('click', () => {
        const employeeName = removeEmployeeSelect.options[removeEmployeeSelect.selectedIndex]?.text;
        if (!removeEmployeeSelect.value || !employeeName || employeeName.includes('Select')) return showToast('Please select an employee.', 'error');
        setupConfirmationModal(removeEmployee, 'Confirm Removal', `Are you sure you want to remove ${employeeName}? This is permanent.`);
    });
    
    attUpdateBtn.addEventListener('click', addUpdateAttendance);
    attViewBtn.addEventListener('click', viewDayAttendance);
    attDeleteBtn.addEventListener('click', () => setupConfirmationModal(deleteAttendance, 'Confirm Deletion', 'Are you sure you want to delete this attendance entry?'));
    
    travelLoadBtn.addEventListener('click', loadTravel);
    travelViewBtn.addEventListener('click', viewTravel);
    travelDeleteLastBtn.addEventListener('click', () => setupConfirmationModal(deleteLastTravel, 'Confirm Deletion', 'Are you sure you want to delete the last travel entry for this employee?'));

    genAddItemBtn.addEventListener('click', addGeneralExpenseItem);

    advDeleteLastBtn.addEventListener('click', () => setupConfirmationModal(deleteLastAdvance, 'Confirm Deletion', 'Are you sure you want to delete the last advance for this employee?'));
    advViewDayBtn.addEventListener('click', viewAdvancesByDay);
    advViewMonthBtn.addEventListener('click', viewAdvancesByMonth);

    salaryFetchBtn.addEventListener('click', fetchSalaryData);
    salaryPreviewBtn.addEventListener('click', () => handleSalaryPDF('preview'));
    salaryExportBtn.addEventListener('click', () => handleSalaryPDF('export'));
    salaryPeriodRadios.forEach(radio => radio.addEventListener('change', toggleSalaryPeriodView));

    reportGenerateBtn.addEventListener('click', () => generateReport());
    reportPresetToday.addEventListener('click', () => generateReport('today'));
    reportPresetWeek.addEventListener('click', () => generateReport('week'));
    reportPresetMonth.addEventListener('click', () => generateReport('month'));

    scanExpensesBtn.addEventListener('click', scanForAnomalies);
    analyzeAttritionBtn.addEventListener('click', analyzeAttrition);

    settingSaveBtn.addEventListener('click', saveSettings);
    dangerDeleteAllBtn.addEventListener('click', () => setupConfirmationModal(deleteAllAttendanceOnDate, 'Confirm Mass Deletion', "This is irreversible. Are you sure?"));
    
    // Enhanced UI Event Listeners
    const refreshBtn = document.getElementById('refresh-btn');
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    
    if (refreshBtn) {
        refreshBtn.addEventListener('click', handleRefresh);
    }
    
    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', toggleFullscreen);
    }
});

// --- Dark Mode, Charts, Tables, Modals, PDFs ---
const isDarkMode = () => localStorage.getItem('theme') === 'dark';
function applyTheme(theme) {
    themeContainer.classList.toggle('dark-mode', theme === 'dark');
    darkModeToggle.checked = theme === 'dark';
    if(attendanceChart) {
        loadDashboardData();
    }
}
function handleThemeToggle() {
    const theme = darkModeToggle.checked ? 'dark' : 'light';
    localStorage.setItem('theme', theme);
    applyTheme(theme);
}
function initCharts() {
    const isDark = isDarkMode();
    const chartOptions = { 
        responsive: true, 
        maintainAspectRatio: false, 
        scales: { 
            y: { 
                beginAtZero: true, 
                ticks: { color: isDark ? '#ccc' : '#666' } 
            }, 
            x: { 
                ticks: { color: isDark ? '#ccc' : '#666' } 
            } 
        }, 
        plugins: { 
            legend: { 
                labels: { color: isDark ? '#ccc' : '#666' } 
            } 
        } 
    };
    
    // Initialize expense chart
    if (expenseChart) expenseChart.destroy();
    const expCtx = document.getElementById('expenseChart');
    if (expCtx) {
        expenseChart = new Chart(expCtx, {
            type: 'doughnut',
            data: {
                labels: ['Travel', 'General', 'Advances'],
                datasets: [{
                    data: [0, 0, 0],
                    backgroundColor: [
                        'rgba(102, 126, 234, 0.8)',
                        'rgba(118, 75, 162, 0.8)',
                        'rgba(240, 147, 251, 0.8)'
                    ],
                    borderColor: [
                        'rgba(102, 126, 234, 1)',
                        'rgba(118, 75, 162, 1)',
                        'rgba(240, 147, 251, 1)'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: isDark ? '#ccc' : '#666' }
                    }
                }
            }
        });
    }
    
    // Load expense data
    loadExpenseData();
}

async function loadExpenseData() {
    try {
        const data = await apiRequest('/api/expenses/summary');
        if (expenseChart && data) {
            expenseChart.data.datasets[0].data = [
                data.travel_total || 0,
                data.general_total || 0,
                data.advances_total || 0
            ];
            expenseChart.update();
        }
    } catch (error) {
        console.error('Error loading expense data:', error);
    }
}
function renderDataTable(containerId, data, columns) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const tableId = `${containerId}-table`;
    container.innerHTML = `<table id="${tableId}" class="table table-striped" style="width:100%"></table>`;
    new DataTable(`#${tableId}`, { data, columns, destroy: true });
}
function setupConfirmationModal(callback, title, body) {
    actionToConfirm = callback;
    modalTitle.textContent = title;
    modalBody.textContent = body;
    confirmationModal.show();
}
async function handlePdfResponse(blob, action = 'preview', filename = 'document.pdf') {
    const url = URL.createObjectURL(blob);
    if (action === 'preview') {
        window.open(url, '_blank');
    } else {
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
    }
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// --- API Function Implementations ---

// DASHBOARD & CONFIG
async function loadDashboardData() {
    try {
        const data = await apiRequest('/api/dashboard');
        
        // Update stat cards
        if (statPresentCount) statPresentCount.textContent = data.present_count || 0;
        if (statLateCount) statLateCount.textContent = data.late_count || 0;
        if (statAbsentCount) statAbsentCount.textContent = data.absent_count || 0;
        
        // Update last updated time
        const lastUpdated = document.getElementById('last-updated-time');
        if (lastUpdated) {
            lastUpdated.textContent = `Last updated: ${new Date().toLocaleTimeString()}`;
        }
        
        // Initialize charts if they don't exist
        if (!attendanceChart && !expenseChart) {
            initCharts();
        }
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showToast('Error loading dashboard data', 'error');
    }
}

async function loadTodaysAttendanceStatus() {
    try {
        const data = await apiRequest('/api/attendance/today');
        const container = document.getElementById('today-status-container');
        
        if (container && data.records) {
            let html = '<div class="table-responsive"><table class="table table-sm">';
            html += '<thead><tr><th>Employee</th><th>Status</th><th>Check In</th><th>Check Out</th></tr></thead><tbody>';
            
            data.records.forEach(record => {
                const statusClass = record.status === 'Present' ? 'status-present' : 
                                  record.status === 'Late' ? 'status-late' : 'status-absent';
                html += `<tr>
                    <td>${record.employee_name}</td>
                    <td><span class="status-dot ${statusClass}"></span>${record.status}</td>
                    <td>${record.check_in || '-'}</td>
                    <td>${record.check_out || '-'}</td>
                </tr>`;
            });
            
            html += '</tbody></table></div>';
            container.innerHTML = html;
        }
        
        // Update who's out today
        const whosOutContainer = document.getElementById('whos-out-container');
        if (whosOutContainer && data.absent_employees) {
            let html = '';
            data.absent_employees.forEach(employee => {
                html += `<div class="d-flex align-items-center mb-2">
                    <span class="status-dot status-absent me-2"></span>
                    <span>${employee.name}</span>
                </div>`;
            });
            whosOutContainer.innerHTML = html || '<p class="text-muted">Everyone is present today!</p>';
        }
        
    } catch (error) {
        console.error('Error loading today\'s attendance:', error);
    }
}

async function loadConfig() {
    try {
        const config = await apiRequest('/api/config');
        
        // Load travel rate
        const rateInput = document.getElementById('setting-rate-km');
        if (rateInput && config.travel_rate_per_km) {
            rateInput.value = config.travel_rate_per_km;
        }
        
        // Update travel rate in travel form
        const travelRateInput = document.getElementById('travel-rate');
        if (travelRateInput && config.travel_rate_per_km) {
            travelRateInput.value = config.travel_rate_per_km;
        }
        
    } catch (error) {
        console.error('Error loading config:', error);
    }
}

async function saveSettings() {
    const rate = document.getElementById('setting-rate-km').value;
    if (!rate || rate <= 0) {
        return showToast('Please enter a valid travel rate.', 'error');
    }
    
    const originalText = showButtonSpinner(settingSaveBtn, 'Saving...');
    try {
        const result = await apiRequest('/api/config', 'POST', { travel_rate_per_km: parseFloat(rate) });
        showToast(result.message || 'Settings saved successfully!', 'success');
        
        // Update travel rate in travel form
        const travelRateInput = document.getElementById('travel-rate');
        if (travelRateInput) {
            travelRateInput.value = rate;
        }
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        hideButtonSpinner(settingSaveBtn, originalText);
    }
}

// EMPLOYEE MANAGEMENT
async function loadEmployees() {
    try {
        const data = await apiRequest('/api/employees');
        
        // Update all employee select dropdowns
        const selectElements = [
            'att-employee-select', 'travel-employee-select', 'gen-employee-select',
            'adv-employee-select', 'salary-employee-select', 'remove-employee-select'
        ];
        
        selectElements.forEach(selectId => {
            const select = document.getElementById(selectId);
            if (select) {
                select.innerHTML = '<option value="">Select Employee</option>';
                data.employees.forEach(employee => {
                    const option = document.createElement('option');
                    option.value = employee.id;
                    option.textContent = employee.name;
                    select.appendChild(option);
                });
            }
        });
        
    } catch (error) {
        console.error('Error loading employees:', error);
        showToast('Error loading employees', 'error');
    }
}

async function addEmployee() {
    const name = newEmployeeInput.value.trim();
    if (!name) {
        return showToast('Please enter employee name.', 'error');
    }
    
    const originalText = showButtonSpinner(addEmployeeBtn, 'Adding...');
    try {
        const result = await apiRequest('/api/employees', 'POST', { name });
        showToast(result.message || 'Employee added successfully!', 'success');
        newEmployeeInput.value = '';
        loadEmployees(); // Refresh the list
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        hideButtonSpinner(addEmployeeBtn, originalText);
    }
}

async function removeEmployee() {
    const employeeId = removeEmployeeSelect.value;
    if (!employeeId) {
        return showToast('Please select an employee to remove.', 'error');
    }
    
    const originalText = showButtonSpinner(modalConfirmBtn, 'Removing...');
    try {
        const result = await apiRequest(`/api/employees/${employeeId}`, 'DELETE');
        showToast(result.message || 'Employee removed successfully!', 'success');
        loadEmployees(); // Refresh the list
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        hideButtonSpinner(modalConfirmBtn, 'Confirm');
        confirmationModal.hide();
    }
}

// ATTENDANCE
async function addUpdateAttendance() {
    const payload = {
        employee_id: document.getElementById('att-employee-select').value,
        date: document.getElementById('att-date').value,
        check_in_1: document.getElementById('att-checkin1').value,
        check_out_1: document.getElementById('att-checkout1').value,
        check_in_2: document.getElementById('att-checkin2').value || null,
        check_out_2: document.getElementById('att-checkout2').value || null
    };
    
    if (!payload.employee_id || !payload.date) {
        return showToast('Please select employee and date.', 'error');
    }
    
    const originalText = showButtonSpinner(attUpdateBtn, 'Saving...');
    try {
        const result = await apiRequest('/api/attendance', 'POST', payload);
        showToast(result.message || 'Attendance updated successfully!', 'success');
        
        // Clear form
        document.getElementById('att-checkin1').value = '';
        document.getElementById('att-checkout1').value = '';
        document.getElementById('att-checkin2').value = '';
        document.getElementById('att-checkout2').value = '';
        
        // Refresh dashboard
        loadDashboardData();
        loadTodaysAttendanceStatus();
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        hideButtonSpinner(attUpdateBtn, originalText);
    }
}

async function viewDayAttendance() {
    const date = document.getElementById('att-date').value;
    if (!date) {
        return showToast('Please select a date.', 'error');
    }
    
    const originalText = showButtonSpinner(attViewBtn, 'Loading...');
    try {
        const data = await apiRequest(`/api/attendance/view?date=${date}`);
        renderDataTable('attendance-table-container', data.records, data.columns);
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        hideButtonSpinner(attViewBtn, originalText);
    }
}

async function deleteAttendance() {
    const employeeId = document.getElementById('att-employee-select').value;
    const date = document.getElementById('att-date').value;
    
    if (!employeeId || !date) {
        return showToast('Please select employee and date.', 'error');
    }
    
    const originalText = showButtonSpinner(modalConfirmBtn, 'Deleting...');
    try {
        const result = await apiRequest('/api/attendance', 'DELETE', { employee_id: employeeId, date });
        showToast(result.message || 'Attendance deleted successfully!', 'success');
        
        // Refresh dashboard
        loadDashboardData();
        loadTodaysAttendanceStatus();
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        hideButtonSpinner(modalConfirmBtn, 'Confirm');
        confirmationModal.hide();
    }
}

// TRAVEL EXPENSES
async function logTravel() {
    const payload = {
        employee_id: document.getElementById('travel-employee-select').value,
        date: document.getElementById('travel-date').value,
        start_reading: document.getElementById('travel-start-reading').value,
        end_reading: document.getElementById('travel-end-reading').value
    };
    if (!payload.employee_id) return showToast('Please select an employee.', 'error');
    if (parseFloat(payload.end_reading) <= parseFloat(payload.start_reading)) return showToast('End reading must be greater than start reading.', 'error');
    const originalText = showButtonSpinner(travelLogBtn, 'Logging...');
    try {
        const result = await apiRequest('/api/expenses/travel', 'POST', payload);
        showToast(result.message, 'success');
    } catch (error) { showToast(error.message, 'error'); } 
    finally { hideButtonSpinner(travelLogBtn, originalText); }
}

async function loadTravel() {
    const employeeId = document.getElementById('travel-employee-select').value;
    const date = document.getElementById('travel-date').value;
    if (!employeeId || !date) return showToast('Please select an employee and date.', 'error');
    const originalText = showButtonSpinner(travelLoadBtn);
    try {
        const data = await apiRequest(`/api/expenses/travel/load?employee_id=${employeeId}&date=${date}`);
        document.getElementById('travel-start-reading').value = data.start_reading || '';
        document.getElementById('travel-end-reading').value = data.end_reading || '';
        showToast('Entry loaded.', 'success');
    } catch (error) {
        showToast(error.message, 'error');
        document.getElementById('travel-start-reading').value = '';
        document.getElementById('travel-end-reading').value = '';
    } finally {
        hideButtonSpinner(travelLoadBtn, originalText);
    }
}

async function viewTravel() {
    const date = document.getElementById('travel-date').value;
    const originalText = showButtonSpinner(travelViewBtn);
    try {
        const data = await apiRequest(`/api/expenses/travel/view?date=${date}`);
        renderDataTable('travel-table-container', data.records, data.columns);
    } catch(error) { showToast(error.message, 'error'); } 
    finally { hideButtonSpinner(travelViewBtn, originalText); }
}

async function deleteLastTravel() {
    const employeeId = document.getElementById('travel-employee-select').value;
    if (!employeeId) return showToast('Please select an employee.', 'error');
    const originalText = showButtonSpinner(modalConfirmBtn, 'Deleting...');
    try {
        const result = await apiRequest(`/api/expenses/travel/last`, 'DELETE', { employee_id: employeeId });
        showToast(result.message, 'success');
    } catch (error) { showToast(error.message, 'error'); } 
    finally {
        hideButtonSpinner(modalConfirmBtn, 'Confirm');
        confirmationModal.hide();
    }
}

// GENERAL EXPENSES
async function saveGeneralExpenses() {
    const items = [];
    document.querySelectorAll('#general-items-container .row').forEach(row => {
        const description = row.querySelector('.gen-item-desc').value.trim();
        const amount = parseFloat(row.querySelector('.gen-item-amount').value);
        if (description && amount > 0) items.push({ description, amount });
    });
    if (items.length === 0) return showToast('No items to save.', 'error');
    const payload = {
        employee_id: document.getElementById('gen-employee-select').value,
        date: document.getElementById('gen-date').value,
        items: items
    };
    if (!payload.employee_id) return showToast('Please select an employee.', 'error');
    const originalText = showButtonSpinner(genSaveBtn, 'Saving...');
    try {
        const result = await apiRequest('/api/expenses/general', 'POST', payload);
        showToast(result.message, 'success');
        document.getElementById('general-items-container').innerHTML = '';
        addGeneralExpenseItem();
    } catch(error) { showToast(error.message, 'error'); } 
    finally { hideButtonSpinner(genSaveBtn, originalText); }
}

function addGeneralExpenseItem() {
    const container = document.getElementById('general-items-container');
    const itemCount = container.children.length + 1;
    const newItem = document.createElement('div');
    newItem.className = 'row g-2 mb-2 align-items-center';
    newItem.innerHTML = `<div class="col-sm-8"><input type="text" class="form-control gen-item-desc" placeholder="Item Description ${itemCount}"></div><div class="col-sm-4"><div class="input-group"><span class="input-group-text">₹</span><input type="number" class="form-control gen-item-amount" placeholder="Amount"></div></div>`;
    container.appendChild(newItem);
}

async function loadGeneral() {
    const employeeId = document.getElementById('gen-employee-select').value;
    const date = document.getElementById('gen-date').value;
    if (!employeeId || !date) return showToast('Please select an employee and date.', 'error');
    
    const originalText = showButtonSpinner(genLoadBtn, 'Loading...');
    try {
        const data = await apiRequest(`/api/expenses/general/load?employee_id=${employeeId}&date=${date}`);
        
        // Clear existing items
        const container = document.getElementById('general-items-container');
        container.innerHTML = '';
        
        // Add loaded items
        if (data.items && data.items.length > 0) {
            data.items.forEach(item => {
                addGeneralExpenseItem();
                const lastItem = container.lastElementChild;
                lastItem.querySelector('.gen-item-desc').value = item.description;
                lastItem.querySelector('.gen-item-amount').value = item.amount;
            });
        } else {
            addGeneralExpenseItem(); // Add one empty item
        }
        
        showToast('Entry loaded successfully.', 'success');
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        hideButtonSpinner(genLoadBtn, originalText);
    }
}

async function viewGeneral() {
    const date = document.getElementById('gen-date').value;
    if (!date) return showToast('Please select a date.', 'error');
    
    const originalText = showButtonSpinner(genViewBtn, 'Loading...');
    try {
        const data = await apiRequest(`/api/expenses/general/view?date=${date}`);
        renderDataTable('general-table-container', data.records, data.columns);
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        hideButtonSpinner(genViewBtn, originalText);
    }
}

async function deleteLastGeneral() {
    const employeeId = document.getElementById('gen-employee-select').value;
    if (!employeeId) return showToast('Please select an employee.', 'error');
    
    const originalText = showButtonSpinner(modalConfirmBtn, 'Deleting...');
    try {
        const result = await apiRequest('/api/expenses/general/last', 'DELETE', { employee_id: employeeId });
        showToast(result.message || 'Last general expense deleted successfully!', 'success');
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        hideButtonSpinner(modalConfirmBtn, 'Confirm');
        confirmationModal.hide();
    }
}

// ADVANCES
async function logAdvance() {
    const payload = {
        employee_id: document.getElementById('adv-employee-select').value,
        date: document.getElementById('adv-date').value,
        amount: document.getElementById('adv-amount').value,
        notes: document.getElementById('adv-notes').value || null
    };
    if (!payload.employee_id || !payload.amount) return showToast('Employee and Amount are required.', 'error');
    const originalText = showButtonSpinner(advLogBtn, 'Logging...');
    try {
        const result = await apiRequest('/api/advances', 'POST', payload);
        showToast(result.message, 'success');
        document.getElementById('adv-amount').value = '';
        document.getElementById('adv-notes').value = '';
    } catch(error) { showToast(error.message, 'error'); } 
    finally { hideButtonSpinner(advLogBtn, originalText); }
}

async function deleteLastAdvance() {
    const employeeId = document.getElementById('adv-employee-select').value;
    if (!employeeId) return showToast('Please select an employee.', 'error');
    
    const originalText = showButtonSpinner(modalConfirmBtn, 'Deleting...');
    try {
        const result = await apiRequest('/api/advances/last', 'DELETE', { employee_id: employeeId });
        showToast(result.message || 'Last advance deleted successfully!', 'success');
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        hideButtonSpinner(modalConfirmBtn, 'Confirm');
        confirmationModal.hide();
    }
}
async function viewAdvancesByDay() {
    const date = document.getElementById('adv-view-day-picker').value;
    const originalText = showButtonSpinner(advViewDayBtn);
    try {
        const data = await apiRequest(`/api/advances/view?date=${date}`);
        renderDataTable('advances-table-container', data.records, data.columns);
    } catch(error) { showToast(error.message, 'error'); } 
    finally { hideButtonSpinner(advViewDayBtn, originalText); }
}
async function viewAdvancesByMonth() {
    const month = document.getElementById('adv-view-month-picker').value; // YYYY-MM
    const originalText = showButtonSpinner(advViewMonthBtn);
    try {
        const data = await apiRequest(`/api/advances/view?month=${month}`);
        renderDataTable('advances-table-container', data.records, data.columns);
    } catch(error) { showToast(error.message, 'error'); } 
    finally { hideButtonSpinner(advViewMonthBtn, originalText); }
}

// SALARY, REPORTS, AI, DANGER ZONE
async function fetchSalaryData() {
    const employeeId = document.getElementById('salary-employee-select').value;
    const period = document.querySelector('input[name="salaryPeriod"]:checked')?.value;
    const month = document.getElementById('salary-month-picker').value;
    const startDate = document.getElementById('salary-start-date').value;
    const endDate = document.getElementById('salary-end-date').value;
    
    if (!employeeId) {
        return showToast('Please select an employee.', 'error');
    }
    
    const originalText = showButtonSpinner(salaryFetchBtn, 'Fetching...');
    try {
        let params = `?employee_id=${employeeId}&period=${period}`;
        if (period === 'month' && month) {
            params += `&month=${month}`;
        } else if (period === 'custom' && startDate && endDate) {
            params += `&start_date=${startDate}&end_date=${endDate}`;
        }
        
        const data = await apiRequest(`/api/salary/fetch${params}`);
        renderDataTable('salary-table-container', data.records, data.columns);
        showToast('Salary data fetched successfully.', 'success');
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        hideButtonSpinner(salaryFetchBtn, originalText);
    }
}

async function handleSalaryPDF(action) {
    const employeeId = document.getElementById('salary-employee-select').value;
    if (!employeeId) {
        return showToast('Please select an employee.', 'error');
    }
    
    const originalText = action === 'preview' ? 
        showButtonSpinner(salaryPreviewBtn, 'Generating...') : 
        showButtonSpinner(salaryExportBtn, 'Exporting...');
    
    try {
        const period = document.querySelector('input[name="salaryPeriod"]:checked')?.value;
        const month = document.getElementById('salary-month-picker').value;
        const startDate = document.getElementById('salary-start-date').value;
        const endDate = document.getElementById('salary-end-date').value;
        
        let params = `?employee_id=${employeeId}&period=${period}&action=${action}`;
        if (period === 'month' && month) {
            params += `&month=${month}`;
        } else if (period === 'custom' && startDate && endDate) {
            params += `&start_date=${startDate}&end_date=${endDate}`;
        }
        
        const blob = await apiRequest(`/api/salary/pdf${params}`, 'POST');
        await handlePdfResponse(blob, action, 'salary-report.pdf');
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        if (action === 'preview') {
            hideButtonSpinner(salaryPreviewBtn, originalText);
        } else {
            hideButtonSpinner(salaryExportBtn, originalText);
        }
    }
}

function toggleSalaryPeriodView() {
    const selected = document.querySelector('input[name="salaryPeriod"]:checked')?.value;
    if (salaryMonthContainer) {
    salaryMonthContainer.classList.toggle('d-none', selected !== 'month');
    }
    if (salaryCustomContainer) {
    salaryCustomContainer.classList.toggle('d-none', selected !== 'custom');
    }
}

async function generateReport(preset = null) {
    const originalText = showButtonSpinner(reportGenerateBtn, 'Generating...');
    try {
        let params = '';
        if (preset) {
            params = `?preset=${preset}`;
        } else {
            const reportType = document.getElementById('report-type-select').value;
            const startDate = document.getElementById('report-start-date').value;
            const endDate = document.getElementById('report-end-date').value;
            
            if (!startDate || !endDate) {
                return showToast('Please select start and end dates.', 'error');
            }
            
            params = `?type=${reportType}&start_date=${startDate}&end_date=${endDate}`;
        }
        
        const data = await apiRequest(`/api/reports/generate${params}`, 'POST');
        renderDataTable('report-table-container', data.records, data.columns);
        showToast('Report generated successfully.', 'success');
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        hideButtonSpinner(reportGenerateBtn, originalText);
    }
}

async function scanForAnomalies() {
    const originalText = showButtonSpinner(scanExpensesBtn, 'Scanning...');
    try {
        const result = await apiRequest('/api/ai/scan-expenses', 'POST');
        const container = document.getElementById('anomaly-results-container');
        
        if (container) {
            container.innerHTML = `
                <div class="alert alert-info">
                    <h6>Scan Results</h6>
                    <p>${result.message}</p>
                    ${result.anomalies ? `
                        <ul class="mb-0">
                            ${result.anomalies.map(anomaly => `<li>${anomaly}</li>`).join('')}
                        </ul>
                    ` : ''}
                </div>
            `;
        }
        
        showToast('Anomaly scan completed.', 'success');
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        hideButtonSpinner(scanExpensesBtn, originalText);
    }
}

async function analyzeAttrition() {
    const originalText = showButtonSpinner(analyzeAttritionBtn, 'Analyzing...');
    try {
        const result = await apiRequest('/api/ai/attrition', 'POST');
        const container = document.getElementById('attrition-results-container');
        
        if (container) {
            container.innerHTML = `
                <div class="alert alert-warning">
                    <h6>Attrition Analysis Results</h6>
                    <p>${result.message}</p>
                    ${result.risks ? `
                        <div class="mt-3">
                            <h6>High Risk Employees:</h6>
                            <ul class="mb-0">
                                ${result.risks.map(risk => `<li>${risk}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                </div>
            `;
        }
        
        showToast('Attrition analysis completed.', 'success');
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        hideButtonSpinner(analyzeAttritionBtn, originalText);
    }
}

async function deleteAllAttendanceOnDate() {
    const date = document.getElementById('danger-date-picker').value;
    if (!date) return showToast('Please select a date.', 'error');
    const originalText = showButtonSpinner(modalConfirmBtn, 'Deleting...');
    try {
        const result = await apiRequest('/api/attendance/delete-all', 'DELETE', { date });
        showToast(result.message || 'All attendance for the selected date has been deleted.', 'success');
        
        // Refresh dashboard
        loadDashboardData();
        loadTodaysAttendanceStatus();
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        hideButtonSpinner(modalConfirmBtn, 'Confirm');
        confirmationModal.hide();
    }
}

// --- Enhanced UI Functions ---
let actionHistory = [];
let historyIndex = -1;
let autoSaveTimeout;
let searchTimeout;

function initializeUIEnhancements() {
    // Add loading states to buttons
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('click', function() {
            if (!this.disabled && !this.classList.contains('btn-close')) {
                this.classList.add('loading');
                setTimeout(() => this.classList.remove('loading'), 1000);
            }
        });
    });
    
    // Add ripple effect to cards
    document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
            `;
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        });
    });
    
    // Add smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // Initialize all UX enhancements
    initializeKeyboardShortcuts();
    initializeGlobalSearch();
    initializeBulkOperations();
    initializeDragAndDrop();
    initializeAutoSave();
    initializeQuickAccess();
    initializeTouchGestures();
    initializeBreadcrumbs();
}

function handleRefresh() {
    const refreshBtn = document.getElementById('refresh-btn');
    const originalText = showButtonSpinner(refreshBtn, 'Refreshing...');
    
    // Refresh all dashboard data
    Promise.all([
        loadDashboardData(),
        loadTodaysAttendanceStatus(),
        loadEmployees()
    ]).then(() => {
        showToast('Data refreshed successfully!', 'success');
    }).catch(error => {
        showToast('Error refreshing data', 'error');
    }).finally(() => {
        hideButtonSpinner(refreshBtn, originalText);
    });
}

function toggleFullscreen() {
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    const icon = fullscreenBtn.querySelector('i');
    
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().then(() => {
            icon.className = 'bi bi-fullscreen-exit';
            fullscreenBtn.title = 'Exit Fullscreen';
        });
    } else {
        document.exitFullscreen().then(() => {
            icon.className = 'bi bi-arrows-fullscreen';
            fullscreenBtn.title = 'Toggle Fullscreen';
        });
    }
}

// Add CSS for ripple animation
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// --- Keyboard Shortcuts ---
function initializeKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Ctrl combinations
        if (e.ctrlKey) {
            switch(e.key) {
                case 'r':
                    e.preventDefault();
                    handleRefresh();
                    break;
                case 'z':
                    e.preventDefault();
                    undoAction();
                    break;
                case 'y':
                    e.preventDefault();
                    redoAction();
                    break;
                case 'f':
                    e.preventDefault();
                    document.getElementById('global-search').focus();
                    break;
                case 's':
                    e.preventDefault();
                    saveCurrentForm();
                    break;
            }
        }
        
        // Function keys
        switch(e.key) {
            case 'F11':
                e.preventDefault();
                toggleFullscreen();
                break;
            case 'Escape':
                // Close modals, search results, etc.
                document.getElementById('search-results').style.display = 'none';
                document.getElementById('bulk-actions').classList.remove('show');
                break;
        }
        
        // Number keys for quick tab switching
        if (e.key >= '1' && e.key <= '9') {
            const tabIndex = parseInt(e.key) - 1;
            const tabs = document.querySelectorAll('#mainTab .nav-link');
            if (tabs[tabIndex]) {
                e.preventDefault();
                tabs[tabIndex].click();
            }
        }
    });
}

// --- Global Search ---
function initializeGlobalSearch() {
    const searchInput = document.getElementById('global-search');
    const searchResults = document.getElementById('search-results');
    
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        const query = this.value.trim();
        
        if (query.length < 2) {
            searchResults.style.display = 'none';
            return;
        }
        
        searchTimeout = setTimeout(() => {
            performGlobalSearch(query);
        }, 300);
    });
    
    // Hide search results when clicking outside
    document.addEventListener('click', function(e) {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.style.display = 'none';
        }
    });
}

async function performGlobalSearch(query) {
    const searchResults = document.getElementById('search-results');
    
    try {
        // Simulate search across different data types
        const results = await searchData(query);
        displaySearchResults(results);
    } catch (error) {
        console.error('Search error:', error);
    }
}

async function searchData(query) {
    // This would typically make API calls to search different data types
    const mockResults = [
        { type: 'employee', name: 'John Doe', id: 1, section: 'Employees' },
        { type: 'expense', name: 'Travel Expense', amount: '₹500', section: 'Expenses' },
        { type: 'attendance', name: 'Attendance Record', date: '2024-01-15', section: 'Attendance' }
    ];
    
    return mockResults.filter(item => 
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.section.toLowerCase().includes(query.toLowerCase())
    );
}

function displaySearchResults(results) {
    const searchResults = document.getElementById('search-results');
    
    if (results.length === 0) {
        searchResults.innerHTML = '<div class="search-result-item">No results found</div>';
    } else {
        searchResults.innerHTML = results.map(result => `
            <div class="search-result-item" onclick="handleSearchResult('${result.type}', ${result.id})">
                <div class="fw-bold">${result.name}</div>
                <small class="text-muted">${result.section}</small>
            </div>
        `).join('');
    }
    
    searchResults.style.display = 'block';
}

function handleSearchResult(type, id) {
    // Navigate to the appropriate section and highlight the result
    switch(type) {
        case 'employee':
            switchTab('employees-tab');
            break;
        case 'expense':
            switchTab('travel-tab');
            break;
        case 'attendance':
            switchTab('attendance-tab');
            break;
    }
    document.getElementById('search-results').style.display = 'none';
}

// --- Bulk Operations ---
function initializeBulkOperations() {
    const selectAllCheckbox = document.getElementById('select-all');
    const bulkActions = document.getElementById('bulk-actions');
    const bulkCount = document.getElementById('bulk-count');
    
    // Add checkboxes to all data rows
    addBulkCheckboxes();
    
    selectAllCheckbox.addEventListener('change', function() {
        const checkboxes = document.querySelectorAll('.bulk-item-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = this.checked;
        });
        updateBulkActions();
    });
    
    document.addEventListener('change', function(e) {
        if (e.target.classList.contains('bulk-item-checkbox')) {
            updateBulkActions();
        }
    });
    
    // Bulk action buttons
    document.getElementById('bulk-export').addEventListener('click', bulkExport);
    document.getElementById('bulk-delete').addEventListener('click', bulkDelete);
    document.getElementById('bulk-cancel').addEventListener('click', cancelBulkActions);
}

function addBulkCheckboxes() {
    // Add checkboxes to table rows
    document.querySelectorAll('.table tbody tr').forEach(row => {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'bulk-item-checkbox me-2';
        checkbox.dataset.id = row.dataset.id || Math.random();
        row.insertBefore(checkbox, row.firstChild);
    });
}

function updateBulkActions() {
    const checkedBoxes = document.querySelectorAll('.bulk-item-checkbox:checked');
    const bulkActions = document.getElementById('bulk-actions');
    const bulkCount = document.getElementById('bulk-count');
    const selectAllCheckbox = document.getElementById('select-all');
    
    if (checkedBoxes.length > 0) {
        bulkActions.classList.add('show');
        bulkCount.textContent = `${checkedBoxes.length} item${checkedBoxes.length > 1 ? 's' : ''} selected`;
        
        // Update select all checkbox state
        const allCheckboxes = document.querySelectorAll('.bulk-item-checkbox');
        selectAllCheckbox.checked = checkedBoxes.length === allCheckboxes.length;
        selectAllCheckbox.indeterminate = checkedBoxes.length > 0 && checkedBoxes.length < allCheckboxes.length;
    } else {
        bulkActions.classList.remove('show');
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = false;
    }
}

function bulkExport() {
    const checkedBoxes = document.querySelectorAll('.bulk-item-checkbox:checked');
    const data = Array.from(checkedBoxes).map(checkbox => {
        const row = checkbox.closest('tr');
        return {
            id: checkbox.dataset.id,
            data: Array.from(row.cells).map(cell => cell.textContent.trim())
        };
    });
    
    // Export to CSV
    const csv = convertToCSV(data);
    downloadCSV(csv, 'bulk-export.csv');
    showToast(`Exported ${data.length} items`, 'success');
}

function bulkDelete() {
    const checkedBoxes = document.querySelectorAll('.bulk-item-checkbox:checked');
    if (checkedBoxes.length === 0) return;
    
    setupConfirmationModal(() => {
        checkedBoxes.forEach(checkbox => {
            const row = checkbox.closest('tr');
            row.remove();
        });
        updateBulkActions();
        showToast(`Deleted ${checkedBoxes.length} items`, 'success');
    }, 'Confirm Bulk Delete', `Are you sure you want to delete ${checkedBoxes.length} items?`);
}

function cancelBulkActions() {
    document.querySelectorAll('.bulk-item-checkbox').forEach(checkbox => {
        checkbox.checked = false;
    });
    updateBulkActions();
}

// --- Drag and Drop ---
function initializeDragAndDrop() {
    // Make cards draggable
    document.querySelectorAll('.card').forEach(card => {
        card.draggable = true;
        card.classList.add('draggable');
        
        card.addEventListener('dragstart', handleDragStart);
        card.addEventListener('dragend', handleDragEnd);
    });
    
    // Add drop zones
    addDropZones();
}

function handleDragStart(e) {
    e.target.classList.add('dragging');
    e.dataTransfer.setData('text/plain', e.target.id);
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
}

function addDropZones() {
    // Add drop zones to appropriate containers
    const containers = document.querySelectorAll('.row, .col');
    containers.forEach(container => {
        container.addEventListener('dragover', handleDragOver);
        container.addEventListener('drop', handleDrop);
        container.addEventListener('dragenter', handleDragEnter);
        container.addEventListener('dragleave', handleDragLeave);
    });
}

function handleDragOver(e) {
    e.preventDefault();
}

function handleDragEnter(e) {
    e.preventDefault();
    e.target.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.target.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    e.target.classList.remove('drag-over');
    
    const draggedId = e.dataTransfer.getData('text/plain');
    const draggedElement = document.getElementById(draggedId);
    
    if (draggedElement && e.target !== draggedElement) {
        e.target.appendChild(draggedElement);
        showToast('Item moved successfully', 'success');
    }
}

// --- Auto-save ---
function initializeAutoSave() {
    // Auto-save form data
    document.querySelectorAll('input, select, textarea').forEach(input => {
        input.addEventListener('input', debounce(autoSaveForm, 2000));
    });
}

function autoSaveForm() {
    const indicator = document.getElementById('auto-save-indicator');
    indicator.classList.add('saving');
    indicator.querySelector('span').textContent = 'Saving...';
    indicator.classList.add('show');
    
    // Simulate auto-save
    setTimeout(() => {
        indicator.classList.remove('saving');
        indicator.querySelector('span').textContent = 'Auto-saved';
        
        setTimeout(() => {
            indicator.classList.remove('show');
        }, 2000);
    }, 1000);
}

// --- Quick Access ---
function initializeQuickAccess() {
    const quickButtons = {
        'quick-dashboard': 'dashboard-tab',
        'quick-employees': 'employees-tab',
        'quick-attendance': 'attendance-tab',
        'quick-reports': 'reports-tab',
        'quick-settings': 'settings-tab'
    };
    
    Object.entries(quickButtons).forEach(([buttonId, tabId]) => {
        document.getElementById(buttonId).addEventListener('click', () => {
            switchTab(tabId);
        });
    });
    
    // Show quick access menu on page load, then hide it
    showQuickAccessOnLoad();
}

function showQuickAccessOnLoad() {
    const quickAccess = document.querySelector('.quick-access');
    if (quickAccess) {
        // Show the menu initially
        quickAccess.style.right = '20px';
        
        // Hide it after 3 seconds
        setTimeout(() => {
            quickAccess.style.right = '-60px';
        }, 3000);
    }
}

function switchTab(tabId) {
    const tab = document.getElementById(tabId);
    if (tab) {
        tab.click();
        updateBreadcrumbs(tab.getAttribute('data-header-title'));
    }
}

// --- Touch Gestures ---
function initializeTouchGestures() {
    let startX, startY, endX, endY;
    
    document.addEventListener('touchstart', function(e) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    });
    
    document.addEventListener('touchend', function(e) {
        endX = e.changedTouches[0].clientX;
        endY = e.changedTouches[0].clientY;
        
        const diffX = startX - endX;
        const diffY = startY - endY;
        
        // Swipe left/right for tab navigation
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
            if (diffX > 0) {
                // Swipe left - next tab
                navigateToNextTab();
            } else {
                // Swipe right - previous tab
                navigateToPreviousTab();
            }
        }
    });
}

function navigateToNextTab() {
    const currentTab = document.querySelector('#mainTab .nav-link.active');
    const nextTab = currentTab.parentElement.nextElementSibling?.querySelector('.nav-link');
    if (nextTab) nextTab.click();
}

function navigateToPreviousTab() {
    const currentTab = document.querySelector('#mainTab .nav-link.active');
    const prevTab = currentTab.parentElement.previousElementSibling?.querySelector('.nav-link');
    if (prevTab) prevTab.click();
}

// --- Breadcrumbs ---
function initializeBreadcrumbs() {
    updateBreadcrumbs('Dashboard');
}

function updateBreadcrumbs(currentPage) {
    const breadcrumb = document.getElementById('breadcrumb-nav');
    breadcrumb.innerHTML = `
        <li class="breadcrumb-item"><a href="#" onclick="switchTab('dashboard-tab')">Dashboard</a></li>
        <li class="breadcrumb-item active" aria-current="page">${currentPage}</li>
    `;
}

// --- Undo/Redo ---
function addToHistory(action) {
    actionHistory = actionHistory.slice(0, historyIndex + 1);
    actionHistory.push(action);
    historyIndex++;
    updateHistoryButtons();
}

function undoAction() {
    if (historyIndex >= 0) {
        const action = actionHistory[historyIndex];
        // Implement undo logic based on action type
        historyIndex--;
        updateHistoryButtons();
        showToast('Action undone', 'success');
    }
}

function redoAction() {
    if (historyIndex < actionHistory.length - 1) {
        historyIndex++;
        const action = actionHistory[historyIndex];
        // Implement redo logic based on action type
        updateHistoryButtons();
        showToast('Action redone', 'success');
    }
}

function updateHistoryButtons() {
    document.getElementById('undo-btn').disabled = historyIndex < 0;
    document.getElementById('redo-btn').disabled = historyIndex >= actionHistory.length - 1;
}

// --- Utility Functions ---
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function convertToCSV(data) {
    const headers = ['ID', 'Data'];
    const csvContent = [
        headers.join(','),
        ...data.map(row => [row.id, `"${row.data.join(', ')}"`].join(','))
    ].join('\n');
    return csvContent;
}

function downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
}

function saveCurrentForm() {
    // Auto-save current form data
    autoSaveForm();
    showToast('Form saved', 'success');
}

