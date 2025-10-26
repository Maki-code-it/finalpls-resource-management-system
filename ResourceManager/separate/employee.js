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

class MessageManager {
    static show(message, type = 'info') {
        const container = document.getElementById('messageContainer');
        if (!container) return;

        const messageBox = document.createElement('div');
        messageBox.className = `message-box ${type}`;

        const iconMap = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };

        messageBox.innerHTML = `
            <i class="fas ${iconMap[type]}"></i>
            <span>${message}</span>
            <button class="message-close"><i class="fas fa-times"></i></button>
        `;

        const closeBtn = messageBox.querySelector('.message-close');
        closeBtn.addEventListener('click', () => messageBox.remove());

        container.appendChild(messageBox);

        setTimeout(() => {
            messageBox.remove();
        }, 5000);
    }

    static success(message) {
        this.show(message, 'success');
    }

    static error(message) {
        this.show(message, 'error');
    }

    static warning(message) {
        this.show(message, 'warning');
    }

    static info(message) {
        this.show(message, 'info');
    }
}

// ============================================
// DATA SERVICE (In-Memory Storage)
// ============================================

class DataService {
    constructor() {
        this.employees = [];
        this.projects = [];
        this.initializeMockData();
    }

    initializeMockData() {
        this.employees = [
            {
                id: 'EMP001',
                name: 'John Doe',
                role: 'Senior Developer',
                department: 'Engineering',
                skills: ['Python', 'JavaScript', 'React', 'Node.js'],
                availability: 'full',
                workloadHours: 8,
                projects: ['Project Alpha'],
                experience: '5 years',
                avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=4A90E2&color=fff'
            },
            {
                id: 'EMP002',
                name: 'Jane Smith',
                role: 'UI/UX Designer',
                department: 'Design',
                skills: ['Figma', 'Adobe XD', 'Photoshop', 'UI Design'],
                availability: 'over',
                workloadHours: 10,
                projects: ['Project Beta', 'Project Gamma'],
                experience: '4 years',
                avatar: 'https://ui-avatars.com/api/?name=Jane+Smith&background=7ED321&color=fff'
            },
            {
                id: 'EMP003',
                name: 'Mike Johnson',
                role: 'Full Stack Developer',
                department: 'Engineering',
                skills: ['Java', 'Spring Boot', 'Angular', 'SQL'],
                availability: 'partial',
                workloadHours: 6,
                projects: ['Project Delta'],
                experience: '6 years',
                avatar: 'https://ui-avatars.com/api/?name=Mike+Johnson&background=F5A623&color=fff'
            },
            {
                id: 'EMP004',
                name: 'Sarah Williams',
                role: 'Project Manager',
                department: 'Management',
                skills: ['Agile', 'Scrum', 'Jira', 'Team Leadership'],
                availability: 'available',
                workloadHours: 3,
                projects: [],
                experience: '7 years',
                avatar: 'https://ui-avatars.com/api/?name=Sarah+Williams&background=D0021B&color=fff'
            },
            {
                id: 'EMP005',
                name: 'David Brown',
                role: 'DevOps Engineer',
                department: 'Engineering',
                skills: ['Docker', 'Kubernetes', 'AWS', 'CI/CD'],
                availability: 'over',
                workloadHours: 9,
                projects: ['Project Alpha', 'Project Epsilon'],
                experience: '5 years',
                avatar: 'https://ui-avatars.com/api/?name=David+Brown&background=4A90E2&color=fff'
            },
            {
                id: 'EMP006',
                name: 'Emily Davis',
                role: 'Frontend Developer',
                department: 'Engineering',
                skills: ['Vue.js', 'CSS', 'HTML', 'TypeScript'],
                availability: 'available',
                workloadHours: 2,
                projects: [],
                experience: '3 years',
                avatar: 'https://ui-avatars.com/api/?name=Emily+Davis&background=7ED321&color=fff'
            },
            {
                id: 'EMP007',
                name: 'Robert Martinez',
                role: 'Backend Developer',
                department: 'Engineering',
                skills: ['Node.js', 'MongoDB', 'Express', 'GraphQL'],
                availability: 'full',
                workloadHours: 8,
                projects: ['Project Beta'],
                experience: '4 years',
                avatar: 'https://ui-avatars.com/api/?name=Robert+Martinez&background=F5A623&color=fff'
            },
            {
                id: 'EMP008',
                name: 'Lisa Anderson',
                role: 'QA Engineer',
                department: 'Quality Assurance',
                skills: ['Selenium', 'Jest', 'Automation', 'Testing'],
                availability: 'partial',
                workloadHours: 5,
                projects: ['Project Alpha'],
                experience: '3 years',
                avatar: 'https://ui-avatars.com/api/?name=Lisa+Anderson&background=D0021B&color=fff'
            },
            {
                id: 'EMP009',
                name: 'Chris Taylor',
                role: 'Data Scientist',
                department: 'Analytics',
                skills: ['Python', 'Machine Learning', 'TensorFlow', 'SQL'],
                availability: 'available',
                workloadHours: 4,
                projects: ['Project Gamma'],
                experience: '5 years',
                avatar: 'https://ui-avatars.com/api/?name=Chris+Taylor&background=4A90E2&color=fff'
            },
            {
                id: 'EMP010',
                name: 'Amanda White',
                role: 'Business Analyst',
                department: 'Business',
                skills: ['Requirements Analysis', 'Excel', 'PowerBI', 'Documentation'],
                availability: 'partial',
                workloadHours: 7,
                projects: ['Project Delta'],
                experience: '4 years',
                avatar: 'https://ui-avatars.com/api/?name=Amanda+White&background=7ED321&color=fff'
            }
        ];

        this.projects = [
            { id: 'PROJ001', name: 'Project Alpha', status: 'active' },
            { id: 'PROJ002', name: 'Project Beta', status: 'active' },
            { id: 'PROJ003', name: 'Project Gamma', status: 'pending' },
            { id: 'PROJ004', name: 'Project Delta', status: 'active' },
            { id: 'PROJ005', name: 'Project Epsilon', status: 'completed' }
        ];
    }

