// ============================================
// UTILITY - Debounce Function
// ============================================
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

// ============================================
// DATA SERVICE - Ready for Supabase Integration
// ============================================
class EmployeeDataService {
    constructor() {
        // TODO: Initialize Supabase client here
        // this.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        this.currentEmployeeId = 'EMP001'; // Mock current user
    }

    // Employee Profile Methods
    async getEmployeeProfile() {
        // TODO: Replace with Supabase query
        // const { data, error } = await this.supabase.from('employees').select('*').eq('id', this.currentEmployeeId).single();
        return this.getMockEmployeeProfile();
    }

    async updateEmployeeProfile(profileData) {
        // TODO: Replace with Supabase mutation
        // const { data, error } = await this.supabase.from('employees').update(profileData).eq('id', this.currentEmployeeId);
        console.log('Profile updated:', profileData);
        return { success: true };
    }

    async uploadCV(file) {
        // TODO: Replace with Supabase storage upload + OCR processing
        // const { data, error } = await this.supabase.storage.from('cvs').upload(`${this.currentEmployeeId}/${file.name}`, file);
        // Then trigger OCR processing backend function
        console.log('CV uploaded:', file.name);
        return { success: true, fileName: file.name, skills: ['Python', 'JavaScript', 'React'] };
    }

    // Assignment Methods
    async getEmployeeAssignments() {
        // TODO: Replace with Supabase query
        // const { data, error } = await this.supabase.from('assignments').select('*').eq('employee_id', this.currentEmployeeId);
        return this.getMockAssignments();
    }

    async updateAssignmentStatus(assignmentId, status) {
        // TODO: Replace with Supabase mutation
        // const { data, error } = await this.supabase.from('assignments').update({ status }).eq('id', assignmentId);
        console.log(`Assignment ${assignmentId} updated to ${status}`);
        return { success: true };
    }

    // Working Hours Methods
    async getWorkingHours(period = 'week') {
        // TODO: Replace with Supabase query
        // const { data, error } = await this.supabase.from('work_logs').select('*').eq('employee_id', this.currentEmployeeId);
        return this.getMockWorkingHours(period);
    }

    async logWorkHours(assignmentId, hours, date) {
        // TODO: Replace with Supabase insert
        // const { data, error } = await this.supabase.from('work_logs').insert({ employee_id: this.currentEmployeeId, assignment_id: assignmentId, hours, date });
        console.log(`Logged ${hours} hours for assignment ${assignmentId}`);
        return { success: true };
    }

    // Stats Methods
    async getDashboardStats() {
        // TODO: Replace with Supabase queries
        const assignments = await this.getEmployeeAssignments();
        const hours = await this.getWorkingHours('today');
        
        return {
            activeAssignments: assignments.filter(a => a.status === 'in-progress').length,
            workingHours: hours.today || 0,
            completedTasks: assignments.filter(a => a.status === 'completed').length,
            pendingTasks: assignments.filter(a => a.status === 'pending').length
        };
    }

    // Mock Data Methods (Remove these when integrating with Supabase)
    getMockEmployeeProfile() {
        return {
            id: 'EMP001',
            name: 'John Doe',
            role: 'Senior Developer',
            department: 'Engineering',
            email: 'john.doe@company.com',
            joinDate: 'Jan 2020',
            experience: '5 years',
            avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=4A90E2&color=fff',
            skills: [
                { name: 'Python', level: 'Expert' },
                { name: 'JavaScript', level: 'Expert' },
                { name: 'React', level: 'Advanced' },
                { name: 'Node.js', level: 'Advanced' },
                { name: 'SQL', level: 'Intermediate' },
                { name: 'Docker', level: 'Intermediate' }
            ],
            uploadedFiles: [
                { name: 'Resume_2024.pdf', size: '245 KB', uploadDate: '2024-10-15' }
            ]
        };
    }

