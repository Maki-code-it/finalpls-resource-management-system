// dashboard.js - Fixed version with date filter and search
import { supabase } from "../../supabaseClient.js";

// ============================================
// UTILITY FUNCTIONS
// ============================================

function debounce(func, delay = 300) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

// ============================================
// MODAL UTILITIES
// ============================================

class ModalManager {
    static show(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    static hide(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    static showLoading() {
        this.show('loadingOverlay');
    }

    static hideLoading() {
        this.hide('loadingOverlay');
    }
}

// ============================================
// MESSAGE UTILITIES
// ============================================

function showSuccessMessage(message) {
    const messageBox = document.createElement('div');
    messageBox.className = 'message-box success';
    messageBox.innerHTML = `<i class="fas fa-check-circle"></i><span>${message}</span>`;
    messageBox.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 3000;
        min-width: 300px;
        padding: 16px;
        background: #7ED321;
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        gap: 12px;
    `;
    
    document.body.appendChild(messageBox);
    setTimeout(() => messageBox.remove(), 3000);
}

function showErrorMessage(message) {
    const messageBox = document.createElement('div');
    messageBox.className = 'message-box error';
    messageBox.innerHTML = `<i class="fas fa-exclamation-circle"></i><span>${message}</span>`;
    messageBox.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 3000;
        min-width: 300px;
        padding: 16px;
        background: #E74C3C;
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        gap: 12px;
    `;
    
    document.body.appendChild(messageBox);
    setTimeout(() => messageBox.remove(), 3000);
}

// ============================================
// DATA SERVICE (Supabase Integration)
// ============================================

class DataService {
    async getAllEmployees() {
        try {
            console.log('Fetching employees from database...');
            
            const { data, error } = await supabase
                .from('user_details')
                .select(`
                    employee_id,
                    job_title,
                    department,
                    status,
                    experience_level,
                    skills,
                    user_id,
                    users:user_id (
                        id,
                        name,
                        email,
                        role
                    )
                `);
            
            if (error) {
                console.error('Supabase error:', error);
                throw error;
            }

            console.log('Raw data from database:', data);

            if (!data || data.length === 0) {
                console.warn('No employees found in database');
                return [];
            }

            const filteredData = data.filter(emp => {
                const role = emp.users?.role || '';
                return role === 'employee' || role === 'project_manager';
            });

            console.log('Filtered employees:', filteredData.length);

            const employeesWithWorkload = await Promise.all(
                filteredData.map(emp => this.transformEmployee(emp))
            );

            console.log('Transformed employees:', employeesWithWorkload);

            return employeesWithWorkload;
        } catch (error) {
            console.error('Error in getAllEmployees:', error);
            throw error;
        }
    }

    async transformEmployee(emp) {
        const workload = await this.calculateWorkload(emp.user_id);
        
        return {
            id: emp.employee_id,
            userId: emp.user_id,
            name: emp.users?.name || 'Unknown',
            role: emp.job_title || 'No role',
            email: emp.users?.email || 'No email',
            skills: Array.isArray(emp.skills) ? emp.skills : [],
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(emp.users?.name || 'User')}&background=4A90E2&color=fff`,
            workload: workload,
            status: emp.status || 'available',
            userRole: emp.users?.role || 'employee'
        };
    }

    async calculateWorkload(userId) {
        try {
            const { data: assignments, error } = await supabase
                .from('project_assignments')
                .select('id, project_id')
                .eq('user_id', userId)
                .eq('status', 'assigned');

            if (error) {
                console.error('Error fetching assignments:', error);
                return { 
                    today: 0, 
                    week: Array(5).fill(0), 
                    month: Array(30).fill(0) 
                };
            }

            const assignmentCount = assignments?.length || 0;
            const baseHours = assignmentCount * 4;
            
            const today = Math.min(baseHours + Math.floor(Math.random() * 2), 10);
            
            const week = Array(5).fill(0).map(() => 
                Math.min(Math.round(baseHours + (Math.random() * 3 - 1.5)), 10)
            );
            
            const month = Array(30).fill(0).map(() => 
                Math.min(Math.round(baseHours + (Math.random() * 3 - 1.5)), 10)
            );

            return { today, week, month };
        } catch (error) {
            console.error('Error calculating workload:', error);
            return { 
                today: 0, 
                week: Array(5).fill(0), 
                month: Array(30).fill(0) 
            };
        }
    }
}

// ============================================
// WORKLOAD CALCULATIONS
// ============================================

function calculateWorkloadStats(employees, period = 'today') {
    const stats = {
        total: employees.length,
        available: 0,
        partial: 0,
        fullyAllocated: 0,
        overtime: 0,
        totalHours: 0,
        belowTarget: 0,
        atTarget: 0,
        overTarget: 0
    };

    employees.forEach(emp => {
        let hours = 0;
        if (period === 'today') {
            hours = emp.workload.today;
        } else if (period === 'week') {
            hours = emp.workload.week.reduce((a, b) => a + b, 0) / emp.workload.week.length;
        } else if (period === 'month') {
            hours = emp.workload.month.reduce((a, b) => a + b, 0) / emp.workload.month.length;
        }

        stats.totalHours += hours;
        
        if (hours < 4) stats.available++;
        else if (hours >= 4 && hours < 8) stats.partial++;
        else if (hours === 8) stats.fullyAllocated++;
        else if (hours > 8) stats.overtime++;

        if (hours < 8) stats.belowTarget++;
        else if (hours === 8) stats.atTarget++;
        else stats.overTarget++;
    });

    stats.avgHours = employees.length > 0 ? (stats.totalHours / employees.length).toFixed(1) : 0;
    return stats;
}

function getWorkloadStatus(hours) {
    if (hours < 4) return 'available';
    if (hours >= 4 && hours < 8) return 'partial';
    if (hours === 8) return 'full';
    return 'over';
}

// ============================================
// UI MANAGER
// ============================================

class UIManager {
    constructor(dataService) {
        this.dataService = dataService;
        this.employees = [];
        this.filteredEmployees = [];
        this.currentPeriod = 'today';
        this.selectedDate = new Date();
        this.searchQuery = '';
    }

    async loadEmployees() {
        try {
            ModalManager.showLoading();
            console.log('Loading employees...');
            
            this.employees = await this.dataService.getAllEmployees();
            this.filteredEmployees = [...this.employees];
            
            console.log('Loaded employees:', this.employees.length);
            
            ModalManager.hideLoading();
            
            if (this.employees.length === 0) {
                showErrorMessage('No employees found in the system');
            }
            
            this.renderDashboard(this.currentPeriod);
        } catch (error) {
            ModalManager.hideLoading();
            console.error('Error loading employees:', error);
            showErrorMessage('Failed to load employee data: ' + error.message);
        }
    }

    filterEmployees() {
        this.filteredEmployees = this.employees.filter(emp => {
            const matchesSearch = emp.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                                emp.role.toLowerCase().includes(this.searchQuery.toLowerCase());
            return matchesSearch;
        });
        
        this.renderDashboard(this.currentPeriod);
    }

    setSearchQuery(query) {
        this.searchQuery = query;
        this.filterEmployees();
    }

    setSelectedDate(date) {
        this.selectedDate = new Date(date);
        this.renderDashboard(this.currentPeriod);
    }

    renderDashboard(period = 'today') {
        this.currentPeriod = period;
        const stats = calculateWorkloadStats(this.filteredEmployees, period);
        
        console.log('Dashboard stats:', stats);
        
        this.updateStatsCard('totalEmployees', stats.total);
        this.updateStatsCard('availableEmployees', stats.available);
        this.updateStatsCard('partialEmployees', stats.partial);
        this.updateStatsCard('fullyAllocated', stats.fullyAllocated);
        this.updateStatsCard('avgHours', stats.avgHours + 'h');
        this.updateStatsCard('belowTarget', stats.belowTarget);
        this.updateStatsCard('atTarget', stats.atTarget);
        this.updateStatsCard('overTarget', stats.overTarget);

        this.renderTimeline(period);
    }

    updateStatsCard(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value;
        }
    }

    renderTimeline(period = 'today') {
        const timelineRows = document.getElementById('timelineRows');
        const timelineDates = document.getElementById('timelineDates');

        if (!timelineRows || !timelineDates) {
            console.error('Timeline containers not found');
            return;
        }

        console.log('Rendering timeline for period:', period);
        console.log('Employees to render:', this.filteredEmployees.length);

        timelineRows.innerHTML = '';
        timelineDates.innerHTML = '';

        this.renderTimelineDates(period, timelineDates);
        
        const rowsFragment = document.createDocumentFragment();
        this.filteredEmployees.forEach(emp => {
            const row = this.createEmployeeRow(emp, period);
            rowsFragment.appendChild(row);
        });

        timelineRows.appendChild(rowsFragment);
    }

    renderTimelineDates(period, container) {
        const dateHeader = document.createElement('div');
        dateHeader.className = 'timeline-date-cell';
        dateHeader.textContent = 'Employee';
        container.appendChild(dateHeader);
        
        if (period === 'today') {
            const cell = document.createElement('div');
            cell.className = 'timeline-date-cell';
            cell.textContent = this.selectedDate.toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
            });
            container.appendChild(cell);
        } else if (period === 'week') {
            const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
            days.forEach(day => {
                const cell = document.createElement('div');
                cell.className = 'timeline-date-cell';
                cell.textContent = day;
                container.appendChild(cell);
            });
        } else if (period === 'month') {
            for (let i = 1; i <= 7; i++) {
                const cell = document.createElement('div');
                cell.className = 'timeline-date-cell';
                cell.textContent = `Week ${i}`;
                container.appendChild(cell);
            }
        }
    }

    createEmployeeRow(emp, period) {
        const row = document.createElement('div');
        row.className = 'timeline-row';

        const employeeCell = document.createElement('div');
        employeeCell.className = 'employee-cell';
        employeeCell.style.cursor = 'pointer';
        employeeCell.onclick = () => window.openViewEmployeeModal(emp.id);
        
        const img = document.createElement('img');
        img.src = emp.avatar;
        img.alt = emp.name;
        
        const infoDiv = document.createElement('div');
        infoDiv.className = 'employee-cell-info';
        
        const h4 = document.createElement('h4');
        h4.textContent = emp.name;
        
        const p = document.createElement('p');
        p.textContent = emp.role;
        
        infoDiv.appendChild(h4);
        infoDiv.appendChild(p);
        employeeCell.appendChild(img);
        employeeCell.appendChild(infoDiv);
        row.appendChild(employeeCell);

        if (period === 'today') {
            row.appendChild(this.createWorkloadCell(emp.workload.today));
        } else if (period === 'week') {
            emp.workload.week.forEach(hours => {
                row.appendChild(this.createWorkloadCell(hours));
            });
        } else if (period === 'month') {
            for (let i = 0; i < 7; i++) {
                const weekStart = i * 4;
                const weekEnd = Math.min(weekStart + 4, emp.workload.month.length);
                const weekHours = emp.workload.month.slice(weekStart, weekEnd);
                const avgHours = weekHours.length > 0 
                    ? Math.round(weekHours.reduce((a, b) => a + b, 0) / weekHours.length) 
                    : 0;
                row.appendChild(this.createWorkloadCell(avgHours));
            }
        }

        return row;
    }

    createWorkloadCell(hours) {
        const cell = document.createElement('div');
        cell.className = 'workload-cell';
        
        const bar = document.createElement('div');
        bar.className = 'workload-bar';
        
        const fill = document.createElement('div');
        const status = getWorkloadStatus(hours);
        const percentage = Math.min((hours / 8) * 100, 125);
        fill.className = `workload-fill ${status}`;
        fill.style.width = `${percentage}%`;
        
        const label = document.createElement('span');
        label.className = 'workload-label';
        label.textContent = `${hours}h`;
        
        fill.appendChild(label);
        bar.appendChild(fill);
        cell.appendChild(bar);
        
        return cell;
    }
}

// ============================================
// FILTER AND SEARCH FUNCTIONS
// ============================================

function setupDateFilter() {
    const dateInput = document.getElementById('dateFilter');
    if (!dateInput) return;

    // Set default value to today
    dateInput.value = new Date().toISOString().split('T')[0];

    // Add event listener
    dateInput.addEventListener('change', (e) => {
        if (app && app.uiManager) {
            app.uiManager.setSelectedDate(e.target.value);
        }
    });
}

function setupSearchBox() {
    const searchInput = document.getElementById('employeeSearch');
    if (!searchInput) return;

    // Add event listener with debounce
    const debouncedSearch = debounce((value) => {
        if (app && app.uiManager) {
            app.uiManager.setSearchQuery(value);
        }
    }, 300);

    searchInput.addEventListener('input', (e) => {
        debouncedSearch(e.target.value);
    });
}

// ============================================
// EMPLOYEE ACTIVITY MODAL
// ============================================

function generateEmployeeActivityData(employee) {
    const totalHours = employee.workload?.today || 0;
    const activeProjects = Math.min(Math.ceil(totalHours / 4), 3);

    return {
        summary: { totalHours, activeProjects },
        schedule: generateDailySchedule(totalHours),
        projects: generateActiveProjects(activeProjects, employee.role),
        activities: generateRecentActivities(employee.name)
    };
}

function generateDailySchedule(totalHours) {
    if (totalHours === 0) return [];
    
    const schedule = [];
    const tasks = [
        { title: 'Morning Standup Meeting', duration: 0.5, project: 'Team Sync' },
        { title: 'Code Review - Feature Branch', duration: 1.5, project: 'Web Platform' },
        { title: 'Development - API Integration', duration: 3, project: 'Mobile App' },
        { title: 'Bug Fixes and Testing', duration: 2, project: 'Web Platform' },
        { title: 'Documentation Update', duration: 1, project: 'Mobile App' }
    ];

    let currentTime = 9;
    let remainingHours = totalHours;
    let taskIndex = 0;

    while (remainingHours > 0 && taskIndex < tasks.length) {
        const task = tasks[taskIndex];
        const duration = Math.min(task.duration, remainingHours);
        
        const currentHour = new Date().getHours();
        const currentMinutes = new Date().getMinutes() / 60;
        const status = currentTime + duration <= currentHour + currentMinutes
            ? 'completed'
            : 'in-progress';

        schedule.push({
            time: formatTime(currentTime),
            title: task.title,
            description: `${task.project} - ${duration}h`,
            status,
            duration
        });

        currentTime += duration;
        remainingHours -= duration;
        taskIndex++;
    }

    return schedule;
}

function generateActiveProjects(count, role) {
    const allProjects = [
        { name: 'E-Commerce Web Platform', hours: 3, status: 'On Track' },
        { name: 'Mobile App Redesign', hours: 2.5, status: 'In Progress' },
        { name: 'Dashboard UI Enhancement', hours: 1.5, status: 'Near Completion' },
        { name: 'API Integration Project', hours: 2, status: 'Starting' },
        { name: 'Customer Portal Development', hours: 2, status: 'On Track' }
    ];

    return allProjects.slice(0, Math.max(count, 1));
}

function generateRecentActivities(employeeName) {
    const completedTasks = [
        'Finished implementing user authentication module',
        'Completed backend for login functionality',
        'Resolved critical bug in payment processing',
        'Deployed new features to production',
        'Updated API documentation',
        'Completed code review for team members',
        'Fixed responsive design issues',
        'Optimized database queries'
    ];

    const timeOptions = ['2 hours ago', '5 hours ago', 'Yesterday', '2 days ago', '3 days ago'];
    
    const taskCount = Math.floor(Math.random() * 3) + 3;
    const activities = [];
    
    for (let i = 0; i < taskCount; i++) {
        activities.push({
            type: 'completed',
            icon: 'fa-check-circle',
            title: 'Completed Task',
            description: completedTasks[Math.floor(Math.random() * completedTasks.length)],
            time: timeOptions[Math.min(i, timeOptions.length - 1)]
        });
    }
    
    return activities;
}

function formatTime(hours) {
    const hour24 = Math.floor(hours);
    const minutes = Math.round((hours - hour24) * 60);
    const period = hour24 >= 12 ? 'PM' : 'AM';
    const hour12 = hour24 > 12 ? hour24 - 12 : (hour24 === 0 ? 12 : hour24);
    
    return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
}

function openViewEmployeeModal(employeeId) {
    const employee = app.uiManager.employees.find(e => e.id === employeeId);
    if (!employee) {
        console.error('Employee not found:', employeeId);
        return;
    }

    const activityData = generateEmployeeActivityData(employee);

    document.getElementById('viewEmpName').textContent = employee.name;
    document.getElementById('viewEmpRole').textContent = employee.role;
    document.getElementById('viewEmpAvatar').src = employee.avatar;
    
    document.getElementById('totalHoursToday').textContent = activityData.summary.totalHours + 'h';
    document.getElementById('activeProjects').textContent = activityData.summary.activeProjects;
    
    const tasksCompletedCard = document.getElementById('tasksCompleted')?.closest('.activity-summary-card');
    const tasksInProgressCard = document.getElementById('tasksInProgress')?.closest('.activity-summary-card');
    
    if (tasksCompletedCard) tasksCompletedCard.style.display = 'none';
    if (tasksInProgressCard) tasksInProgressCard.style.display = 'none';

    renderDailySchedule(activityData.schedule);
    renderActiveProjects(activityData.projects);
    renderRecentActivities(activityData.activities);

    ModalManager.show('viewEmployeeModal');
}

function renderDailySchedule(schedule) {
    const container = document.getElementById('dailyTimeline');
    if (!container) return;

    if (schedule.length === 0) {
        container.innerHTML = '<p style="color: #6C757D; text-align: center; padding: 20px;">No scheduled activities for today</p>';
        return;
    }

    const fragment = document.createDocumentFragment();
    schedule.forEach(item => {
        const timelineItem = document.createElement('div');
        timelineItem.className = 'timeline-item';

        timelineItem.innerHTML = `
            <div class="timeline-dot ${item.status}"></div>
            <div class="timeline-time">${item.time}</div>
            <div class="timeline-title">${item.title}</div>
            <div class="timeline-description">${item.description}</div>
            <span class="timeline-status ${item.status}">
                ${item.status === 'completed' ? 'Completed' : 'In Progress'}
            </span>
        `;

        fragment.appendChild(timelineItem);
    });

    container.innerHTML = '';
    container.appendChild(fragment);
}

function renderActiveProjects(projects) {
    const container = document.getElementById('activeProjectsList');
    if (!container) return;

    const fragment = document.createDocumentFragment();
    projects.forEach(project => {
        const card = document.createElement('div');
        card.className = 'project-card-mini';
        card.innerHTML = `
            <div class="project-card-info">
                <h4>${project.name}</h4>
                <p>${project.status} • ${project.hours}h today</p>
            </div>
        `;
        fragment.appendChild(card);
    });

    container.innerHTML = '';
    container.appendChild(fragment);
}

function renderRecentActivities(activities) {
    const container = document.getElementById('recentActivitiesList');
    if (!container) return;

    const fragment = document.createDocumentFragment();
    activities.forEach(activity => {
        const item = document.createElement('div');
        item.className = 'activity-item';
        item.innerHTML = `
            <div class="activity-item-icon completed">
                <i class="fas fa-check-circle"></i>
            </div>
            <div class="activity-item-content">
                <div class="activity-item-title">Completed Task</div>
                <div class="activity-item-description">${activity.description}</div>
                <div class="activity-item-time">${activity.time}</div>
            </div>
        `;
        fragment.appendChild(item);
    });

    container.innerHTML = '';
    container.appendChild(fragment);
}

// ============================================
// DASHBOARD APP
// ============================================

class DashboardApp {
    constructor() {
        this.dataService = new DataService();
        this.uiManager = new UIManager(this.dataService);
    }

    async init() {
        console.log('Initializing dashboard...');
        this.setupEventListeners();
        await this.uiManager.loadEmployees();
        
        // Setup date filter and search from HTML
        setupDateFilter();
        setupSearchBox();
    }

    setupEventListeners() {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.uiManager.renderDashboard(btn.dataset.period);
            });
        });

        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to logout?')) {
                    window.location.href = "/login/HTML_Files/login.html";
                }
            });
        }

        const closeViewBtn = document.getElementById('closeViewEmployee');
        const closeModalBtn = document.getElementById('closeViewModalBtn');
        
        if (closeViewBtn) {
            closeViewBtn.addEventListener('click', () => ModalManager.hide('viewEmployeeModal'));
        }
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => ModalManager.hide('viewEmployeeModal'));
        }

        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    overlay.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });
        });
    }
}

// ============================================
// INITIALIZATION
// ============================================

let app;

document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM loaded, initializing app...');
    app = new DashboardApp();
    await app.init();
});

window.openViewEmployeeModal = openViewEmployeeModal;