    async getAllEmployees() {
        return Promise.resolve([...this.employees]);
    }

    async getEmployeeById(id) {
        return Promise.resolve(this.employees.find(emp => emp.id === id));
    }

    async searchEmployees(query, filters = {}) {
        const employees = await this.getAllEmployees();
        return employees.filter(emp => {
            const matchesQuery = !query || 
                emp.name.toLowerCase().includes(query.toLowerCase()) ||
                emp.role.toLowerCase().includes(query.toLowerCase()) ||
                emp.skills.some(skill => skill.toLowerCase().includes(query.toLowerCase()));
            
            const matchesSkill = !filters.skill || emp.skills.includes(filters.skill);
            
            let matchesAvailability = true;
            if (filters.availability) {
                if (filters.availability === 'available') {
                    matchesAvailability = emp.workloadHours >= 0 && emp.workloadHours <= 4;
                } else if (filters.availability === 'busy') {
                    matchesAvailability = emp.workloadHours >= 8;
                } else if (filters.availability === 'partially') {
                    matchesAvailability = emp.workloadHours > 4 && emp.workloadHours < 8;
                }
            }
            
            return matchesQuery && matchesSkill && matchesAvailability;
        });
    }

    async getAllProjects() {
        return Promise.resolve([...this.projects]);
    }
}

// ============================================
// UI MANAGER
// ============================================

class UIManager {
    constructor() {}

    getWorkloadStatus(hours) {
        if (hours === 0 || hours <= 4) return 'available';
        if (hours > 4 && hours < 8) return 'partial';
        if (hours === 8) return 'full';
        return 'over';
    }

    formatWorkloadStatus(hours) {
        if (hours === 0 || hours <= 4) return 'Available (0-4h)';
        if (hours > 4 && hours < 8) return 'Partial (4-7h)';
        if (hours === 8) return 'Full (8h)';
        return `Overtime (${hours}h)`;
    }

    renderEmployees(employees) {
        const container = document.getElementById('employeeGrid');
        
        if (!container) return;

        if (employees.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #6C757D; grid-column: 1 / -1;">No employees found</p>';
            return;
        }

        const fragment = document.createDocumentFragment();

        employees.forEach(emp => {
            const card = this.createEmployeeCard(emp);
            fragment.appendChild(card);
        });

        container.innerHTML = '';
        container.appendChild(fragment);
    }