    getMockAssignments() {
        return [
            {
                id: 'ASSIGN001',
                title: 'Backend API Development',
                project: 'Project Alpha',
                description: 'Develop RESTful APIs for the new customer portal',
                status: 'in-progress',
                priority: 'high',
                deadline: '2025-11-15',
                progress: 65,
                hoursAllocated: 40,
                hoursWorked: 26
            },
            {
                id: 'ASSIGN002',
                title: 'Database Optimization',
                project: 'Project Alpha',
                description: 'Optimize database queries and improve performance',
                status: 'in-progress',
                priority: 'medium',
                deadline: '2025-11-20',
                progress: 30,
                hoursAllocated: 16,
                hoursWorked: 5
            },
            {
                id: 'ASSIGN003',
                title: 'Code Review',
                project: 'Project Beta',
                description: 'Review pull requests from team members',
                status: 'pending',
                priority: 'low',
                deadline: '2025-11-10',
                progress: 0,
                hoursAllocated: 8,
                hoursWorked: 0
            },
            {
                id: 'ASSIGN004',
                title: 'Authentication Module',
                project: 'Project Gamma',
                description: 'Implement JWT authentication and authorization',
                status: 'completed',
                priority: 'high',
                deadline: '2025-10-30',
                progress: 100,
                hoursAllocated: 24,
                hoursWorked: 24
            }
        ];
    }

    getMockWorkingHours(period) {
        if (period === 'today') {
            return { today: 6 };
        }
        
        return {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
            data: [8, 7, 6, 8, 5]
        };
    }
}

