// ============================================
// MAIN APPLICATION MODULE
// ============================================

class PMApp {
    constructor() {
        this.dataService = new PMDataService();
        this.uiManager = new PMUIManager();
        this.allProjects = [];
        this.allResources = [];
        this.allRequests = [];
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

        // Projects page events
        this.setupProjectsEvents();

        // Resource finder events
        this.setupResourceFinderEvents();

        // Requests page events
        this.setupRequestsEvents();
    }

    setupProjectsEvents() {
        const searchInput = document.getElementById('projectSearch');
        const statusFilter = document.getElementById('projectStatusFilter');
        const addBtn = document.getElementById('addProjectBtn');

        if (searchInput) {
            const debouncedSearch = debounce(() => this.filterProjects(), 300);
            searchInput.addEventListener('input', debouncedSearch);
        }

        if (statusFilter) {
            statusFilter.addEventListener('change', () => this.filterProjects());
        }

        if (addBtn) {
            addBtn.addEventListener('click', () => this.addProject());
        }
    }

    setupResourceFinderEvents() {
        const searchInput = document.getElementById('resourceSearch');
        const skillFilter = document.getElementById('skillFilter');
        const deptFilter = document.getElementById('departmentFilter');
        const availFilter = document.getElementById('availabilityFilter');
        const aiBtn = document.getElementById('getRecommendationsBtn');

        if (searchInput) {
            const debouncedSearch = debounce(() => this.searchResources(), 300);
            searchInput.addEventListener('input', debouncedSearch);
        }

        if (skillFilter) {
            skillFilter.addEventListener('change', () => this.searchResources());
        }

        if (deptFilter) {
            deptFilter.addEventListener('change', () => this.searchResources());
        }

        if (availFilter) {
            availFilter.addEventListener('change', () => this.searchResources());
        }

        if (aiBtn) {
            aiBtn.addEventListener('click', () => this.getAIRecommendations());
        }
    }