    createEmployeeCard(emp) {
        const card = document.createElement('div');
        card.className = 'employee-card';
        card.dataset.id = emp.id;

        const header = this.createEmployeeHeader(emp);
        card.appendChild(header);

        const skills = this.createEmployeeSkills(emp);
        card.appendChild(skills);

        const actions = this.createEmployeeActions(emp);
        card.appendChild(actions);

        return card;
    }

    createEmployeeHeader(emp) {
        const header = document.createElement('div');
        header.className = 'employee-header';

        const avatar = document.createElement('img');
        avatar.src = emp.avatar;
        avatar.alt = emp.name;
        avatar.className = 'employee-avatar';

        const info = document.createElement('div');
        info.className = 'employee-info';

        const h3 = document.createElement('h3');
        h3.textContent = emp.name;

        const role = document.createElement('p');
        role.className = 'employee-role';
        role.textContent = emp.role;

        const statusClass = this.getWorkloadStatus(emp.workloadHours);
        const statusText = this.formatWorkloadStatus(emp.workloadHours);
        
        const statusBadge = document.createElement('span');
        statusBadge.className = `status-badge ${statusClass}`;
        statusBadge.textContent = statusText;

        info.appendChild(h3);
        info.appendChild(role);
        info.appendChild(statusBadge);

        header.appendChild(avatar);
        header.appendChild(info);

        return header;
    }

    createEmployeeSkills(emp) {
        const skillsContainer = document.createElement('div');
        skillsContainer.className = 'employee-skills';

        const h4 = document.createElement('h4');
        h4.textContent = 'Skills';

        const skillsList = document.createElement('div');
        skillsList.className = 'skills-list';

        const skillsToShow = emp.skills.slice(0, 4);
        skillsToShow.forEach(skill => {
            const skillTag = document.createElement('span');
            skillTag.className = 'skill-tag';
            skillTag.textContent = skill;
            skillsList.appendChild(skillTag);
        });

        skillsContainer.appendChild(h4);
        skillsContainer.appendChild(skillsList);

        return skillsContainer;
    }

    createEmployeeActions(emp) {
        const actions = document.createElement('div');
        actions.className = 'employee-actions';

        const viewBtn = document.createElement('button');
        viewBtn.className = 'btn-secondary';
        viewBtn.innerHTML = '<i class="fas fa-eye"></i> View Profile';
        viewBtn.onclick = () => app.viewEmployeeProfile(emp.id);

        const assignBtn = document.createElement('button');
        assignBtn.className = 'btn-primary';
        assignBtn.innerHTML = '<i class="fas fa-plus"></i> Assign';
        assignBtn.onclick = () => app.assignEmployee(emp.id);

        actions.appendChild(viewBtn);
        actions.appendChild(assignBtn);

        return actions;
    }

    populateSkillFilter(employees) {
        const skillFilter = document.getElementById('skillFilter');
        
        if (!skillFilter) return;

        const allSkills = [...new Set(employees.flatMap(emp => emp.skills))].sort();
        
        const fragment = document.createDocumentFragment();
        
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'All Skills';
        fragment.appendChild(defaultOption);

        allSkills.forEach(skill => {
            const option = document.createElement('option');
            option.value = skill;
            option.textContent = skill;
            fragment.appendChild(option);
        });

        skillFilter.innerHTML = '';
        skillFilter.appendChild(fragment);
    }
}

// ============================================
// EMPLOYEE DIRECTORY APP
// ============================================

class EmployeeDirectoryApp {
    constructor() {
        this.dataService = new DataService();
        this.uiManager = new UIManager();
        this.currentAssignEmployee = null;
        
        this.debouncedFilter = debounce(() => this.filterEmployees(), 300);
    }

    async init() {
        this.setupEventListeners();
        await this.loadEmployees();
    }