// ============================================
// UI MANAGER CLASS
// ============================================
class EmployeeUIManager {
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
            dashboard: 'My Dashboard',
            profile: 'My Profile',
            assignments: 'My Assignments'
        };
        document.getElementById('pageTitle').textContent = titles[pageName] || 'Dashboard';
    }

    updateStats(stats) {
        document.getElementById('activeAssignments').textContent = stats.activeAssignments;
        document.getElementById('workingHours').textContent = stats.workingHours + 'h';
        document.getElementById('completedTasks').textContent = stats.completedTasks;
        document.getElementById('pendingTasks').textContent = stats.pendingTasks;
    }

    updateHeaderInfo(profile) {
        document.getElementById('headerName').textContent = profile.name;
        document.getElementById('headerAvatar').src = profile.avatar;
    }

    renderCurrentAssignments(assignments) {
        const container = document.getElementById('currentAssignmentsList');
        const activeAssignments = assignments.filter(a => a.status === 'in-progress').slice(0, 3);
        
        if (activeAssignments.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #6C757D;">No active assignments</p>';
            return;
        }

        container.innerHTML = activeAssignments.map(assign => `
            <div class="assignment-card">
                <div class="assignment-header">
                    <div>
                        <h3 class="assignment-title">${assign.title}</h3>
                        <p class="assignment-project">${assign.project}</p>
                    </div>
                    <span class="assignment-status ${assign.status}">${this.formatStatus(assign.status)}</span>
                </div>
                <div class="assignment-footer">
                    <span class="assignment-deadline">
                        <i class="fas fa-calendar"></i>
                        Due: ${this.formatDate(assign.deadline)}
                    </span>
                    <span class="assignment-hours">${assign.hoursWorked}/${assign.hoursAllocated}h</span>
                </div>
            </div>
        `).join('');
    }

    renderProfile(profile) {
        // Update header
        document.getElementById('profileName').textContent = profile.name;
        document.getElementById('profileRole').textContent = profile.role;
        document.getElementById('profileId').textContent = profile.id;
        document.getElementById('profileDept').textContent = profile.department;
        document.getElementById('profileEmail').textContent = profile.email;
        document.getElementById('profileAvatar').src = profile.avatar;
        document.getElementById('totalExperience').textContent = profile.experience;
        document.getElementById('currentPosition').textContent = profile.role;
        document.getElementById('joinDate').textContent = profile.joinDate;

        // Render skills
        this.renderSkills(profile.skills);

        // Render uploaded files
        this.renderUploadedFiles(profile.uploadedFiles);
    }

    renderSkills(skills) {
        const container = document.getElementById('skillsGrid');
        
        if (skills.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #6C757D; grid-column: 1/-1;">No skills added yet</p>';
            return;
        }

        container.innerHTML = skills.map(skill => `
            <div class="skill-item">
                <div class="skill-info">
                    <h4>${skill.name}</h4>
                    <p class="skill-level">${skill.level}</p>
                </div>
                <button class="skill-remove" onclick="employeeApp.removeSkill('${skill.name}')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
    }

    renderUploadedFiles(files) {
        const container = document.getElementById('uploadedFilesList');
        
        if (!files || files.length === 0) {
            container.innerHTML = '';
            return;
        }

        container.innerHTML = files.map(file => `
            <div class="uploaded-file">
                <div class="file-info">
                    <div class="file-icon">
                        <i class="fas fa-file-pdf"></i>
                    </div>
                    <div class="file-details">
                        <h4>${file.name}</h4>
                        <p>${file.size} • Uploaded ${this.formatDate(file.uploadDate)}</p>
                    </div>
                </div>
                <div class="file-actions">
                    <button class="icon-btn" onclick="employeeApp.viewFile('${file.name}')" title="View">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="icon-btn" onclick="employeeApp.deleteFile('${file.name}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderAssignments(assignments) {
        const container = document.getElementById('assignmentsGrid');
        
        if (assignments.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1;">
                    <i class="fas fa-inbox"></i>
                    <h3>No Assignments Found</h3>
                    <p>You don't have any assignments yet</p>
                </div>
            `;
            return;
        }

        container.innerHTML = assignments.map(assign => `
            <div class="assignment-detail-card">
                <div class="assignment-detail-header">
                    <h3>${assign.title}</h3>
                    <p style="color: #6C757D; font-size: 14px; margin-bottom: 8px;">${assign.project}</p>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <span class="assignment-status ${assign.status}">${this.formatStatus(assign.status)}</span>
                        <span class="priority-badge ${assign.priority}">${this.capitalize(assign.priority)}</span>
                    </div>
                </div>
                <div class="assignment-detail-meta">
                    <span><i class="fas fa-calendar"></i> ${this.formatDate(assign.deadline)}</span>
                    <span><i class="fas fa-clock"></i> ${assign.hoursWorked}/${assign.hoursAllocated}h</span>
                </div>
                <p class="assignment-description">${assign.description}</p>
                <div class="assignment-actions" style="margin-top: 16px;">
                    ${assign.status !== 'completed' ? `
                        <button class="btn-info" onclick="employeeApp.viewAssignment('${assign.id}')">
                            <i class="fas fa-eye"></i> View
                        </button>
                        <button class="btn-success" onclick="employeeApp.logHours('${assign.id}')">
                            <i class="fas fa-clock"></i> Log Hours
                        </button>
                    ` : `
                        <button class="btn-info" onclick="employeeApp.viewAssignment('${assign.id}')" style="flex: 1;">
                            <i class="fas fa-eye"></i> View Details
                        </button>
                    `}
                </div>
            </div>
        `).join('');
    }

    formatStatus(status) {
        return status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }

    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}

// ============================================
// CHART MANAGER CLASS
// ============================================
class EmployeeChartManager {
    constructor() {
        this.hoursChart = null;
    }

    initHoursChart(data) {
        const ctx = document.getElementById('hoursChart').getContext('2d');
        
        if (this.hoursChart) {
            this.hoursChart.destroy();
        }

        this.hoursChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Hours Worked',
                    data: data.data,
                    backgroundColor: data.data.map(h => {
                        if (h < 8) return '#F5A623';
                        if (h === 8) return '#4A90E2';
                        return '#D0021B';
                    }),
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 12,
                        ticks: { stepSize: 2 },
                        grid: { display: true }
                    },
                    x: {
                        grid: { display: false }
                    }
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (context) => `${context.parsed.y} hours`
                        }
                    }
                }
            }
        });
    }
}

// ============================================
// MAIN APPLICATION CLASS
// ============================================
class EmployeeApp {
    constructor() {
        this.dataService = new EmployeeDataService();
        this.uiManager = new EmployeeUIManager();
        this.chartManager = new EmployeeChartManager();
        this.currentProfile = null;
        this.allAssignments = [];
    }

    async init() {
        this.setupEventListeners();
        await this.loadDashboard();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.currentTarget.dataset.page;
                this.navigateToPage(page);
            });
        });

        // Logout
        document.getElementById('logoutBtn').addEventListener('click', () => this.logout());

        // Profile page events
        this.setupProfileEvents();

        // Assignments page events
        this.setupAssignmentsEvents();
    }

    setupProfileEvents() {
        // CV Upload
        const cvUploadArea = document.getElementById('cvUploadArea');
        const cvFileInput = document.getElementById('cvFileInput');
        const browseBtn = document.getElementById('browseBtn');

        if (cvUploadArea) {
            cvUploadArea.addEventListener('click', () => cvFileInput.click());
            cvUploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                cvUploadArea.classList.add('drag-over');
            });
            cvUploadArea.addEventListener('dragleave', () => {
                cvUploadArea.classList.remove('drag-over');
            });
            cvUploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                cvUploadArea.classList.remove('drag-over');
                const files = e.dataTransfer.files;
                if (files.length > 0) this.handleCVUpload(files[0]);
            });
        }

        if (cvFileInput) {
            cvFileInput.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    this.handleCVUpload(e.target.files[0]);
                }
            });
        }

        if (browseBtn) {
            browseBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                cvFileInput.click();
            });
        }

        // Add skill button
        const addSkillBtn = document.getElementById('addSkillBtn');
        if (addSkillBtn) {
            addSkillBtn.addEventListener('click', () => this.addSkill());
        }

        // Update profile button
        const updateBtn = document.getElementById('updateProfileBtn');
        if (updateBtn) {
            updateBtn.addEventListener('click', () => this.updateProfile());
        }

        // Edit experience button
        const editExpBtn = document.getElementById('editExperienceBtn');
        if (editExpBtn) {
            editExpBtn.addEventListener('click', () => this.editExperience());
        }
    }

    setupAssignmentsEvents() {
        // Search with debounce
        const searchInput = document.getElementById('assignmentSearch');
        if (searchInput) {
            const debouncedSearch = debounce(() => this.filterAssignments(), 300);
            searchInput.addEventListener('input', debouncedSearch);
        }

        // Filters
        const statusFilter = document.getElementById('statusFilter');
        const priorityFilter = document.getElementById('priorityFilter');
        
        if (statusFilter) {
            statusFilter.addEventListener('change', () => this.filterAssignments());
        }
        if (priorityFilter) {
            priorityFilter.addEventListener('change', () => this.filterAssignments());
        }
    }

    async navigateToPage(page) {
        this.uiManager.switchPage(page);
        
        switch(page) {
            case 'dashboard':
                await this.loadDashboard();
                break;
            case 'profile':
                await this.loadProfile();
                break;
            case 'assignments':
                await this.loadAssignments();
                break;
        }
    }

    async loadDashboard() {
        try {
            // Load profile for header
            if (!this.currentProfile) {
                this.currentProfile = await this.dataService.getEmployeeProfile();
                this.uiManager.updateHeaderInfo(this.currentProfile);
            }

            // Load stats
            const stats = await this.dataService.getDashboardStats();
            this.uiManager.updateStats(stats);

            // Load working hours chart
            const hoursData = await this.dataService.getWorkingHours('week');
            this.chartManager.initHoursChart(hoursData);

            // Load current assignments
            const assignments = await this.dataService.getEmployeeAssignments();
            this.uiManager.renderCurrentAssignments(assignments);
        } catch (error) {
            console.error('Error loading dashboard:', error);
            this.uiManager.showError('Failed to load dashboard data');
        }
    }

    async loadProfile() {
        try {
            this.uiManager.showLoading();
            this.currentProfile = await this.dataService.getEmployeeProfile();
            this.uiManager.renderProfile(this.currentProfile);
            this.uiManager.hideLoading();
        } catch (error) {
            this.uiManager.hideLoading();
            console.error('Error loading profile:', error);
            this.uiManager.showError('Failed to load profile');
        }
    }

    async loadAssignments() {
        try {
            this.uiManager.showLoading();
            this.allAssignments = await this.dataService.getEmployeeAssignments();
            this.uiManager.renderAssignments(this.allAssignments);
            this.uiManager.hideLoading();
        } catch (error) {
            this.uiManager.hideLoading();
            console.error('Error loading assignments:', error);
            this.uiManager.showError('Failed to load assignments');
        }
    }

    filterAssignments() {
        const searchTerm = document.getElementById('assignmentSearch').value.toLowerCase();
        const statusFilter = document.getElementById('statusFilter').value;
        const priorityFilter = document.getElementById('priorityFilter').value;

        let filtered = this.allAssignments.filter(assign => {
            const matchesSearch = !searchTerm || 
                assign.title.toLowerCase().includes(searchTerm) ||
                assign.project.toLowerCase().includes(searchTerm) ||
                assign.description.toLowerCase().includes(searchTerm);
            
            const matchesStatus = !statusFilter || assign.status === statusFilter;
            const matchesPriority = !priorityFilter || assign.priority === priorityFilter;
            
            return matchesSearch && matchesStatus && matchesPriority;
        });

        this.uiManager.renderAssignments(filtered);
    }

    async handleCVUpload(file) {
        // Validate file
        const maxSize = 5 * 1024 * 1024; // 5MB
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
        
        if (file.size > maxSize) {
            this.uiManager.showError('File size exceeds 5MB limit');
            return;
        }
        
        if (!allowedTypes.includes(file.type)) {
            this.uiManager.showError('Only PDF, JPG, and PNG files are allowed');
            return;
        }

        try {
            this.uiManager.showLoading();
            const result = await this.dataService.uploadCV(file);
            this.uiManager.hideLoading();
            
            if (result.success) {
                await Swal.fire({
                    icon: 'success',
                    title: 'CV Uploaded Successfully!',
                    html: `
                        <p>Your CV has been processed using OCR and NLP.</p>
                        <p style="margin-top: 12px;"><strong>Extracted Skills:</strong></p>
                        <div style="display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; margin-top: 8px;">
                            ${result.skills.map(skill => `<span style="padding: 6px 12px; background-color: #E9ECEF; border-radius: 4px; font-size: 12px;">${skill}</span>`).join('')}
                        </div>
                    `,
                    confirmButtonColor: '#000000'
                });
                
                // Reload profile to show new file
                await this.loadProfile();
            }
        } catch (error) {
            this.uiManager.hideLoading();
            console.error('Error uploading CV:', error);
            this.uiManager.showError('Failed to upload CV');
        }
    }

    async addSkill() {
        const { value: formValues } = await Swal.fire({
            title: 'Add New Skill',
            html: `
                <div style="text-align: left;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 600;">Skill Name:</label>
                    <input id="skillName" class="swal2-input" placeholder="e.g., Python" style="width: 90%; margin: 0 0 16px 0;">
                    
                    <label style="display: block; margin-bottom: 8px; font-weight: 600;">Proficiency Level:</label>
                    <select id="skillLevel" class="swal2-input" style="width: 90%; margin: 0;">
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                        <option value="Expert">Expert</option>
                    </select>
                </div>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonColor: '#000000',
            cancelButtonColor: '#6C757D',
            confirmButtonText: 'Add Skill',
            preConfirm: () => {
                const skillName = document.getElementById('skillName').value;
                const skillLevel = document.getElementById('skillLevel').value;
                
                if (!skillName) {
                    Swal.showValidationMessage('Please enter a skill name');
                    return false;
                }
                
                return { name: skillName, level: skillLevel };
            }
        });

        if (formValues) {
            this.currentProfile.skills.push(formValues);
            this.uiManager.renderSkills(this.currentProfile.skills);
            this.uiManager.showSuccess(`${formValues.name} has been added to your skills`);
        }
    }

    async removeSkill(skillName) {
        const confirmed = await this.uiManager.showConfirmation(
            'Remove Skill',
            `Are you sure you want to remove ${skillName} from your skills?`
        );

        if (confirmed) {
            this.currentProfile.skills = this.currentProfile.skills.filter(s => s.name !== skillName);
            this.uiManager.renderSkills(this.currentProfile.skills);
            this.uiManager.showSuccess(`${skillName} has been removed`);
        }
    }

    async updateProfile() {
        const confirmed = await this.uiManager.showConfirmation(
            'Update Profile',
            'Are you sure you want to save all changes to your profile?'
        );

        if (confirmed) {
            try {
                this.uiManager.showLoading();
                await this.dataService.updateEmployeeProfile(this.currentProfile);
                this.uiManager.hideLoading();
                this.uiManager.showSuccess('Profile updated successfully!');
            } catch (error) {
                this.uiManager.hideLoading();
                console.error('Error updating profile:', error);
                this.uiManager.showError('Failed to update profile');
            }
        }
    }

    async editExperience() {
        const { value: formValues } = await Swal.fire({
            title: 'Edit Work Experience',
            html: `
                <div style="text-align: left;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 600;">Total Experience:</label>
                    <input id="totalExp" class="swal2-input" value="${this.currentProfile.experience}" placeholder="e.g., 5 years" style="width: 90%; margin: 0 0 16px 0;">
                    
                    <label style="display: block; margin-bottom: 8px; font-weight: 600;">Current Position:</label>
                    <input id="currentPos" class="swal2-input" value="${this.currentProfile.role}" placeholder="e.g., Senior Developer" style="width: 90%; margin: 0;">
                </div>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonColor: '#000000',
            cancelButtonColor: '#6C757D',
            confirmButtonText: 'Save Changes',
            preConfirm: () => {
                return {
                    experience: document.getElementById('totalExp').value,
                    role: document.getElementById('currentPos').value
                };
            }
        });

        if (formValues) {
            this.currentProfile.experience = formValues.experience;
            this.currentProfile.role = formValues.role;
            document.getElementById('totalExperience').textContent = formValues.experience;
            document.getElementById('currentPosition').textContent = formValues.role;
            this.uiManager.showSuccess('Experience updated successfully');
        }
    }

    async viewFile(fileName) {
        await Swal.fire({
            title: fileName,
            html: '<p>File viewing functionality will be implemented with backend integration</p>',
            confirmButtonColor: '#000000'
        });
    }

    async deleteFile(fileName) {
        const confirmed = await this.uiManager.showConfirmation(
            'Delete File',
            `Are you sure you want to delete ${fileName}?`
        );

        if (confirmed) {
            this.currentProfile.uploadedFiles = this.currentProfile.uploadedFiles.filter(f => f.name !== fileName);
            this.uiManager.renderUploadedFiles(this.currentProfile.uploadedFiles);
            this.uiManager.showSuccess('File deleted successfully');
        }
    }

    async viewAssignment(id) {
        const assignment = this.allAssignments.find(a => a.id === id);
        
        if (!assignment) {
            this.uiManager.showError('Assignment not found');
            return;
        }

        await Swal.fire({
            title: assignment.title,
            html: `
                <div style="text-align: left; padding: 20px;">
                    <div style="display: flex; gap: 8px; margin-bottom: 16px;">
                        <span class="assignment-status ${assignment.status}" style="padding: 6px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">${this.uiManager.formatStatus(assignment.status)}</span>
                        <span class="priority-badge ${assignment.priority}" style="padding: 6px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">${this.uiManager.capitalize(assignment.priority)}</span>
                    </div>
                    <p><strong>Project:</strong> ${assignment.project}</p>
                    <p><strong>Deadline:</strong> ${this.uiManager.formatDate(assignment.deadline)}</p>
                    <p><strong>Hours Allocated:</strong> ${assignment.hoursAllocated}h</p>
                    <p><strong>Hours Worked:</strong> ${assignment.hoursWorked}h</p>
                    <p><strong>Progress:</strong> ${assignment.progress}%</p>
                    <div style="width: 100%; height: 10px; background-color: #E9ECEF; border-radius: 5px; margin: 12px 0;">
                        <div style="width: ${assignment.progress}%; height: 100%; background-color: #4A90E2; border-radius: 5px;"></div>
                    </div>
                    <p style="margin-top: 16px;"><strong>Description:</strong></p>
                    <p style="color: #6C757D;">${assignment.description}</p>
                </div>
            `,
            width: 600,
            confirmButtonColor: '#000000',
            confirmButtonText: 'Close'
        });
    }

    async logHours(assignmentId) {
        const assignment = this.allAssignments.find(a => a.id === assignmentId);
        
        if (!assignment) {
            this.uiManager.showError('Assignment not found');
            return;
        }

        const { value: formValues } = await Swal.fire({
            title: 'Log Working Hours',
            html: `
                <div style="text-align: left;">
                    <p style="margin-bottom: 16px;"><strong>Assignment:</strong> ${assignment.title}</p>
                    
                    <label style="display: block; margin-bottom: 8px; font-weight: 600;">Date:</label>
                    <input id="workDate" type="date" class="swal2-input" value="${new Date().toISOString().split('T')[0]}" style="width: 90%; margin: 0 0 16px 0;">
                    
                    <label style="display: block; margin-bottom: 8px; font-weight: 600;">Hours Worked:</label>
                    <input id="hoursWorked" type="number" class="swal2-input" min="0.5" max="12" step="0.5" placeholder="e.g., 4" style="width: 90%; margin: 0 0 16px 0;">
                    
                    <label style="display: block; margin-bottom: 8px; font-weight: 600;">Notes (optional):</label>
                    <textarea id="workNotes" class="swal2-textarea" placeholder="Describe what you worked on..." style="width: 90%; margin: 0;"></textarea>
                </div>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonColor: '#000000',
            cancelButtonColor: '#6C757D',
            confirmButtonText: 'Log Hours',
            preConfirm: () => {
                const hours = parseFloat(document.getElementById('hoursWorked').value);
                
                if (!hours || hours <= 0) {
                    Swal.showValidationMessage('Please enter valid hours');
                    return false;
                }
                
                return {
                    date: document.getElementById('workDate').value,
                    hours: hours,
                    notes: document.getElementById('workNotes').value
                };
            }
        });

        if (formValues) {
            try {
                this.uiManager.showLoading();
                await this.dataService.logWorkHours(assignmentId, formValues.hours, formValues.date);
                
                // Update assignment hours
                assignment.hoursWorked += formValues.hours;
                assignment.progress = Math.min(100, Math.round((assignment.hoursWorked / assignment.hoursAllocated) * 100));
                
                this.uiManager.hideLoading();
                this.uiManager.showSuccess(`${formValues.hours} hours logged successfully!`);
                
                // Refresh current page
                if (this.uiManager.currentPage === 'assignments') {
                    this.uiManager.renderAssignments(this.allAssignments);
                } else {
                    this.uiManager.renderCurrentAssignments(this.allAssignments);
                }
            } catch (error) {
                this.uiManager.hideLoading();
                console.error('Error logging hours:', error);
                this.uiManager.showError('Failed to log hours');
            }
        }
    }

    async logout() {
        const confirmed = await this.uiManager.showConfirmation(
            'Confirm Logout',
            'Are you sure you want to logout?'
        );

        if (confirmed) {
            this.uiManager.showLoading();
            
            // TODO: Add Supabase logout here
            // await this.dataService.supabase.auth.signOut();
            
            setTimeout(() => {
                window.location.href = 'login.html'; // Redirect to login page
            }, 1000);
        }
    }
}

