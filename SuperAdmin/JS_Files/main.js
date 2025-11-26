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
                <td>
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <img src="${org.logo || 'https://via.placeholder.com/40x40?text=No+Logo'}" 
                             alt="${org.name}" 
                             style="width: 40px; height: 40px; object-fit: contain; border-radius: 4px; border: 1px solid #DEE2E6;">
                        <strong>${org.name}</strong>
                    </div>
                </td>
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
                            <td>
                                <div style="display: flex; align-items: center; gap: 12px;">
                                    <img src="${org.logo || 'https://via.placeholder.com/32x32?text=No+Logo'}" 
                                         alt="${org.name}" 
                                         style="width: 32px; height: 32px; object-fit: contain; border-radius: 4px; border: 1px solid #DEE2E6;">
                                    <strong>${org.name}</strong>
                                </div>
                            </td>
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
                        <label style="display: block; margin-bottom: 8px; font-weight: 600;">Organization Logo:</label>
                        <div style="text-align: center; margin-bottom: 12px;">
                            <img id="logoPreview" src="https://via.placeholder.com/150x150?text=No+Logo" 
                                 style="width: 150px; height: 150px; object-fit: contain; border: 2px solid #DEE2E6; border-radius: 8px; margin-bottom: 12px;">
                        </div>
                        <input type="file" id="orgLogo" accept="image/png,image/jpeg,image/jpg" 
                               style="display: none;">
                        <button type="button" onclick="document.getElementById('orgLogo').click()" 
                                style="padding: 8px 16px; background-color: #4A90E2; color: white; border: none; border-radius: 6px; cursor: pointer; width: 90%;">
                            <i class="fas fa-upload"></i> Upload Logo
                        </button>
                        <small style="display: block; margin-top: 8px; color: #6C757D; font-size: 12px;">Recommended: 200x200px, PNG or JPG, Max 2MB</small>
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
            didOpen: () => {
                const logoInput = document.getElementById('orgLogo');
                const logoPreview = document.getElementById('logoPreview');
                
                logoInput.addEventListener('change', (e) => {
                    const file = e.target.files[0];
                    if (file) {
                        // Validate file
                        const maxSize = 2 * 1024 * 1024; // 2MB
                        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
                        
                        if (file.size > maxSize) {
                            Swal.showValidationMessage('Logo file size exceeds 2MB limit');
                            logoInput.value = '';
                            return;
                        }
                        
                        if (!allowedTypes.includes(file.type)) {
                            Swal.showValidationMessage('Only JPG and PNG files are allowed');
                            logoInput.value = '';
                            return;
                        }
                        
                        // Show preview
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            logoPreview.src = e.target.result;
                        };
                        reader.readAsDataURL(file);
                    }
                });
            },
            preConfirm: () => {
                const orgName = document.getElementById('orgName').value.trim();
                const orgIndustry = document.getElementById('orgIndustry').value;
                const orgEmail = document.getElementById('orgEmail').value.trim();
                const logoFile = document.getElementById('orgLogo').files[0];
                const logoPreview = document.getElementById('logoPreview').src;
                
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
                
                return { 
                    name: orgName, 
                    industry: orgIndustry, 
                    email: orgEmail,
                    logo: logoFile ? logoPreview : 'https://via.placeholder.com/150x150?text=No+Logo'
                };
            }
        });

        if (formValues) {
            // TODO: Replace with Supabase insert
            // Step 1: Upload logo to Supabase Storage
            // const logoFile = document.getElementById('orgLogo').files[0];
            // let logoUrl = null;
            // if (logoFile) {
            //     const fileExt = logoFile.name.split('.').pop();
            //     const fileName = `org-${Date.now()}.${fileExt}`;
            //     const { data: uploadData, error: uploadError } = await supabase.storage
            //         .from('organization-logos')
            //         .upload(fileName, logoFile);
            //     
            //     if (!uploadError) {
            //         const { data: { publicUrl } } = supabase.storage
            //             .from('organization-logos')
            //             .getPublicUrl(fileName);
            //         logoUrl = publicUrl;
            //     }
            // }
            //
            // Step 2: Insert organization with logo URL
            // const { data, error } = await supabase
            //     .from('organizations')
            //     .insert({
            //         name: formValues.name,
            //         industry: formValues.industry,
            //         admin_email: formValues.email,
            //         logo_url: logoUrl,
            //         status: 'active'
            //     });

            const newOrg = {
                id: this.organizations.length + 1,
                name: formValues.name,
                industry: formValues.industry,
                users: 0,
                status: 'active',
                logo: formValues.logo,
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
                    
                    <div style="margin-bottom: 16px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600;">Organization Logo:</label>
                        <div style="text-align: center; margin-bottom: 12px;">
                            <img id="logoPreview" src="${org.logo || 'https://via.placeholder.com/150x150?text=No+Logo'}" 
                                 style="width: 150px; height: 150px; object-fit: contain; border: 2px solid #DEE2E6; border-radius: 8px; margin-bottom: 12px;">
                        </div>
                        <input type="file" id="orgLogo" accept="image/png,image/jpeg,image/jpg" 
                               style="display: none;">
                        <button type="button" onclick="document.getElementById('orgLogo').click()" 
                                style="padding: 8px 16px; background-color: #4A90E2; color: white; border: none; border-radius: 6px; cursor: pointer; width: 90%; margin-bottom: 8px;">
                            <i class="fas fa-upload"></i> Change Logo
                        </button>
                        <button type="button" id="removeLogo" 
                                style="padding: 8px 16px; background-color: #D0021B; color: white; border: none; border-radius: 6px; cursor: pointer; width: 90%;">
                            <i class="fas fa-trash"></i> Remove Logo
                        </button>
                        <small style="display: block; margin-top: 8px; color: #6C757D; font-size: 12px;">Recommended: 200x200px, PNG or JPG, Max 2MB</small>
                    </div>
                </div>
            `,
            width: 600,
            showCancelButton: true,
            confirmButtonColor: '#000000',
            confirmButtonText: 'Save Changes',
            didOpen: () => {
                const logoInput = document.getElementById('orgLogo');
                const logoPreview = document.getElementById('logoPreview');
                const removeLogoBtn = document.getElementById('removeLogo');
                
                logoInput.addEventListener('change', (e) => {
                    const file = e.target.files[0];
                    if (file) {
                        // Validate file
                        const maxSize = 2 * 1024 * 1024; // 2MB
                        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
                        
                        if (file.size > maxSize) {
                            Swal.showValidationMessage('Logo file size exceeds 2MB limit');
                            logoInput.value = '';
                            return;
                        }
                        
                        if (!allowedTypes.includes(file.type)) {
                            Swal.showValidationMessage('Only JPG and PNG files are allowed');
                            logoInput.value = '';
                            return;
                        }
                        
                        // Show preview
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            logoPreview.src = e.target.result;
                        };
                        reader.readAsDataURL(file);
                    }
                });
                
                removeLogoBtn.addEventListener('click', () => {
                    logoPreview.src = 'https://via.placeholder.com/150x150?text=No+Logo';
                    logoInput.value = '';
                });
            },
            preConfirm: () => {
                const logoPreview = document.getElementById('logoPreview').src;
                return {
                    name: document.getElementById('orgName').value.trim(),
                    industry: document.getElementById('orgIndustry').value,
                    logo: logoPreview
                };
            }
        });

        if (formValues) {
            // TODO: Update in Supabase
            // Step 1: If logo changed, upload to Supabase Storage
            // const logoFile = document.getElementById('orgLogo').files[0];
            // if (logoFile) {
            //     const fileExt = logoFile.name.split('.').pop();
            //     const fileName = `org-${id}-${Date.now()}.${fileExt}`;
            //     const { data: uploadData, error: uploadError } = await supabase.storage
            //         .from('organization-logos')
            //         .upload(fileName, logoFile, { upsert: true });
            //     
            //     if (!uploadError) {
            //         const { data: { publicUrl } } = supabase.storage
            //             .from('organization-logos')
            //             .getPublicUrl(fileName);
            //         formValues.logo = publicUrl;
            //     }
            // }
            //
            // Step 2: Update organization
            // const { data, error } = await supabase
            //     .from('organizations')
            //     .update({
            //         name: formValues.name,
            //         industry: formValues.industry,
            //         logo_url: formValues.logo
            //     })
            //     .eq('id', id);

            org.name = formValues.name;
            org.industry = formValues.industry;
            org.logo = formValues.logo;
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