    setupEventListeners() {
        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.openLogoutModal());
        }

        // Search with debounce
        const empSearch = document.getElementById('employeeSearch');
        if (empSearch) {
            empSearch.addEventListener('input', () => this.debouncedFilter());
        }

        // Filters
        const skillFilter = document.getElementById('skillFilter');
        const availFilter = document.getElementById('availabilityFilter');
        
        if (skillFilter) {
            skillFilter.addEventListener('change', () => this.debouncedFilter());
        }
        
        if (availFilter) {
            availFilter.addEventListener('change', () => this.debouncedFilter());
        }

        // View Employee Modal
        const closeViewBtn = document.getElementById('closeViewModal');
        const closeProfileBtn = document.getElementById('closeProfileBtn');
        if (closeViewBtn) closeViewBtn.addEventListener('click', () => ModalManager.hide('viewEmployeeModal'));
        if (closeProfileBtn) closeProfileBtn.addEventListener('click', () => ModalManager.hide('viewEmployeeModal'));

        // Assign Employee Modal
        const closeAssignBtn = document.getElementById('closeAssignModal');
        const cancelAssignBtn = document.getElementById('cancelAssignBtn');
        const submitAssignBtn = document.getElementById('submitAssignBtn');
        
        if (closeAssignBtn) closeAssignBtn.addEventListener('click', () => ModalManager.hide('assignEmployeeModal'));
        if (cancelAssignBtn) cancelAssignBtn.addEventListener('click', () => ModalManager.hide('assignEmployeeModal'));
        if (submitAssignBtn) submitAssignBtn.addEventListener('click', () => this.handleAssignSubmit());

        // Busy Employee Modal
        const cancelBusyBtn = document.getElementById('cancelBusyAssign');
        const proceedBusyBtn = document.getElementById('proceedBusyAssign');
        if (cancelBusyBtn) cancelBusyBtn.addEventListener('click', () => ModalManager.hide('busyEmployeeModal'));
        if (proceedBusyBtn) proceedBusyBtn.addEventListener('click', () => this.proceedWithBusyAssignment());

        // Logout Modal
        const cancelLogoutBtn = document.getElementById('cancelLogout');
        const confirmLogoutBtn = document.getElementById('confirmLogout');
        if (cancelLogoutBtn) cancelLogoutBtn.addEventListener('click', () => ModalManager.hide('logoutModal'));
        if (confirmLogoutBtn) confirmLogoutBtn.addEventListener('click', () => this.handleLogout());

        // Close modals on overlay click
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    overlay.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });
        });

        // Form submission
        const assignForm = document.getElementById('assignEmployeeForm');
        if (assignForm) {
            assignForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleAssignSubmit();
            });
        }
    }

    async loadEmployees() {
        try {
            const employees = await this.dataService.getAllEmployees();
            this.uiManager.renderEmployees(employees);
            this.uiManager.populateSkillFilter(employees);
        } catch (error) {
            console.error('Error loading employees:', error);
            MessageManager.error('Failed to load employees');
        }
    }

    async filterEmployees() {
        try {
            const query = document.getElementById('employeeSearch').value;
            const skill = document.getElementById('skillFilter').value;
            const availability = document.getElementById('availabilityFilter').value;
            
            const employees = await this.dataService.searchEmployees(query, { skill, availability });
            this.uiManager.renderEmployees(employees);
        } catch (error) {
            console.error('Error filtering employees:', error);
        }
    }

    async viewEmployeeProfile(id) {
        try {
            ModalManager.showLoading();
            const employee = await this.dataService.getEmployeeById(id);
            ModalManager.hideLoading();
            
            if (!employee) {
                MessageManager.error('Employee not found');
                return;
            }

            // Populate modal
            document.getElementById('viewEmpName').textContent = employee.name;
            document.getElementById('viewEmpAvatar').src = employee.avatar;
            document.getElementById('viewEmpId').textContent = employee.id;
            document.getElementById('viewEmpRole').textContent = employee.role;
            document.getElementById('viewEmpDepartment').textContent = employee.department;
            document.getElementById('viewEmpExperience').textContent = employee.experience;
            document.getElementById('viewEmpWorkload').textContent = this.uiManager.formatWorkloadStatus(employee.workloadHours);
            document.getElementById('viewEmpProjects').textContent = employee.projects.length > 0 ? employee.projects.join(', ') : 'None';

            // Populate skills
            const skillsContainer = document.getElementById('viewEmpSkills');
            skillsContainer.innerHTML = '';
            employee.skills.forEach(skill => {
                const badge = document.createElement('span');
                badge.className = 'skill-badge';
                badge.textContent = skill;
                skillsContainer.appendChild(badge);
            });

            ModalManager.show('viewEmployeeModal');
        } catch (error) {
            ModalManager.hideLoading();
            console.error('Error viewing employee profile:', error);
            MessageManager.error('Failed to load employee profile');
        }
    }

    async assignEmployee(id) {
        try {
            const employee = await this.dataService.getEmployeeById(id);
            
            if (!employee) {
                MessageManager.error('Employee not found');
                return;
            }

            // Check if employee is busy
            if (employee.workloadHours >= 8) {
                this.currentAssignEmployee = employee;
                document.getElementById('busyEmployeeText').textContent = 
                    `${employee.name} is currently fully allocated (${employee.workloadHours}h/week). Do you still want to proceed with assignment?`;
                ModalManager.show('busyEmployeeModal');
                return;
            }

            this.showAssignModal(employee);
        } catch (error) {
            console.error('Error assigning employee:', error);
            MessageManager.error('Failed to load employee details');
        }
    }

    async showAssignModal(employee) {
        try {
            this.currentAssignEmployee = employee;

            // Populate employee info
            document.getElementById('assignEmpAvatar').src = employee.avatar;
            document.getElementById('assignEmpName').textContent = employee.name;
            document.getElementById('assignEmpRole').textContent = employee.role;

            // Load projects
            const projects = await this.dataService.getAllProjects();
            const activeProjects = projects.filter(p => p.status === 'active' || p.status === 'pending');
            
            const projectSelect = document.getElementById('assignProjectSelect');
            projectSelect.innerHTML = '<option value="">-- Select a project --</option>';
            
            activeProjects.forEach(proj => {
                const option = document.createElement('option');
                option.value = proj.id;
                option.textContent = proj.name;
                projectSelect.appendChild(option);
            });

            // Set default start date to today
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('assignStartDate').value = today;

            // Reset form
            document.getElementById('assignEmployeeForm').reset();
            document.getElementById('assignProjectSelect').innerHTML = projectSelect.innerHTML;
            document.getElementById('assignStartDate').value = today;
            document.getElementById('assignHours').value = 8;

            ModalManager.show('assignEmployeeModal');
        } catch (error) {
            console.error('Error showing assign modal:', error);
            MessageManager.error('Failed to load project list');
        }
    }

    proceedWithBusyAssignment() {
        ModalManager.hide('busyEmployeeModal');
        if (this.currentAssignEmployee) {
            this.showAssignModal(this.currentAssignEmployee);
        }
    }

    async handleAssignSubmit() {
        const projectId = document.getElementById('assignProjectSelect').value;
        const hours = document.getElementById('assignHours').value;
        const startDate = document.getElementById('assignStartDate').value;
        const notes = document.getElementById('assignNotes').value;

        if (!projectId) {
            MessageManager.warning('Please select a project');
            return;
        }

        if (!startDate) {
            MessageManager.warning('Please select a start date');
            return;
        }

        ModalManager.hide('assignEmployeeModal');
        ModalManager.showLoading();

        // Simulate API call
        setTimeout(() => {
            ModalManager.hideLoading();
            MessageManager.success(`${this.currentAssignEmployee.name} has been assigned successfully!`);
            this.currentAssignEmployee = null;
            this.loadEmployees();
        }, 1000);
    }

    openLogoutModal() {
        ModalManager.show('logoutModal');
    }

    async handleLogout() {
        ModalManager.hide('logoutModal');
        ModalManager.showLoading();
        
        setTimeout(() => {
            ModalManager.hideLoading();
            MessageManager.success('You have been logged out successfully.');
            // Redirect to login page
            // window.location.href = 'login.html';
        }, 1000);
    }
}

// ============================================
// INITIALIZATION
// ============================================

let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new EmployeeDirectoryApp();
    app.init();
});