// ============================================
// INITIALIZE APPLICATION
// ============================================
let employeeApp;

document.addEventListener('DOMContentLoaded', () => {
    employeeApp = new EmployeeApp();
    employeeApp.init();
});

// ============================================
// SUPABASE INTEGRATION GUIDE
// ============================================
/*
To integrate with Supabase:

1. Install Supabase client:
   Add to your HTML head:
   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

2. Initialize Supabase in EmployeeDataService constructor:
   const { createClient } = supabase;
   this.supabase = createClient('YOUR_SUPABASE_URL', 'YOUR_SUPABASE_ANON_KEY');

3. Get current user:
   const { data: { user } } = await this.supabase.auth.getUser();
   this.currentEmployeeId = user.id;

4. Database Schema Suggestions:
   
   Table: employee_profiles
   - id (uuid, primary key, references auth.users)
   - name (text)
   - role (text)
   - department (text)
   - email (text)
   - join_date (date)
   - experience (text)
   - avatar (text)
   - created_at (timestamp)
   - updated_at (timestamp)

   Table: employee_skills
   - id (uuid, primary key)
   - employee_id (uuid, foreign key)
   - skill_name (text)
   - proficiency_level (text)
   - created_at (timestamp)

   Table: cv_uploads
   - id (uuid, primary key)
   - employee_id (uuid, foreign key)
   - file_name (text)
   - file_path (text)
   - file_size (text)
   - upload_date (timestamp)
   - processed (boolean)
   - extracted_skills (text[])

   Table: assignments
   - id (uuid, primary key)
   - employee_id (uuid, foreign key)
   - project_id (uuid, foreign key)
   - title (text)
   - description (text)
   - status (text)
   - priority (text)
   - deadline (date)
   - hours_allocated (integer)
   - hours_worked (integer)
   - progress (integer)
   - created_at (timestamp)
   - updated_at (timestamp)

   Table: work_logs
   - id (uuid, primary key)
   - employee_id (uuid, foreign key)
   - assignment_id (uuid, foreign key)
   - date (date)
   - hours (decimal)
   - notes (text)
   - created_at (timestamp)

5. Storage bucket for CV files:
   Create a bucket named 'employee-cvs' in Supabase Storage

6. OCR Processing:
   Create a Supabase Edge Function to process uploaded CVs:
   - Use Tesseract.js for OCR
   - Use NLP libraries for skill extraction
   - Update employee_skills table with extracted skills

7. Add Row Level Security (RLS) policies:
   - Employees can only view/edit their own data
   - Managers can view all employee data
*/