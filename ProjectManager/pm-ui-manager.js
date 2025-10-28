// ============================================
// UI MANAGER MODULE
// ============================================

class PMUIManager {
    constructor() {
        this.currentPage = 'dashboard';
    }

    // Dialog Methods
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

    // Navigation
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
            dashboard: 'Dashboard',
            projects: 'My Projects',
            'resource-finder': 'Resource Finder',
            requests: 'Resource Requests'
        };
        document.getElementById('pageTitle').textContent = titles[pageName] || 'Dashboard';
    }

    // Stats Update
    updateStats(stats) {
        document.getElementById('activeProjects').textContent = stats.activeProjects;
        document.getElementById('pendingRequests').textContent = stats.pendingRequests;
        document.getElementById('teamMembers').textContent = stats.teamMembers;
        document.getElementById('overdueProjects').textContent = stats.overdueProjects;
    }

    // Render Methods
    renderProjectsOverview(projects) {
        const container = document.getElementById('projectsOverviewGrid');
        const activeProjects = projects.filter(p => p.status === 'active').slice(0, 3);
        
        if (activeProjects.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #6C757D;">No active projects</p>';
            return;
        }

        container.innerHTML = activeProjects.map(proj => `
            <div class="project-overview-card">
                <div class="project-overview-header">
                    <h3>${proj.name}</h3>
                    <span class="project-status ${proj.status}">${formatStatus(proj.status)}</span>
                </div>
                <p class="project-meta">
                    <i class="fas fa-calendar"></i> Due: ${formatDate(proj.deadline)}
                </p>
            </div>
        `).join('');
    }

    renderTeamGrid(team) {
        const container = document.getElementById('teamGrid');
        
        if (team.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #6C757D;">No team members assigned</p>';
            return;
        }

        container.innerHTML = team.map(member => `
            <div class="team-member-card">
                <img src="${member.avatar}" alt="${member.name}" class="team-member-avatar">
                <h4>${member.name}</h4>
                <p>${member.role}</p>
            </div>
        `).join('');
    }

    renderProjects(projects) {
        const container = document.getElementById('projectsGrid');
        
        if (projects.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1;">
                    <i class="fas fa-folder-open"></i>
                    <h3>No Projects Found</h3>
                    <p>Start by creating a new project</p>
                </div>
            `;
            return;
        }

        container.innerHTML = projects.map(proj => `
            <div class="project-card">
                <div class="project-card-header">
                    <div>
                        <h3>${proj.name}</h3>
                        <span class="project-status ${proj.status}">${formatStatus(proj.status)}</span>
                    </div>
                </div>
                <div class="project-card-meta">
                    <span><i class="fas fa-calendar"></i> ${formatDate(proj.deadline)}</span>
                    <span><i class="fas fa-users"></i> ${proj.teamSize} members</span>
                    <span><i class="fas fa-dollar-sign"></i> ${proj.budget}</span>
                </div>
                <p class="project-card-description">${proj.description}</p>
                <div class="project-card-actions">
                    <button class="btn-view" onclick="pmApp.viewProject('${proj.id}')">
                        <i class="fas fa-eye"></i> View Details
                    </button>
                    <button class="btn-edit" onclick="pmApp.editProject('${proj.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderResources(resources, isAIRecommended = false) {
        const container = document.getElementById('resourcesGrid');
        const title = document.getElementById('resultsTitle');
        const count = document.getElementById('resultsCount');
        
        if (isAIRecommended) {
            title.textContent = 'AI Recommendations';
        } else {
            title.textContent = 'Search Results';
        }
        
        count.textContent = `${resources.length} employee${resources.length !== 1 ? 's' : ''} found`;
        
        if (resources.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1;">
                    <i class="fas fa-user-slash"></i>
                    <h3>No Resources Found</h3>
                    <p>Try adjusting your search criteria</p>
                </div>
            `;
            return;
        }

        container.innerHTML = resources.map(resource => `
            <div class="resource-card ${isAIRecommended ? 'ai-recommended' : ''}">
                ${isAIRecommended ? `
                    <span class="ai-badge">
                        <i class="fas fa-star"></i> ${resource.matchScore}% Match
                    </span>
                ` : ''}
                <div class="resource-header">
                    <img src="${resource.avatar}" alt="${resource.name}" class="resource-avatar">
                    <div class="resource-info">
                        <h4>${resource.name}</h4>
                        <p>${resource.role}</p>
                    </div>
                </div>
                <span class="availability-badge ${resource.availability}">
                    ${this.formatAvailability(resource.availability)} (${resource.workloadHours}h)
                </span>
                <div class="resource-skills">
                    <h5>Skills</h5>
                    <div class="skills-tags">
                        ${resource.skills.slice(0, 4).map(skill => 
                            `<span class="skill-tag">${skill}</span>`
                        ).join('')}
                    </div>
                </div>
                <div class="resource-actions">
                    <button class="btn-small btn-profile" onclick="pmApp.viewResourceProfile('${resource.id}')">
                        <i class="fas fa-user"></i> Profile
                    </button>
                    <button class="btn-small btn-request" onclick="pmApp.requestResource('${resource.id}')">
                        <i class="fas fa-plus"></i> Request
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderRequests(requests) {
        const container = document.getElementById('requestsList');
        
        if (requests.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <h3>No Requests Found</h3>
                    <p>Submit a new resource request to get started</p>
                </div>
            `;
            return;
        }

        container.innerHTML = requests.map(req => `
            <div class="request-card">
                <div class="request-card-header">
                    <div>
                        <h4>${req.position} - ${req.project}</h4>
                        <div class="request-card-meta">
                            <span><i class="fas fa-calendar"></i> Submitted: ${formatDate(req.submittedDate)}</span>
                            <span><i class="fas fa-users"></i> Quantity: ${req.quantity}</span>
                            <span><i class="fas fa-flag"></i> Priority: ${capitalize(req.priority)}</span>
                        </div>
                    </div>
                    <span class="request-status ${req.status}">${formatStatus(req.status)}</span>
                </div>
                <div class="request-details">
                    <div class="detail-item">
                        <strong>Required Skills</strong>
                        <div class="skills-tags" style="margin-top: 4px;">
                            ${req.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                        </div>
                    </div>
                    <div class="detail-item">
                        <strong>Experience Level</strong>
                        ${req.experience}
                    </div>
                    <div class="detail-item">
                        <strong>Start Date</strong>
                        ${formatDate(req.startDate)}
                    </div>
                    <div class="detail-item">
                        <strong>Duration</strong>
                        ${req.duration}
                    </div>
                </div>
                ${req.status === 'pending' ? `
                    <div style="margin-top: 12px; display: flex; gap: 8px;">
                        <button class="btn-view" onclick="pmApp.viewRequest('${req.id}')" style="flex: 1;">
                            <i class="fas fa-eye"></i> View Details
                        </button>
                        <button class="btn-edit" onclick="pmApp.cancelRequest('${req.id}')" style="flex: 1;">
                            <i class="fas fa-times"></i> Cancel
                        </button>
                    </div>
                ` : ''}
            </div>
        `).join('');
    }

    formatAvailability(status) {
        const map = {
            available: 'Available',
            partial: 'Partial',
            busy: 'Busy'
        };
        return map[status] || status;
    }

    populateSkillFilter(resources) {
        const skillFilter = document.getElementById('skillFilter');
        const allSkills = [...new Set(resources.flatMap(r => r.skills))].sort();
        
        skillFilter.innerHTML = '<option value="">All Skills</option>' + 
            allSkills.map(skill => `<option value="${skill}">${skill}</option>`).join('');
    }

    populateProjectSelect(projects) {
        const projectSelect = document.getElementById('projectSelect');
        const activeProjects = projects.filter(p => p.status === 'active' || p.status === 'planning');
        
        projectSelect.innerHTML = '<option value="">Select a project</option>' + 
            activeProjects.map(proj => `<option value="${proj.id}">${proj.name}</option>`).join('');
    }

    toggleRequestForm(show) {
        const container = document.getElementById('requestFormContainer');
        if (show) {
            container.style.display = 'block';
            container.scrollIntoView({ behavior: 'smooth' });
        } else {
            container.style.display = 'none';
            document.getElementById('requestForm').reset();
        }
    }
}