/* ==================== SUPER ADMIN DASHBOARD JAVASCRIPT ==================== */

// Super Admin App Class
class SuperAdminApp {
    constructor() {
        this.organizations = [];
        this.users = [];
        this.systemConfig = {
            systemName: 'RMRS',
            systemDescription: 'Resource Management Recommender System Using OCR and NLP',
            defaultLanguage: 'en',
            timeZone: 'Asia/Manila',
            ocrEngine: 'tesseract',
            nlpModel: 'spacy'
        };
    }

    init() {
        this.setupEventListeners();
        this.loadMockData();
        this.updateDashboardStats();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.getAttribute('data-page');
                this.switchPage(page);
            });
        });

        // Logout
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.logout();
        });
    }

    switchPage(pageName) {
        // Remove active class from all nav items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });

        // Add active class to clicked nav item
        document.querySelector(`[data-page="${pageName}"]`).classList.add('active');

        // Hide all pages
        document.querySelectorAll('.page-content').forEach(page => {
            page.classList.remove('active');
        });

        // Show selected page
        document.getElementById(pageName).classList.add('active');

        // Update page title
        const titles = {
            'dashboard': 'Dashboard',
            'organizations': 'Organizations',
            'system-config': 'System Configuration',
            'users': 'User Management',
            'analytics': 'Analytics',
            'settings': 'Admin Settings'
        };
        document.getElementById('pageTitle').textContent = titles[pageName] || 'Dashboard';
    }

    loadMockData() {
        // Load mock organizations
        this.organizations = [
            {
                id: 1,
                name: 'Pamantasan ng Lungsod ng Pasig',
                industry: 'Education',
                users: 150,
                status: 'active',
                createdDate: '2024-01-15'
            },
            {
                id: 2,
                name: 'TechCorp Philippines',
                industry: 'Information Technology',
                users: 85,
                status: 'active',
                createdDate: '2024-02-20'
            }
        ];

        this.renderOrganizationsTable();
        this.renderRecentOrganizations();
    }

    updateDashboardStats() {
        document.getElementById('totalOrganizations').textContent = this.organizations.length;
        document.getElementById('totalUsers').textContent = this.organizations.reduce((sum, org) => sum + org.users, 0);
        document.getElementById('activeProjects').textContent = Math.floor(Math.random() * 50) + 20;
    }

    renderOrganizationsTable() {
        const tbody = document.getElementById('organizationsTableBody');
        
        if (this.organizations.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6">
                        <div class="empty-state">
                            <i class="fas fa-building"></i>
                            <p>No organizations found. Click "Add Organization" to create one.</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.organizations.map(org => `
            <tr>
                <td><strong>${org.name}</strong></td>
                <td>${org.industry}</td>
                <td>${org.users}</td>
                <td><span class="status-badge status-${org.status}">${org.status.charAt(0).toUpperCase() + org.status.slice(1)}</span></td>
                <td>${new Date(org.createdDate).toLocaleDateString()}</td>
                <td>
                    <button class="action-btn edit" onclick="window.superAdminApp.editOrganization(${org.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="action-btn delete" onclick="window.superAdminApp.deleteOrganization(${org.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            </tr>
        `).join('');
    }

    renderRecentOrganizations() {
        const container = document.getElementById('recentOrganizationsTable');
        
        if (this.organizations.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-building"></i>
                    <p>No organizations yet</p>
                </div>
            `;
            return;
        }

        const recent = this.organizations.slice(0, 3);
        container.innerHTML = `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Organization</th>
                        <th>Industry</th>
                        <th>Users</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${recent.map(org => `
                        <tr>
                            <td><strong>${org.name}</strong></td>
                            <td>${org.industry}</td>
                            <td>${org.users}</td>
                            <td><span class="status-badge status-${org.status}">${org.status.charAt(0).toUpperCase() + org.status.slice(1)}</span></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    async addOrganization() {
        const { value: formValues } = await Swal.fire({
            title: 'Add New Organization',
            html: `
                <div style="text-align: left;">
                    <div style="margin-bottom: 16px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600;">Organization Name:</label>
                        <input id="orgName" class="swal2-input" placeholder="e.g., Acme Corporation" style="width: 90%; margin: 0;">
                    </div>
                    
                    <div style="margin-bottom: 16px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600;">Industry:</label>
                        <select id="orgIndustry" class="swal2-input" style="width: 90%; margin: 0;">
                            <option value="">Select Industry</option>
                            <option value="Information Technology">Information Technology</option>
                            <option value="Education">Education</option>
                            <option value="Healthcare">Healthcare</option>
                            <option value="Finance">Finance</option>
                            <option value="Construction">Construction</option>
                            <option value="Manufacturing">Manufacturing</option>
                            <option value="Retail">Retail</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    
                    <div style="margin-bottom: 16px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600;">Initial Admin Email:</label>
                        <input id="orgEmail" type="email" class="swal2-input" placeholder="admin@organization.com" style="width: 90%; margin: 0;">
                    </div>
                </div>
            `,
            width: 600,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonColor: '#000000',
            cancelButtonColor: '#6C757D',
            confirmButtonText: 'Create Organization',
            preConfirm: () => {
                const orgName = document.getElementById('orgName').value.trim();
                const orgIndustry = document.getElementById('orgIndustry').value;
                const orgEmail = document.getElementById('orgEmail').value.trim();
                
                if (!orgName) {
                    Swal.showValidationMessage('Please enter organization name');
                    return false;
                }
                if (!orgIndustry) {
                    Swal.showValidationMessage('Please select an industry');
                    return false;
                }
                if (!orgEmail) {
                    Swal.showValidationMessage('Please enter admin email');
                    return false;
                }
                
                return { name: orgName, industry: orgIndustry, email: orgEmail };
            }
        });

        if (formValues) {
            // TODO: Replace with Supabase insert
            // const { data, error } = await supabase
            //     .from('organizations')
            //     .insert({
            //         name: formValues.name,
            //         industry: formValues.industry,
            //         admin_email: formValues.email,
            //         status: 'active'
            //     });

            const newOrg = {
                id: this.organizations.length + 1,
                name: formValues.name,
                industry: formValues.industry,
                users: 0,
                status: 'active',
                createdDate: new Date().toISOString().split('T')[0]
            };

            this.organizations.push(newOrg);
            this.renderOrganizationsTable();
            this.renderRecentOrganizations();
            this.updateDashboardStats();

            Swal.fire({
                icon: 'success',
                title: 'Organization Created!',
                text: `${formValues.name} has been added successfully.`,
                confirmButtonColor: '#000000'
            });
        }
    }

    async editOrganization(id) {
        const org = this.organizations.find(o => o.id === id);
        if (!org) return;

        const { value: formValues } = await Swal.fire({
            title: 'Edit Organization',
            html: `
                <div style="text-align: left;">
                    <div style="margin-bottom: 16px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600;">Organization Name:</label>
                        <input id="orgName" class="swal2-input" value="${org.name}" style="width: 90%; margin: 0;">
                    </div>
                    
                    <div style="margin-bottom: 16px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600;">Industry:</label>
                        <select id="orgIndustry" class="swal2-input" style="width: 90%; margin: 0;">
                            <option value="Information Technology" ${org.industry === 'Information Technology' ? 'selected' : ''}>Information Technology</option>
                            <option value="Education" ${org.industry === 'Education' ? 'selected' : ''}>Education</option>
                            <option value="Healthcare" ${org.industry === 'Healthcare' ? 'selected' : ''}>Healthcare</option>
                            <option value="Finance" ${org.industry === 'Finance' ? 'selected' : ''}>Finance</option>
                            <option value="Construction" ${org.industry === 'Construction' ? 'selected' : ''}>Construction</option>
                            <option value="Other" ${org.industry === 'Other' ? 'selected' : ''}>Other</option>
                        </select>
                    </div>
                </div>
            `,
            width: 600,
            showCancelButton: true,
            confirmButtonColor: '#000000',
            confirmButtonText: 'Save Changes',
            preConfirm: () => {
                return {
                    name: document.getElementById('orgName').value.trim(),
                    industry: document.getElementById('orgIndustry').value
                };
            }
        });

        if (formValues) {
            // TODO: Update in Supabase
            // const { data, error } = await supabase
            //     .from('organizations')
            //     .update({
            //         name: formValues.name,
            //         industry: formValues.industry
            //     })
            //     .eq('id', id);

            org.name = formValues.name;
            org.industry = formValues.industry;
            this.renderOrganizationsTable();
            this.renderRecentOrganizations();

            Swal.fire({
                icon: 'success',
                title: 'Updated!',
                text: 'Organization has been updated.',
                confirmButtonColor: '#000000'
            });
        }
    }

    async deleteOrganization(id) {
        const result = await Swal.fire({
            title: 'Delete Organization?',
            text: 'This action cannot be undone. All data associated with this organization will be permanently deleted.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#D0021B',
            cancelButtonColor: '#6C757D',
            confirmButtonText: 'Yes, delete it'
        });

        if (result.isConfirmed) {
            // TODO: Delete from Supabase
            // const { data, error } = await supabase
            //     .from('organizations')
            //     .delete()
            //     .eq('id', id);

            this.organizations = this.organizations.filter(o => o.id !== id);
            this.renderOrganizationsTable();
            this.renderRecentOrganizations();
            this.updateDashboardStats();

            Swal.fire({
                icon: 'success',
                title: 'Deleted!',
                text: 'Organization has been deleted.',
                confirmButtonColor: '#000000'
            });
        }
    }

    async addUser() {
        const { value: formValues } = await Swal.fire({
            title: 'Add New User',
            html: `
                <div style="text-align: left;">
                    <div style="margin-bottom: 16px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600;">Full Name:</label>
                        <input id="userName" class="swal2-input" placeholder="John Doe" style="width: 90%; margin: 0;">
                    </div>
                    
                    <div style="margin-bottom: 16px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600;">Email:</label>
                        <input id="userEmail" type="email" class="swal2-input" placeholder="john@example.com" style="width: 90%; margin: 0;">
                    </div>
                    
                    <div style="margin-bottom: 16px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600;">Role:</label>
                        <select id="userRole" class="swal2-input" style="width: 90%; margin: 0;">
                            <option value="">Select Role</option>
                            <option value="Resource Manager">Resource Manager</option>
                            <option value="Project Manager">Project Manager</option>
                            <option value="Employee">Employee</option>
                        </select>
                    </div>
                    
                    <div style="margin-bottom: 16px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600;">Organization:</label>
                        <select id="userOrg" class="swal2-input" style="width: 90%; margin: 0;">
                            <option value="">Select Organization</option>
                            ${this.organizations.map(org => `<option value="${org.id}">${org.name}</option>`).join('')}
                        </select>
                    </div>
                </div>
            `,
            width: 600,
            showCancelButton: true,
            confirmButtonColor: '#000000',
            confirmButtonText: 'Create User',
            preConfirm: () => {
                const name = document.getElementById('userName').value.trim();
                const email = document.getElementById('userEmail').value.trim();
                const role = document.getElementById('userRole').value;
                const orgId = document.getElementById('userOrg').value;
                
                if (!name || !email || !role || !orgId) {
                    Swal.showValidationMessage('Please fill in all fields');
                    return false;
                }
                
                return { name, email, role, orgId };
            }
        });

        if (formValues) {
            // TODO: Add to Supabase
            // const { data, error } = await supabase
            //     .from('users')
            //     .insert({
            //         name: formValues.name,
            //         email: formValues.email,
            //         role: formValues.role,
            //         organization_id: formValues.orgId
            //     });

            Swal.fire({
                icon: 'success',
                title: 'User Created!',
                text: `${formValues.name} has been added successfully.`,
                confirmButtonColor: '#000000'
            });
        }
    }

    saveSystemConfig() {
        // Get form values
        const systemName = document.getElementById('systemName').value.trim();
        const systemDescription = document.getElementById('systemDescription').value.trim();
        const defaultLanguage = document.getElementById('defaultLanguage').value;
        const timeZone = document.getElementById('timeZone').value;
        const ocrEngine = document.getElementById('ocrEngine').value;
        const nlpModel = document.getElementById('nlpModel').value;

        if (!systemName) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'System name is required',
                confirmButtonColor: '#D0021B'
            });
            return;
        }

        // TODO: Save to Supabase
        // const { data, error } = await supabase
        //     .from('system_config')
        //     .upsert({
        //         system_name: systemName,
        //         system_description: systemDescription,
        //         default_language: defaultLanguage,
        //         time_zone: timeZone,
        //         ocr_engine: ocrEngine,
        //         nlp_model: nlpModel
        //     });

        this.systemConfig = {
            systemName,
            systemDescription,
            defaultLanguage,
            timeZone,
            ocrEngine,
            nlpModel
        };

        // Update sidebar display
        document.getElementById('systemNameDisplay').textContent = systemName;

        Swal.fire({
            icon: 'success',
            title: 'Configuration Saved!',
            text: 'System configuration has been updated successfully.',
            confirmButtonColor: '#000000'
        });
    }

    saveAdminSettings() {
        const adminEmail = document.getElementById('adminEmail').value.trim();
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (!adminEmail) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Admin email is required',
                confirmButtonColor: '#D0021B'
            });
            return;
        }

        if (newPassword && newPassword !== confirmPassword) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Passwords do not match',
                confirmButtonColor: '#D0021B'
            });
            return;
        }

        // TODO: Save to Supabase
        // if (newPassword) {
        //     const { error } = await supabase.auth.updateUser({
        //         password: newPassword
        //     });
        // }

        Swal.fire({
            icon: 'success',
            title: 'Settings Saved!',
            text: 'Admin settings have been updated successfully.',
            confirmButtonColor: '#000000'
        });

        // Clear password fields
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';
    }

    logout() {
        Swal.fire({
            title: 'Confirm Logout',
            text: 'Are you sure you want to logout?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#000000',
            cancelButtonColor: '#6C757D',
            confirmButtonText: 'Yes, logout'
        }).then((result) => {
            if (result.isConfirmed) {
                // TODO: Implement Supabase logout
                // await supabase.auth.signOut();
                window.location.href = '/login/HTML_Files/login.html';
            }
        });
    }
}

// Initialize App
window.superAdminApp = new SuperAdminApp();
document.addEventListener('DOMContentLoaded', () => {
    window.superAdminApp.init();
});