    setupRequestsEvents() {
        const newRequestBtn = document.getElementById('newRequestBtn');
        const closeFormBtn = document.getElementById('closeFormBtn');
        const cancelFormBtn = document.getElementById('cancelFormBtn');
        const requestForm = document.getElementById('requestForm');
        const statusFilter = document.getElementById('requestStatusFilter');

        if (newRequestBtn) {
            newRequestBtn.addEventListener('click', () => this.showRequestForm());
        }

        if (closeFormBtn) {
            closeFormBtn.addEventListener('click', () => this.uiManager.toggleRequestForm(false));
        }

        if (cancelFormBtn) {
            cancelFormBtn.addEventListener('click', () => this.uiManager.toggleRequestForm(false));
        }

        if (requestForm) {
            requestForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitRequest();
            });
        }

        if (statusFilter) {
            statusFilter.addEventListener('change', () => this.filterRequests());
        }
    }

    async navigateToPage(page) {
        this.uiManager.switchPage(page);
        
        switch(page) {
            case 'dashboard':
                await this.loadDashboard();
                break;
            case 'projects':
                await this.loadProjects();
                break;
            case 'resource-finder':
                await this.loadResourceFinder();
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

            const projects = await this.dataService.getProjects();
            this.uiManager.renderProjectsOverview(projects);

            const team = await this.dataService.getTeamMembers();
            this.uiManager.renderTeamGrid(team);
        } catch (error) {
            console.error('Error loading dashboard:', error);
            this.uiManager.showError('Failed to load dashboard data');
        }
    }

    async loadProjects() {
        try {
            this.uiManager.showLoading();
            this.allProjects = await this.dataService.getProjects();
            this.uiManager.renderProjects(this.allProjects);
            this.uiManager.hideLoading();
        } catch (error) {
            this.uiManager.hideLoading();
            console.error('Error loading projects:', error);
            this.uiManager.showError('Failed to load projects');
        }
    }

    filterProjects() {
        const searchTerm = document.getElementById('projectSearch').value.toLowerCase();
        const status = document.getElementById('projectStatusFilter').value;

        let filtered = this.allProjects.filter(proj => {
            const matchesSearch = !searchTerm || 
                proj.name.toLowerCase().includes(searchTerm) ||
                proj.description.toLowerCase().includes(searchTerm);
            
            const matchesStatus = !status || proj.status === status;
            
            return matchesSearch && matchesStatus;
        });

        this.uiManager.renderProjects(filtered);
    }

    async loadResourceFinder() {
        try {
            this.uiManager.showLoading();
            this.allResources = await this.dataService.searchResources('');
            this.uiManager.populateSkillFilter(this.allResources);
            this.uiManager.renderResources(this.allResources);
            this.uiManager.hideLoading();
        } catch (error) {
            this.uiManager.hideLoading();
            console.error('Error loading resources:', error);
            this.uiManager.showError('Failed to load resources');
        }
    }

    async searchResources() {
        try {
            const query = document.getElementById('resourceSearch').value;
            const filters = {
                skill: document.getElementById('skillFilter').value,
                department: document.getElementById('departmentFilter').value,
                availability: document.getElementById('availabilityFilter').value
            };

            const results = await this.dataService.searchResources(query, filters);
            this.uiManager.renderResources(results, false);
        } catch (error) {
            console.error('Error searching resources:', error);
            this.uiManager.showError('Failed to search resources');
        }
    }

    async getAIRecommendations() {
        const { value: formValues } = await Swal.fire({
            title: 'AI Recommendations',
            html: `
                <div style="text-align: left;">
                    <p style="margin-bottom: 16px;">Enter your project requirements to get AI-powered employee recommendations:</p>
                    
                    <label style="display: block; margin-bottom: 8px; font-weight: 600;">Required Skills (comma separated):</label>
                    <input id="aiSkills" class="swal2-input" placeholder="e.g., React, Node.js, Python" style="width: 90%; margin: 0 0 16px 0;">
                    
                    <label style="display: block; margin-bottom: 8px; font-weight: 600;">Project Type:</label>
                    <select id="aiProjectType" class="swal2-input" style="width: 90%; margin: 0;">
                        <option value="web">Web Development</option>
                        <option value="mobile">Mobile Development</option>
                        <option value="backend">Backend Development</option>
                        <option value="design">UI/UX Design</option>
                        <option value="devops">DevOps</option>
                    </select>
                </div>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonColor: '#000000',
            cancelButtonColor: '#6C757D',
            confirmButtonText: 'Get Recommendations',
            preConfirm: () => {
                const skills = document.getElementById('aiSkills').value;
                
                if (!skills) {
                    Swal.showValidationMessage('Please enter required skills');
                    return false;
                }
                
                return {
                    skills: skills.split(',').map(s => s.trim()),
                    projectType: document.getElementById('aiProjectType').value
                };
            }
        });

        if (formValues) {
            try {
                this.uiManager.showLoading();
                const recommendations = await this.dataService.getAIRecommendations(formValues);
                this.uiManager.hideLoading();
                
                if (recommendations.length === 0) {
                    this.uiManager.showError('No matching employees found. Try adjusting your requirements.');
                } else {
                    this.uiManager.renderResources(recommendations, true);
                    this.uiManager.showSuccess(`Found ${recommendations.length} recommended employee${recommendations.length !== 1 ? 's' : ''}`);
                }
            } catch (error) {
                this.uiManager.hideLoading();
                console.error('Error getting AI recommendations:', error);
                this.uiManager.showError('Failed to get recommendations');
            }
        }
    }

    async loadRequests() {
        try {
            this.uiManager.showLoading();
            this.allRequests = await this.dataService.getRequests();
            this.allProjects = await this.dataService.getProjects();
            this.uiManager.populateProjectSelect(this.allProjects);
            this.uiManager.renderRequests(this.allRequests);
            this.uiManager.hideLoading();
        } catch (error) {
            this.uiManager.hideLoading();
            console.error('Error loading requests:', error);
            this.uiManager.showError('Failed to load requests');
        }
    }

    filterRequests() {
        const status = document.getElementById('requestStatusFilter').value;
        
        let filtered = this.allRequests.filter(req => {
            return !status || req.status === status;
        });

        this.uiManager.renderRequests(filtered);
    }

    showRequestForm() {
        this.uiManager.toggleRequestForm(true);
    }

    async submitRequest() {
        const formData = {
            project: document.getElementById('projectSelect').value,
            position: document.getElementById('positionInput').value,
            quantity: parseInt(document.getElementById('quantityInput').value),
            priority: document.getElementById('prioritySelect').value,
            skills: document.getElementById('skillsInput').value.split(',').map(s => s.trim()),
            experience: document.getElementById('experienceSelect').value,
            duration: document.getElementById('durationInput').value,
            startDate: document.getElementById('startDateInput').value,
            endDate: document.getElementById('endDateInput').value,
            description: document.getElementById('descriptionInput').value
        };

        const validation = validateRequestForm(formData);
        
        if (!validation.isValid) {
            this.uiManager.showError(validation.errors.join('\n'));
            return;
        }

        try {
            this.uiManager.showLoading();
            const result = await this.dataService.submitRequest(formData);
            
            if (result.success) {
                this.uiManager.hideLoading();
                this.uiManager.showSuccess('Resource request submitted successfully!');
                this.uiManager.toggleRequestForm(false);
                await this.loadRequests();
            }
        } catch (error) {
            this.uiManager.hideLoading();
            console.error('Error submitting request:', error);
            this.uiManager.showError('Failed to submit request');
        }
    }

    async viewProject(id) {
        const project = this.allProjects.find(p => p.id === id);
        
        if (!project) {
            this.uiManager.showError('Project not found');
            return;
        }

        await Swal.fire({
            title: project.name,
            html: `
                <div style="text-align: left; padding: 20px;">
                    <div style="margin-bottom: 16px;">
                        <span class="project-status ${project.status}" style="padding: 6px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">${formatStatus(project.status)}</span>
                    </div>
                    <p><strong>Description:</strong> ${project.description}</p>
                    <p><strong>Deadline:</strong> ${formatDate(project.deadline)}</p>
                    <p><strong>Team Size:</strong> ${project.teamSize} members</p>
                    <p><strong>Budget:</strong> ${project.budget}</p>
                    <p><strong>Priority:</strong> ${capitalize(project.priority)}</p>
                </div>
            `,
            width: 600,
            confirmButtonColor: '#000000',
            confirmButtonText: 'Close'
        });
    }

    async editProject(id) {
        this.uiManager.showError('Edit project functionality will be implemented with backend integration');
    }

    async addProject() {
        this.uiManager.showError('Add project functionality will be implemented with backend integration');
    }

    async viewResourceProfile(id) {
        const resource = this.allResources.find(r => r.id === id);
        
        if (!resource) {
            this.uiManager.showError('Resource not found');
            return;
        }

        await Swal.fire({
            title: resource.name,
            html: `
                <div style="text-align: left; padding: 20px;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <img src="${resource.avatar}" alt="${resource.name}" 
                             style="width: 100px; height: 100px; border-radius: 50%; border: 3px solid #000;">
                    </div>
                    <p><strong>Role:</strong> ${resource.role}</p>
                    <p><strong>Department:</strong> ${resource.department}</p>
                    <p><strong>Experience:</strong> ${resource.experience}</p>
                    <p><strong>Current Workload:</strong> ${resource.workloadHours}h/day</p>
                    <p><strong>Availability:</strong> <span style="color: ${getStatusColor(resource.availability)}">${this.uiManager.formatAvailability(resource.availability)}</span></p>
                    <div style="margin-top: 15px;">
                        <strong>Skills:</strong>
                        <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px;">
                            ${resource.skills.map(skill => `<span style="padding: 6px 12px; background-color: #E9ECEF; border-radius: 4px; font-size: 12px;">${skill}</span>`).join('')}
                        </div>
                    </div>
                </div>
            `,
            width: 600,
            confirmButtonColor: '#000000',
            confirmButtonText: 'Close'
        });
    }

    async requestResource(id) {
        const resource = this.allResources.find(r => r.id === id);
        
        if (!resource) {
            this.uiManager.showError('Resource not found');
            return;
        }

        this.navigateToPage('requests');
        this.showRequestForm();
        
        // Pre-fill some form data
        setTimeout(() => {
            document.getElementById('positionInput').value = resource.role;
            document.getElementById('skillsInput').value = resource.skills.join(', ');
        }, 100);
    }

    async viewRequest(id) {
        const request = this.allRequests.find(r => r.id === id);
        
        if (!request) {
            this.uiManager.showError('Request not found');
            return;
        }

        await Swal.fire({
            title: 'Request Details',
            html: `
                <div style="text-align: left; padding: 20px;">
                    <h3 style="margin-bottom: 15px;">${request.position} - ${request.project}</h3>
                    <p><strong>Status:</strong> <span style="color: ${getStatusColor(request.status)}">${formatStatus(request.status)}</span></p>
                    <p><strong>Quantity:</strong> ${request.quantity} person(s)</p>
                    <p><strong>Priority:</strong> ${capitalize(request.priority)}</p>
                    <p><strong>Experience Level:</strong> ${request.experience}</p>
                    <p><strong>Start Date:</strong> ${formatDate(request.startDate)}</p>
                    <p><strong>Duration:</strong> ${request.duration}</p>
                    <p><strong>Submitted:</strong> ${formatDate(request.submittedDate)}</p>
                    <div style="margin-top: 15px;">
                        <strong>Required Skills:</strong>
                        <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px;">
                            ${request.skills.map(skill => `<span style="padding: 6px 12px; background-color: #E9ECEF; border-radius: 4px; font-size: 12px;">${skill}</span>`).join('')}
                        </div>
                    </div>
                </div>
            `,
            width: 600,
            confirmButtonColor: '#000000',
            confirmButtonText: 'Close'
        });
    }

    async cancelRequest(id) {
        const confirmed = await this.uiManager.showConfirmation(
            'Cancel Request',
            'Are you sure you want to cancel this resource request?'
        );

        if (confirmed) {
            try {
                this.uiManager.showLoading();
                await this.dataService.cancelRequest(id);
                this.uiManager.hideLoading();
                this.uiManager.showSuccess('Request cancelled successfully');
                await this.loadRequests();
            } catch (error) {
                this.uiManager.hideLoading();
                console.error('Error cancelling request:', error);
                this.uiManager.showError('Failed to cancel request');
            }
        }
    }

    showNotifications() {
        Swal.fire({
            title: 'Notifications',
            html: `
                <div style="text-align: left;">
                    <div style="padding: 12px; margin-bottom: 8px; background-color: #F8F9FA; border-radius: 6px;">
                        <strong>Resource Request Approved</strong>
                        <p style="font-size: 13px; color: #6C757D; margin-top: 4px;">Your request for Mobile Developer has been approved</p>
                        <small style="color: #6C757D;">2 hours ago</small>
                    </div>
                    <div style="padding: 12px; margin-bottom: 8px; background-color: #F8F9FA; border-radius: 6px;">
                        <strong>Project Deadline Approaching</strong>
                        <p style="font-size: 13px; color: #6C757D; margin-top: 4px;">API Integration project deadline is in 5 days</p>
                        <small style="color: #6C757D;">5 hours ago</small>
                    </div>
                    <div style="padding: 12px; background-color: #F8F9FA; border-radius: 6px;">
                        <strong>New Team Member Added</strong>
                        <p style="font-size: 13px; color: #6C757D; margin-top: 4px;">John Doe has been added to Customer Portal project</p>
                        <small style="color: #6C757D;">1 day ago</small>
                    </div>
                </div>
            `,
            confirmButtonColor: '#000000',
            confirmButtonText: 'Close'
        });
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
                window.location.href = 'login.html';
            }, 1000);
        }
    }
}

// ============================================
// INITIALIZE APPLICATION
// ============================================
let pmApp;

document.addEventListener('DOMContentLoaded', () => {
    pmApp = new PMApp();
    pmApp.init();
});