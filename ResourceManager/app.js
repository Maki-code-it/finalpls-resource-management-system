
        class DataService {
            constructor() {}

            async getAllEmployees() {
                return this.getMockEmployees();
            }

            async getEmployeeById(id) {
                const employees = await this.getAllEmployees();
                return employees.find(emp => emp.id === id);
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
                return this.getMockProjects();
            }

            async getProjectById(id) {
                const projects = await this.getAllProjects();
                return projects.find(proj => proj.id === id);
            }

            async getAllRequests() {
                return this.getMockRequests();
            }

            async updateRequestStatus(id, status) {
                console.log(`Request ${id} updated to ${status}`);
                return { success: true };
            }

            async getDashboardStats() {
                const employees = await this.getAllEmployees();
                const projects = await this.getAllProjects();
                
                const available = employees.filter(e => e.workloadHours >= 0 && e.workloadHours <= 4).length;
                const partial = employees.filter(e => e.workloadHours > 4 && e.workloadHours < 8).length;
                const full = employees.filter(e => e.workloadHours >= 8).length;
                
                return {
                    totalEmployees: employees.length,
                    availableEmployees: available,
                    partialEmployees: partial,
                    fullyAllocated: full,
                    activeProjects: projects.filter(p => p.status === 'active').length
                };
            }

            async getTimelineData(period = 'today') {
                const employees = await this.getAllEmployees();
                
                let dates = [];
                if (period === 'today') {
                    const today = new Date();
                    dates = [today.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })];
                } else if (period === 'week') {
                    dates = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
                } else if (period === 'month') {
                    dates = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
                }
                
                return {
                    dates,
                    employees: employees.map(emp => ({
                        ...emp,
                        timeline: period === 'week' ? emp.weeklySchedule : 
                                 period === 'month' ? {'Week 1': emp.workloadHours, 'Week 2': emp.workloadHours, 'Week 3': emp.workloadHours, 'Week 4': emp.workloadHours} :
                                 { [dates[0]]: emp.workloadHours }
                    }))
                };
            }

            async getWorkloadSummary() {
                const employees = await this.getAllEmployees();
                
                const totalHours = employees.reduce((sum, emp) => sum + emp.workloadHours, 0);
                const avgHours = (totalHours / employees.length).toFixed(1);
                
                const belowTarget = employees.filter(e => e.workloadHours < 8).length;
                const atTarget = employees.filter(e => e.workloadHours === 8).length;
                const overTarget = employees.filter(e => e.workloadHours > 8).length;
                
                return {
                    avgHours,
                    belowTarget,
                    atTarget,
                    overTarget
                };
            }

            getMockEmployees() {
                return [
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
                        avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=4A90E2&color=fff',
                        weeklySchedule: { 'Mon': 8, 'Tue': 8, 'Wed': 8, 'Thu': 8, 'Fri': 8 }
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
                        avatar: 'https://ui-avatars.com/api/?name=Jane+Smith&background=7ED321&color=fff',
                        weeklySchedule: { 'Mon': 10, 'Tue': 9, 'Wed': 11, 'Thu': 10, 'Fri': 10 }
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
                        avatar: 'https://ui-avatars.com/api/?name=Mike+Johnson&background=F5A623&color=fff',
                        weeklySchedule: { 'Mon': 6, 'Tue': 7, 'Wed': 5, 'Thu': 6, 'Fri': 6 }
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
                        avatar: 'https://ui-avatars.com/api/?name=Sarah+Williams&background=D0021B&color=fff',
                        weeklySchedule: { 'Mon': 4, 'Tue': 3, 'Wed': 2, 'Thu': 3, 'Fri': 3 }
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
                        avatar: 'https://ui-avatars.com/api/?name=David+Brown&background=4A90E2&color=fff',
                        weeklySchedule: { 'Mon': 9, 'Tue': 8, 'Wed': 9, 'Thu': 10, 'Fri': 9 }
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
                        avatar: 'https://ui-avatars.com/api/?name=Emily+Davis&background=7ED321&color=fff',
                        weeklySchedule: { 'Mon': 2, 'Tue': 3, 'Wed': 2, 'Thu': 1, 'Fri': 2 }
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
                        avatar: 'https://ui-avatars.com/api/?name=Robert+Martinez&background=F5A623&color=fff',
                        weeklySchedule: { 'Mon': 8, 'Tue': 8, 'Wed': 8, 'Thu': 8, 'Fri': 8 }
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
                        avatar: 'https://ui-avatars.com/api/?name=Lisa+Anderson&background=D0021B&color=fff',
                        weeklySchedule: { 'Mon': 5, 'Tue': 6, 'Wed': 5, 'Thu': 4, 'Fri': 5 }
                    }
                ];
            }

            getMockProjects() {
                return [
                    {
                        id: 'PROJ001',
                        name: 'Project Alpha',
                        status: 'active',
                        teamSize: 5,
                        progress: 65,
                        deadline: '2025-12-15',
                        manager: 'Sarah Williams',
                        skills: ['Python', 'React', 'AWS']
                    },
                    {
                        id: 'PROJ002',
                        name: 'Project Beta',
                        status: 'active',
                        teamSize: 3,
                        progress: 45,
                        deadline: '2025-11-30',
                        manager: 'John Anderson',
                        skills: ['UI/UX', 'Figma', 'Frontend']
                    },
                    {
                        id: 'PROJ003',
                        name: 'Project Gamma',
                        status: 'pending',
                        teamSize: 4,
                        progress: 20,
                        deadline: '2026-01-20',
                        manager: 'Lisa Chen',
                        skills: ['Java', 'Spring Boot', 'SQL']
                    },
                    {
                        id: 'PROJ004',
                        name: 'Project Delta',
                        status: 'active',
                        teamSize: 6,
                        progress: 80,
                        deadline: '2025-11-10',
                        manager: 'Mark Taylor',
                        skills: ['Angular', 'Node.js', 'MongoDB']
                    },
                    {
                        id: 'PROJ005',
                        name: 'Project Epsilon',
                        status: 'completed',
                        teamSize: 4,
                        progress: 100,
                        deadline: '2025-10-01',
                        manager: 'Sarah Williams',
                        skills: ['DevOps', 'Docker', 'Kubernetes']
                    }
                ];
            }

            getMockRequests() {
                return [
                    {
                        id: 'REQ001',
                        projectName: 'Project Zeta',
                        requester: 'Michael Scott',
                        department: 'Sales',
                        position: 'Frontend Developer',
                        skillsRequired: ['React', 'TypeScript', 'CSS'],
                        experience: 'Mid-level (3-5 years)',
                        quantity: 2,
                        priority: 'High',
                        startDate: '2025-11-15',
                        duration: '6 months',
                        status: 'pending',
                        submittedDate: '2025-10-20'
                    },
                    {
                        id: 'REQ002',
                        projectName: 'Project Omega',
                        requester: 'Dwight Schrute',
                        department: 'Operations',
                        position: 'Backend Developer',
                        skillsRequired: ['Python', 'Django', 'PostgreSQL'],
                        experience: 'Senior (5+ years)',
                        quantity: 1,
                        priority: 'Medium',
                        startDate: '2025-12-01',
                        duration: '4 months',
                        status: 'pending',
                        submittedDate: '2025-10-22'
                    },
                    {
                        id: 'REQ003',
                        projectName: 'Project Sigma',
                        requester: 'Pam Beesly',
                        department: 'Marketing',
                        position: 'UI/UX Designer',
                        skillsRequired: ['Figma', 'Adobe XD', 'User Research'],
                        experience: 'Junior (1-3 years)',
                        quantity: 1,
                        priority: 'Low',
                        startDate: '2025-11-25',
                        duration: '3 months',
                        status: 'approved',
                        submittedDate: '2025-10-18'
                    }
                ];
            }
        }

        // ============================================
        // UI MANAGER
        // ============================================
        class UIManager {
            constructor() {
                this.currentPage = 'dashboard';
            }

            showLoading() {
                Swal.fire({
                    title: 'Loading...',
                    allowOutsideClick: false,
                    didOpen: () => Swal.showLoading()
                });
            }

            hideLoading() {
                Swal.close();
            }

            showSuccess(message) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: message,
                    confirmButtonColor: '#000000'
                });
            }

            showError(message) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: message,
                    confirmButtonColor: '#D0021B'
                });
            }

            async showConfirmation(title, text) {
                const result = await Swal.fire({
                    title: title,
                    text: text,
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#000000',
                    cancelButtonColor: '#6C757D',
                    confirmButtonText: 'Yes, proceed',
                    cancelButtonText: 'Cancel'
                });
                return result.isConfirmed;
            }

            switchPage(pageName) {
                document.querySelectorAll('.page-content').forEach(page => {
                    page.classList.remove('active');
                });
                
                document.querySelectorAll('.nav-item').forEach(item => {
                    item.classList.remove('active');
                });

                const targetPage = document.getElementById(`${pageName}Page`);
                const targetNav = document.querySelector(`[data-page="${pageName}"]`);
                
                if (targetPage) targetPage.classList.add('active');
                if (targetNav) targetNav.classList.add('active');

                this.updatePageTitle(pageName);
                this.currentPage = pageName;
            }

            updatePageTitle(pageName) {
                const titles = {
                    dashboard: 'Capacity & Productivity Overview',
                    employees: 'Employee Directory',
                    projects: 'Projects Management',
                    requests: 'Resource Allocation Requests'
                };
                document.getElementById('pageTitle').textContent = titles[pageName] || 'Dashboard';
            }

            updateStats(stats) {
                document.getElementById('totalEmployees').textContent = stats.totalEmployees;
                document.getElementById('availableEmployees').textContent = stats.availableEmployees;
                document.getElementById('partialEmployees').textContent = stats.partialEmployees;
                document.getElementById('fullyAllocated').textContent = stats.fullyAllocated;
            }

            renderTimelineView(data) {
                const datesContainer = document.getElementById('timelineDates');
                const rowsContainer = document.getElementById('timelineRows');
                
                datesContainer.innerHTML = `
                    <div class="timeline-date-cell">Employee</div>
                    ${data.dates.map(date => `<div class="timeline-date-cell">${date}</div>`).join('')}
                `;
                
                rowsContainer.innerHTML = data.employees.map(emp => {
                    const timelineCells = data.dates.map(date => {
                        const hours = emp.timeline[date] || 0;
                        const percentage = (hours / 8) * 100;
                        const status = this.getWorkloadStatus(hours);
                        
                        return `
                            <div class="workload-cell">
                                <div class="workload-bar">
                                    <div class="workload-fill ${status}" style="width: ${Math.min(percentage, 100)}%">
                                        ${hours > 0 ? `<span class="workload-label">${hours}h</span>` : ''}
                                    </div>
                                    ${hours === 0 ? `<span class="workload-label">0h</span>` : ''}
                                </div>
                            </div>
                        `;
                    }).join('');
                    
                    return `
                        <div class="timeline-row">
                            <div class="employee-cell">
                                <img src="${emp.avatar}" alt="${emp.name}">
                                <div class="employee-cell-info">
                                    <h4>${emp.name}</h4>
                                    <p>${emp.role}</p>
                                </div>
                            </div>
                            ${timelineCells}
                        </div>
                    `;
                }).join('');
            }

            renderWorkloadSummary(summary) {
                document.getElementById('avgHours').textContent = summary.avgHours + 'h';
                document.getElementById('belowTarget').textContent = summary.belowTarget;
                document.getElementById('atTarget').textContent = summary.atTarget;
                document.getElementById('overTarget').textContent = summary.overTarget;
            }

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
                
                if (employees.length === 0) {
                    container.innerHTML = '<p style="text-align: center; color: #6C757D;">No employees found</p>';
                    return;
                }

                container.innerHTML = employees.map(emp => {
                    const statusClass = this.getWorkloadStatus(emp.workloadHours);
                    const statusText = this.formatWorkloadStatus(emp.workloadHours);
                    
                    return `
                        <div class="employee-card" data-id="${emp.id}">
                            <div class="employee-header">
                                <img src="${emp.avatar}" alt="${emp.name}" class="employee-avatar">
                                <div class="employee-info">
                                    <h3>${emp.name}</h3>
                                    <p class="employee-role">${emp.role}</p>
                                    <span class="status-badge ${statusClass}">${statusText}</span>
                                </div>
                            </div>
                            <div class="employee-skills">
                                <h4>Skills</h4>
                                <div class="skills-list">
                                    ${emp.skills.slice(0, 4).map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                                </div>
                            </div>
                            <div class="employee-actions">
                                <button class="btn-secondary" onclick="app.viewEmployeeProfile('${emp.id}')">
                                    <i class="fas fa-eye"></i> View Profile
                                </button>
                                <button class="btn-primary" onclick="app.assignEmployee('${emp.id}')">
                                    <i class="fas fa-plus"></i> Assign
                                </button>
                            </div>
                        </div>
                    `;
                }).join('');
            }

            renderProjects(projects) {
                const tbody = document.getElementById('projectsTableBody');
                
                if (projects.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No projects found</td></tr>';
                    return;
                }

                tbody.innerHTML = projects.map(proj => `
                    <tr data-id="${proj.id}">
                        <td><strong>${proj.name}</strong></td>
                        <td><span class="project-status ${proj.status}">${this.capitalize(proj.status)}</span></td>
                        <td>${proj.teamSize} members</td>
                        <td>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${proj.progress}%"></div>
                            </div>
                            <small>${proj.progress}%</small>
                        </td>
                        <td>${this.formatDate(proj.deadline)}</td>
                        <td>
                            <div class="action-buttons">
                                <button class="icon-btn" onclick="app.viewProject('${proj.id}')" title="View">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button class="icon-btn" onclick="app.editProject('${proj.id}')" title="Edit">
                                    <i class="fas fa-edit"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `).join('');
            }

            renderRequests(requests) {
                const container = document.getElementById('requestsList');
                
                if (requests.length === 0) {
                    container.innerHTML = '<p style="text-align: center; color: #6C757D;">No requests found</p>';
                    return;
                }

                container.innerHTML = requests.map(req => `
                    <div class="request-card" data-id="${req.id}">
                        <div class="request-header">
                            <div class="request-info">
                                <h3>${req.projectName}</h3>
                                <div class="request-meta">
                                    <span><i class="fas fa-user"></i> ${req.requester}</span>
                                    <span><i class="fas fa-building"></i> ${req.department}</span>
                                    <span><i class="fas fa-calendar"></i> ${req.submittedDate}</span>
                                </div>
                            </div>
                            <span class="project-status ${req.status}">${this.capitalize(req.status)}</span>
                        </div>
                        <div class="request-content">
                            <div class="request-details">
                                <div class="detail-item">
                                    <span class="detail-label">POSITION</span>
                                    <span class="detail-value">${req.position}</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">QUANTITY</span>
                                    <span class="detail-value">${req.quantity} person(s)</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">EXPERIENCE</span>
                                    <span class="detail-value">${req.experience}</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">PRIORITY</span>
                                    <span class="detail-value">${req.priority}</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">START DATE</span>
                                    <span class="detail-value">${this.formatDate(req.startDate)}</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">DURATION</span>
                                    <span class="detail-value">${req.duration}</span>
                                </div>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">REQUIRED SKILLS</span>
                                <div class="skills-list" style="margin-top: 8px;">
                                    ${req.skillsRequired.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                                </div>
                            </div>
                        </div>
                        ${req.status === 'pending' ? `
                            <div class="request-actions">
                                <button class="btn-approve" onclick="app.approveRequest('${req.id}')">
                                    <i class="fas fa-check"></i> Approve
                                </button>
                                <button class="btn-reject" onclick="app.rejectRequest('${req.id}')">
                                    <i class="fas fa-times"></i> Reject
                                </button>
                                <button class="btn-view" onclick="app.viewRequestDetails('${req.id}')">
                                    <i class="fas fa-eye"></i> View Details
                                </button>
                            </div>
                        ` : ''}
                    </div>
                `).join('');
            }

            formatDate(dateString) {
                const date = new Date(dateString);
                return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
            }

            capitalize(str) {
                return str.charAt(0).toUpperCase() + str.slice(1);
            }

            populateSkillFilter(employees) {
                const skillFilter = document.getElementById('skillFilter');
                const allSkills = [...new Set(employees.flatMap(emp => emp.skills))].sort();
                
                skillFilter.innerHTML = '<option value="">All Skills</option>' + 
                    allSkills.map(skill => `<option value="${skill}">${skill}</option>`).join('');
            }
        }

        // ============================================
        // MAIN APPLICATION
        // ============================================
        class ResourceManagerApp {
            constructor() {
                this.dataService = new DataService();
                this.uiManager = new UIManager();
                this.currentPeriod = 'today';
            }

            async init() {
                this.setupEventListeners();
                await this.loadDashboard();
            }

            setupEventListeners() {
                document.querySelectorAll('.nav-item').forEach(item => {
                    item.addEventListener('click', (e) => {
                        e.preventDefault();
                        const page = e.currentTarget.dataset.page;
                        this.navigateToPage(page);
                    });
                });

                document.getElementById('logoutBtn').addEventListener('click', () => this.logout());

                document.querySelectorAll('.filter-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                        e.target.classList.add('active');
                        this.currentPeriod = e.target.dataset.period;
                        this.updateTimelineView();
                    });
                });

                const empSearch = document.getElementById('employeeSearch');
                const skillFilter = document.getElementById('skillFilter');
                const availFilter = document.getElementById('availabilityFilter');
                
                if (empSearch) empSearch.addEventListener('input', () => this.filterEmployees());
                if (skillFilter) skillFilter.addEventListener('change', () => this.filterEmployees());
                if (availFilter) availFilter.addEventListener('change', () => this.filterEmployees());

                const projSearch = document.getElementById('projectSearch');
                if (projSearch) projSearch.addEventListener('input', () => this.filterProjects());

                const reqFilter = document.getElementById('requestStatusFilter');
                if (reqFilter) reqFilter.addEventListener('change', () => this.filterRequests());

                const addProjBtn = document.getElementById('addProjectBtn');
                if (addProjBtn) addProjBtn.addEventListener('click', () => this.addProject());
            }

            async navigateToPage(page) {
                this.uiManager.switchPage(page);
                
                switch(page) {
                    case 'dashboard':
                        await this.loadDashboard();
                        break;
                    case 'employees':
                        await this.loadEmployees();
                        break;
                    case 'projects':
                        await this.loadProjects();
                        break;
                    case 'requests':
                        await this.loadRequests();
                        break;
                }
            }

            async loadDashboard() {
                try {
                    const stats = await this.dataService.getDashboardStats();
                    this.uiManager.updateStats(stats);

                    await this.updateTimelineView();
                    
                    const summary = await this.dataService.getWorkloadSummary();
                    this.uiManager.renderWorkloadSummary(summary);
                } catch (error) {
                    console.error('Error loading dashboard:', error);
                    this.uiManager.showError('Failed to load dashboard data');
                }
            }

            async updateTimelineView() {
                try {
                    const data = await this.dataService.getTimelineData(this.currentPeriod);
                    this.uiManager.renderTimelineView(data);
                } catch (error) {
                    console.error('Error updating timeline:', error);
                    this.uiManager.showError('Failed to update timeline view');
                }
            }

            async loadEmployees() {
                try {
                    const employees = await this.dataService.getAllEmployees();
                    this.uiManager.renderEmployees(employees);
                    this.uiManager.populateSkillFilter(employees);
                } catch (error) {
                    console.error('Error loading employees:', error);
                    this.uiManager.showError('Failed to load employees');
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

            async loadProjects() {
                try {
                    const projects = await this.dataService.getAllProjects();
                    this.uiManager.renderProjects(projects);
                } catch (error) {
                    console.error('Error loading projects:', error);
                    this.uiManager.showError('Failed to load projects');
                }
            }

            async filterProjects() {
                try {
                    const query = document.getElementById('projectSearch').value.toLowerCase();
                    const projects = await this.dataService.getAllProjects();
                    const filtered = projects.filter(proj => 
                        proj.name.toLowerCase().includes(query) ||
                        proj.manager.toLowerCase().includes(query)
                    );
                    this.uiManager.renderProjects(filtered);
                } catch (error) {
                    console.error('Error filtering projects:', error);
                }
            }

            async loadRequests() {
                try {
                    const requests = await this.dataService.getAllRequests();
                    this.uiManager.renderRequests(requests);
                } catch (error) {
                    console.error('Error loading requests:', error);
                    this.uiManager.showError('Failed to load requests');
                }
            }

            async filterRequests() {
                try {
                    const status = document.getElementById('requestStatusFilter').value;
                    const requests = await this.dataService.getAllRequests();
                    const filtered = status ? requests.filter(req => req.status === status) : requests;
                    this.uiManager.renderRequests(filtered);
                } catch (error) {
                    console.error('Error filtering requests:', error);
                }
            }

            async viewEmployeeProfile(id) {
                try {
                    this.uiManager.showLoading();
                    const employee = await this.dataService.getEmployeeById(id);
                    this.uiManager.hideLoading();
                    
                    if (!employee) {
                        this.uiManager.showError('Employee not found');
                        return;
                    }

                    const workloadStatus = this.uiManager.formatWorkloadStatus(employee.workloadHours);
                    const statusColor = this.getWorkloadColor(employee.workloadHours);

                    await Swal.fire({
                        title: employee.name,
                        html: `
                            <div style="text-align: left; padding: 20px;">
                                <div style="text-align: center; margin-bottom: 20px;">
                                    <img src="${employee.avatar}" alt="${employee.name}" 
                                         style="width: 100px; height: 100px; border-radius: 50%; border: 3px solid #000;">
                                </div>
                                <p><strong>Employee ID:</strong> ${employee.id}</p>
                                <p><strong>Role:</strong> ${employee.role}</p>
                                <p><strong>Department:</strong> ${employee.department}</p>
                                <p><strong>Experience:</strong> ${employee.experience}</p>
                                <p><strong>Current Workload:</strong> <span style="color: ${statusColor}">${workloadStatus}</span></p>
                                <p><strong>Active Projects:</strong> ${employee.projects.length > 0 ? employee.projects.join(', ') : 'None'}</p>
                                <div style="margin-top: 15px;">
                                    <strong>Skills:</strong>
                                    <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px;">
                                        ${employee.skills.map(skill => `<span style="padding: 6px 12px; background-color: #E9ECEF; border-radius: 4px; font-size: 12px;">${skill}</span>`).join('')}
                                    </div>
                                </div>
                            </div>
                        `,
                        width: 600,
                        confirmButtonColor: '#000000',
                        confirmButtonText: 'Close'
                    });
                } catch (error) {
                    this.uiManager.hideLoading();
                    console.error('Error viewing employee profile:', error);
                    this.uiManager.showError('Failed to load employee profile');
                }
            }

            async assignEmployee(id) {
                try {
                    const employee = await this.dataService.getEmployeeById(id);
                    
                    if (!employee) {
                        this.uiManager.showError('Employee not found');
                        return;
                    }

                    if (employee.workloadHours >= 8) {
                        const confirm = await this.uiManager.showConfirmation(
                            'Employee is Busy',
                            `${employee.name} is currently fully allocated. Do you still want to proceed with assignment?`
                        );
                        
                        if (!confirm) return;
                    }

                    const projects = await this.dataService.getAllProjects();
                    const activeProjects = projects.filter(p => p.status === 'active' || p.status === 'pending');

                    const { value: projectId } = await Swal.fire({
                        title: `Assign ${employee.name}`,
                        html: `
                            <div style="text-align: left;">
                                <label style="display: block; margin-bottom: 8px; font-weight: 600;">Select Project:</label>
                                <select id="projectSelect" class="swal2-input" style="width: 100%;">
                                    <option value="">-- Select a project --</option>
                                    ${activeProjects.map(proj => `<option value="${proj.id}">${proj.name}</option>`).join('')}
                                </select>
                            </div>
                        `,
                        focusConfirm: false,
                        showCancelButton: true,
                        confirmButtonColor: '#000000',
                        cancelButtonColor: '#6C757D',
                        confirmButtonText: 'Assign',
                        preConfirm: () => {
                            const select = document.getElementById('projectSelect');
                            if (!select.value) {
                                Swal.showValidationMessage('Please select a project');
                                return false;
                            }
                            return select.value;
                        }
                    });

                    if (projectId) {
                        this.uiManager.showLoading();
                        setTimeout(() => {
                            this.uiManager.hideLoading();
                            this.uiManager.showSuccess(`${employee.name} has been assigned successfully!`);
                            this.loadEmployees();
                        }, 1000);
                    }
                } catch (error) {
                    console.error('Error assigning employee:', error);
                    this.uiManager.showError('Failed to assign employee');
                }
            }

            async viewProject(id) {
                try {
                    this.uiManager.showLoading();
                    const project = await this.dataService.getProjectById(id);
                    this.uiManager.hideLoading();
                    
                    if (!project) {
                        this.uiManager.showError('Project not found');
                        return;
                    }

                    await Swal.fire({
                        title: project.name,
                        html: `
                            <div style="text-align: left; padding: 20px;">
                                <p><strong>Project ID:</strong> ${project.id}</p>
                                <p><strong>Status:</strong> <span style="color: ${this.getStatusColor(project.status)}">${this.uiManager.capitalize(project.status)}</span></p>
                                <p><strong>Project Manager:</strong> ${project.manager}</p>
                                <p><strong>Team Size:</strong> ${project.teamSize} members</p>
                                <p><strong>Progress:</strong> ${project.progress}%</p>
                                <div style="width: 100%; height: 10px; background-color: #E9ECEF; border-radius: 5px; margin: 10px 0;">
                                    <div style="width: ${project.progress}%; height: 100%; background-color: #4A90E2; border-radius: 5px;"></div>
                                </div>
                                <p><strong>Deadline:</strong> ${this.uiManager.formatDate(project.deadline)}</p>
                                <div style="margin-top: 15px;">
                                    <strong>Required Skills:</strong>
                                    <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px;">
                                        ${project.skills.map(skill => `<span style="padding: 6px 12px; background-color: #E9ECEF; border-radius: 4px; font-size: 12px;">${skill}</span>`).join('')}
                                    </div>
                                </div>
                            </div>
                        `,
                        width: 600,
                        confirmButtonColor: '#000000',
                        confirmButtonText: 'Close'
                    });
                } catch (error) {
                    this.uiManager.hideLoading();
                    console.error('Error viewing project:', error);
                    this.uiManager.showError('Failed to load project details');
                }
            }

            async editProject(id) {
                this.uiManager.showError('Edit project functionality will be implemented with backend integration');
            }

            async addProject() {
                this.uiManager.showError('Add project functionality will be implemented with backend integration');
            }

            async approveRequest(id) {
                try {
                    const confirmed = await this.uiManager.showConfirmation(
                        'Approve Request',
                        'Are you sure you want to approve this resource request?'
                    );

                    if (!confirmed) return;

                    this.uiManager.showLoading();
                    await this.dataService.updateRequestStatus(id, 'approved');
                    
                    setTimeout(() => {
                        this.uiManager.hideLoading();
                        this.uiManager.showSuccess('Request has been approved successfully!');
                        this.loadRequests();
                    }, 1000);
                } catch (error) {
                    this.uiManager.hideLoading();
                    console.error('Error approving request:', error);
                    this.uiManager.showError('Failed to approve request');
                }
            }

            async rejectRequest(id) {
                try {
                    const { value: reason } = await Swal.fire({
                        title: 'Reject Request',
                        input: 'textarea',
                        inputLabel: 'Reason for rejection (optional)',
                        inputPlaceholder: 'Enter your reason here...',
                        showCancelButton: true,
                        confirmButtonColor: '#D0021B',
                        cancelButtonColor: '#6C757D',
                        confirmButtonText: 'Reject Request',
                        cancelButtonText: 'Cancel'
                    });

                    if (reason !== undefined) {
                        this.uiManager.showLoading();
                        await this.dataService.updateRequestStatus(id, 'rejected');
                        
                        setTimeout(() => {
                            this.uiManager.hideLoading();
                            this.uiManager.showSuccess('Request has been rejected');
                            this.loadRequests();
                        }, 1000);
                    }
                } catch (error) {
                    this.uiManager.hideLoading();
                    console.error('Error rejecting request:', error);
                    this.uiManager.showError('Failed to reject request');
                }
            }

            async viewRequestDetails(id) {
                try {
                    this.uiManager.showLoading();
                    const requests = await this.dataService.getAllRequests();
                    const request = requests.find(r => r.id === id);
                    this.uiManager.hideLoading();
                    
                    if (!request) {
                        this.uiManager.showError('Request not found');
                        return;
                    }

                    await Swal.fire({
                        title: 'Request Details',
                        html: `
                            <div style="text-align: left; padding: 20px;">
                                <h3 style="margin-bottom: 15px; color: #000;">${request.projectName}</h3>
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                                    <div>
                                        <p style="color: #6C757D; font-size: 12px; margin-bottom: 4px;">REQUESTER</p>
                                        <p style="font-weight: 600;">${request.requester}</p>
                                    </div>
                                    <div>
                                        <p style="color: #6C757D; font-size: 12px; margin-bottom: 4px;">DEPARTMENT</p>
                                        <p style="font-weight: 600;">${request.department}</p>
                                    </div>
                                    <div>
                                        <p style="color: #6C757D; font-size: 12px; margin-bottom: 4px;">POSITION</p>
                                        <p style="font-weight: 600;">${request.position}</p>
                                    </div>
                                    <div>
                                        <p style="color: #6C757D; font-size: 12px; margin-bottom: 4px;">QUANTITY</p>
                                        <p style="font-weight: 600;">${request.quantity} person(s)</p>
                                    </div>
                                    <div>
                                        <p style="color: #6C757D; font-size: 12px; margin-bottom: 4px;">EXPERIENCE</p>
                                        <p style="font-weight: 600;">${request.experience}</p>
                                    </div>
                                    <div>
                                        <p style="color: #6C757D; font-size: 12px; margin-bottom: 4px;">PRIORITY</p>
                                        <p style="font-weight: 600; color: ${this.getPriorityColor(request.priority)}">${request.priority}</p>
                                    </div>
                                    <div>
                                        <p style="color: #6C757D; font-size: 12px; margin-bottom: 4px;">START DATE</p>
                                        <p style="font-weight: 600;">${this.uiManager.formatDate(request.startDate)}</p>
                                    </div>
                                    <div>
                                        <p style="color: #6C757D; font-size: 12px; margin-bottom: 4px;">DURATION</p>
                                        <p style="font-weight: 600;">${request.duration}</p>
                                    </div>
                                </div>
                                <div style="margin-top: 20px;">
                                    <p style="color: #6C757D; font-size: 12px; margin-bottom: 8px;">REQUIRED SKILLS</p>
                                    <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                                        ${request.skillsRequired.map(skill => `<span style="padding: 6px 12px; background-color: #E9ECEF; border-radius: 4px; font-size: 12px;">${skill}</span>`).join('')}
                                    </div>
                                </div>
                            </div>
                        `,
                        width: 700,
                        confirmButtonColor: '#000000',
                        confirmButtonText: 'Close'
                    });
                } catch (error) {
                    this.uiManager.hideLoading();
                    console.error('Error viewing request details:', error);
                    this.uiManager.showError('Failed to load request details');
                }
            }

            async logout() {
                const confirmed = await this.uiManager.showConfirmation(
                    'Confirm Logout',
                    'Are you sure you want to logout?'
                );

                if (confirmed) {
                    this.uiManager.showLoading();
                    setTimeout(() => {
                        alert('Logout functionality will redirect to login page');
                        this.uiManager.hideLoading();
                    }, 1000);
                }
            }

            getWorkloadColor(hours) {
                if (hours <= 4) return '#7ED321';
                if (hours > 4 && hours < 8) return '#F5A623';
                if (hours === 8) return '#4A90E2';
                return '#D0021B';
            }

            getStatusColor(status) {
                const colors = {
                    active: '#7ED321',
                    pending: '#F5A623',
                    completed: '#4A90E2'
                };
                return colors[status] || '#6C757D';
            }

            getPriorityColor(priority) {
                const colors = {
                    High: '#D0021B',
                    Medium: '#F5A623',
                    Low: '#4A90E2'
                };
                return colors[priority] || '#6C757D';
            }
        }

        // Initialize Application
        let app;
        document.addEventListener('DOMContentLoaded', () => {
            app = new ResourceManagerApp();
            app.init();
        });
