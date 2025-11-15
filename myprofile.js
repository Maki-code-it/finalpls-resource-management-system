// ============================================
// IMPORT SUPABASE CLIENT
// ============================================
import { supabase } from '../../supabaseClient.js';

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
// DATA SERVICE - Supabase Integration
// ============================================
class ProfileDataService {
    constructor() {
        this.supabase = supabase;
        
        // Get current user from localStorage (same as dashboard.js)
        const userData = JSON.parse(localStorage.getItem('loggedUser') || '{}');
        this.currentUserId = userData.id; // This is the users.id
        this.currentUserName = userData.name || 'User';
        this.currentUserEmail = userData.email || 'user@company.com';
        
        console.log('Current User Data:', { 
            id: this.currentUserId, 
            name: this.currentUserName,
            email: this.currentUserEmail 
        });
        
        if (!this.currentUserId) {
            console.error('No user ID found in localStorage!');
            window.location.href = '/login/HTML_Files/login.html';
        }
    }

    // Employee Profile Methods
    async getEmployeeProfile() {
        try {
            // Fetch user data with user_details
            const { data: userData, error: userError } = await this.supabase
                .from('users')
                .select(`
                    *,
                    user_details (*)
                `)
                .eq('id', this.currentUserId)
                .single();

            if (userError) throw userError;

            if (!userData) {
                throw new Error('User not found');
            }

            const details = userData.user_details?.[0] || {};

            // Format the profile data
            const profile = {
                id: details.employee_id || `EMP${userData.id}`,
                userId: userData.id,
                name: userData.name,
                role: details.job_title || 'Employee',
                department: details.department || 'Not Assigned',
                email: userData.email,
                joinDate: details.join_date ? this.formatDate(details.join_date) : 'N/A',
                experience: this.getExperienceLabel(details.experience_level),
                avatar: (details.profile_pic && details.profile_pic.trim() !== '') 
                    ? details.profile_pic 
                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=4A90E2&color=fff`,
                skills: this.formatSkills(details.skills),
                location: details.location || 'Not specified',
                phone: details.phone_number || 'Not provided',
                status: details.status || 'Available',
                uploadedFiles: []
            };

            // Fetch uploaded files
            const { data: files, error: filesError } = await this.supabase
                .from('employee_files')
                .select('*')
                .eq('employee_id', details.employee_id || `EMP${userData.id}`)
                .order('uploaded_at', { ascending: false });

            if (!filesError && files) {
                profile.uploadedFiles = files.map(f => ({
                    name: f.filename,
                    size: 'N/A',
                    uploadDate: f.uploaded_at
                }));
            }

            return profile;
        } catch (error) {
            console.error('Error fetching profile:', error);
            throw error;
        }
    }

    async updateEmployeeProfile(profileData) {
        try {
            const { data, error } = await this.supabase
                .from('user_details')
                .update({
                    job_title: profileData.role,
                    department: profileData.department,
                    phone_number: profileData.phone,
                    location: profileData.location,
                    status: profileData.status
                })
                .eq('user_id', this.currentUserId);

            if (error) throw error;

            console.log('Profile updated successfully');
            return { success: true };
        } catch (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
    }

    async uploadProfilePicture(file) {
        try {
            const { data: userDetails, error: detailsError } = await this.supabase
                .from('user_details')
                .select('employee_id')
                .eq('user_id', this.currentUserId)
                .single();

            if (detailsError) throw detailsError;

            const employeeId = userDetails.employee_id || `EMP${this.currentUserId}`;

            // Upload file to Supabase Storage
            const fileExt = file.name.split('.').pop();
            const fileName = `${employeeId}-${Date.now()}.${fileExt}`;
            
            const { data: uploadData, error: uploadError } = await this.supabase.storage
                .from('profile-pictures')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: true
                });

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: { publicUrl } } = this.supabase.storage
                .from('profile-pictures')
                .getPublicUrl(fileName);

            // Update user_details table with new profile_pic URL
            const { error: updateError } = await this.supabase
                .from('user_details')
                .update({ profile_pic: publicUrl })
                .eq('user_id', this.currentUserId);

            if (updateError) throw updateError;

            return { success: true, url: publicUrl };
        } catch (error) {
            console.error('Error uploading profile picture:', error);
            throw error;
        }
    }

    async uploadCV(file) {
        try {
            const { data: userDetails, error: detailsError } = await this.supabase
                .from('user_details')
                .select('employee_id')
                .eq('user_id', this.currentUserId)
                .single();

            if (detailsError) throw detailsError;

            const employeeId = userDetails.employee_id || `EMP${this.currentUserId}`;

            // Upload file to Supabase Storage
            const fileName = `${employeeId}/${Date.now()}-${file.name}`;
            
            const { data: uploadData, error: uploadError } = await this.supabase.storage
                .from('cvs')
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            // Insert record into employee_files table
            const { data: fileRecord, error: recordError } = await this.supabase
                .from('employee_files')
                .insert({
                    employee_id: employeeId,
                    filename: file.name
                })
                .select()
                .single();

            if (recordError) throw recordError;

            // Simulate skill extraction (integrate with OCR service later)
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const mockSkills = ['Python', 'JavaScript', 'React', 'Node.js', 'SQL', 'Docker'];

            return { 
                success: true, 
                fileName: file.name, 
                fileSize: this.formatFileSize(file.size),
                uploadDate: new Date().toISOString().split('T')[0],
                skills: mockSkills
            };
        } catch (error) {
            console.error('Error uploading CV:', error);
            throw error;
        }
    }

    async deleteCV(fileName) {
        try {
            const { data: userDetails, error: detailsError } = await this.supabase
                .from('user_details')
                .select('employee_id')
                .eq('user_id', this.currentUserId)
                .single();

            if (detailsError) throw detailsError;

            const employeeId = userDetails.employee_id || `EMP${this.currentUserId}`;

            // Delete from employee_files table
            const { error: deleteError } = await this.supabase
                .from('employee_files')
                .delete()
                .eq('employee_id', employeeId)
                .eq('filename', fileName);

            if (deleteError) throw deleteError;

            // Delete from storage
            const { error: storageError } = await this.supabase.storage
                .from('cvs')
                .remove([`${employeeId}/${fileName}`]);

            if (storageError) console.warn('Storage delete warning:', storageError);

            return { success: true };
        } catch (error) {
            console.error('Error deleting CV:', error);
            throw error;
        }
    }

    async addSkill(skillData) {
        try {
            const { data: userDetails, error: fetchError } = await this.supabase
                .from('user_details')
                .select('skills')
                .eq('user_id', this.currentUserId)
                .single();

            if (fetchError) throw fetchError;

            const currentSkills = userDetails.skills || [];
            const newSkill = `${skillData.name}:${skillData.level}`;
            
            if (!currentSkills.includes(newSkill)) {
                currentSkills.push(newSkill);
            }

            const { error: updateError } = await this.supabase
                .from('user_details')
                .update({ skills: currentSkills })
                .eq('user_id', this.currentUserId);

            if (updateError) throw updateError;

            return { success: true };
        } catch (error) {
            console.error('Error adding skill:', error);
            throw error;
        }
    }

    async removeSkill(skillName) {
        try {
            const { data: userDetails, error: fetchError } = await this.supabase
                .from('user_details')
                .select('skills')
                .eq('user_id', this.currentUserId)
                .single();

            if (fetchError) throw fetchError;

            const currentSkills = userDetails.skills || [];
            const updatedSkills = currentSkills.filter(skill => 
                !skill.toLowerCase().startsWith(skillName.toLowerCase() + ':')
            );

            const { error: updateError } = await this.supabase
                .from('user_details')
                .update({ skills: updatedSkills })
                .eq('user_id', this.currentUserId);

            if (updateError) throw updateError;

            return { success: true };
        } catch (error) {
            console.error('Error removing skill:', error);
            throw error;
        }
    }

    async updateExperience(experienceData) {
        try {
            const experienceLevel = this.getExperienceLevel(experienceData.experience);

            const { error } = await this.supabase
                .from('user_details')
                .update({ 
                    experience_level: experienceLevel,
                    job_title: experienceData.role 
                })
                .eq('user_id', this.currentUserId);

            if (error) throw error;

            return { success: true };
        } catch (error) {
            console.error('Error updating experience:', error);
            throw error;
        }
    }

    // Helper Methods
    formatSkills(skillsArray) {
        if (!skillsArray || skillsArray.length === 0) {
            return [];
        }

        return skillsArray.map(skill => {
            const [name, level] = skill.split(':');
            return {
                name: name || skill,
                level: level || 'Intermediate'
            };
        });
    }

    getExperienceLabel(experienceLevel) {
        const mapping = {
            'beginner': '0-2 years',
            'intermediate': '3-5 years',
            'advanced': '5+ years'
        };
        return mapping[experienceLevel] || 'Not specified';
    }

    getExperienceLevel(experienceText) {
        const years = parseInt(experienceText);
        if (isNaN(years)) {
            if (experienceText.includes('0-2') || experienceText.includes('beginner')) return 'beginner';
            if (experienceText.includes('3-5') || experienceText.includes('intermediate')) return 'intermediate';
            return 'advanced';
        }
        if (years <= 2) return 'beginner';
        if (years <= 5) return 'intermediate';
        return 'advanced';
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }
}

// ============================================
// UI MANAGER CLASS
// ============================================
class ProfileUIManager {
    constructor() {
        this.currentProfile = null;
    }

    showLoading(message = 'Loading...') {
        Swal.fire({
            title: message,
            allowOutsideClick: false,
            allowEscapeKey: false,
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
            confirmButtonColor: '#000000',
            timer: 2000,
            showConfirmButton: true
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

    updateHeaderInfo(profile) {
        const headerName = document.getElementById('headerName');
        const headerAvatar = document.getElementById('headerAvatar');
        
        if (headerName) headerName.textContent = profile.name;
        if (headerAvatar) headerAvatar.src = profile.avatar;
    }

    updateAllAvatars(avatarUrl) {
        const profileAvatar = document.getElementById('profileAvatar');
        const headerAvatar = document.getElementById('headerAvatar');
        
        if (profileAvatar) profileAvatar.src = avatarUrl;
        if (headerAvatar) headerAvatar.src = avatarUrl;
    }

    renderProfile(profile) {
        this.currentProfile = profile;
        
        const profileName = document.getElementById('profileName');
        const profileRole = document.getElementById('profileRole');
        const profileId = document.getElementById('profileId');
        const profileDept = document.getElementById('profileDept');
        const profileEmail = document.getElementById('profileEmail');
        const profileAvatar = document.getElementById('profileAvatar');
        const totalExperience = document.getElementById('totalExperience');
        const currentPosition = document.getElementById('currentPosition');
        const joinDate = document.getElementById('joinDate');

        if (profileName) profileName.textContent = profile.name;
        if (profileRole) profileRole.textContent = profile.role;
        if (profileId) profileId.textContent = profile.id;
        if (profileDept) profileDept.textContent = profile.department;
        if (profileEmail) profileEmail.textContent = profile.email;
        if (profileAvatar) profileAvatar.src = profile.avatar;
        if (totalExperience) totalExperience.textContent = profile.experience;
        if (currentPosition) currentPosition.textContent = profile.role;
        if (joinDate) joinDate.textContent = profile.joinDate;

        this.renderSkills(profile.skills);
        this.renderUploadedFiles(profile.uploadedFiles);
    }

    renderSkills(skills) {
        const container = document.getElementById('skillsGrid');
        
        if (!container) return;

        if (skills.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1;">
                    <i class="fas fa-code"></i>
                    <p>No skills added yet. Click "Add Skill" to get started!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = skills.map(skill => `
            <div class="skill-item">
                <div class="skill-info">
                    <h4>${this.escapeHtml(skill.name)}</h4>
                    <p class="skill-level">${this.escapeHtml(skill.level)}</p>
                </div>
                <button class="skill-remove" onclick="profileApp.removeSkill('${this.escapeHtml(skill.name)}')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
    }

    renderUploadedFiles(files) {
        const container = document.getElementById('uploadedFilesList');
        
        if (!container) return;

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
                        <h4>${this.escapeHtml(file.name)}</h4>
                        <p>${this.escapeHtml(file.size)} • Uploaded ${this.formatDate(file.uploadDate)}</p>
                    </div>
                </div>
                <div class="file-actions">
                    <button class="icon-btn" onclick="profileApp.viewFile('${this.escapeHtml(file.name)}')" title="View">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="icon-btn" onclick="profileApp.deleteFile('${this.escapeHtml(file.name)}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }

    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }
}

// ============================================
// MAIN PROFILE APPLICATION CLASS
// ============================================
class ProfileApp {
    constructor() {
        this.dataService = new ProfileDataService();
        this.uiManager = new ProfileUIManager();
        this.currentProfile = null;
    }

    async init() {
        try {
            await this.loadProfile();
            this.setupEventListeners();
        } catch (error) {
            console.error('Error initializing profile app:', error);
            this.uiManager.showError('Failed to initialize profile');
        }
    }

    setupEventListeners() {
        this.setupProfilePictureEvents();
        this.setupCVUploadEvents();
        this.setupSkillEvents();
        this.setupExperienceEvents();
        this.setupProfileUpdateEvents();
        this.setupLogoutEvent();
    }

    setupProfilePictureEvents() {
        const changeAvatarBtn = document.getElementById('changeAvatarBtn');
        
        if (changeAvatarBtn) {
            changeAvatarBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.changeProfilePicture();
            });
        }
    }

    async changeProfilePicture() {
        let selectedFile = null;
        
        const result = await Swal.fire({
            title: 'Upload Profile Picture',
            html: `
                <div style="text-align: center; padding: 20px;">
                    <div style="margin-bottom: 20px;">
                        <img id="previewImage" src="${this.currentProfile.avatar}" 
                             style="width: 150px; height: 150px; border-radius: 50%; object-fit: cover; border: 3px solid #000;">
                    </div>
                    <input type="file" id="avatarFileInput" accept="image/jpeg,image/png,image/jpg" 
                           style="display: none;">
                    <button type="button" class="primary-btn" id="choosePhotoBtn"
                            style="display: inline-flex; margin: 0 auto;">
                        <i class="fas fa-upload"></i> Choose Photo
                    </button>
                    <p id="selectedFileName" style="font-size: 13px; color: #4A90E2; margin-top: 8px; min-height: 20px;"></p>
                    <p style="font-size: 12px; color: #6C757D; margin-top: 4px;">
                        Supported formats: JPG, PNG (Max 2MB)
                    </p>
                </div>
            `,
            width: 500,
            showCancelButton: true,
            confirmButtonColor: '#000000',
            cancelButtonColor: '#6C757D',
            confirmButtonText: 'Upload',
            cancelButtonText: 'Cancel',
            didOpen: () => {
                const fileInput = document.getElementById('avatarFileInput');
                const previewImage = document.getElementById('previewImage');
                const choosePhotoBtn = document.getElementById('choosePhotoBtn');
                const selectedFileName = document.getElementById('selectedFileName');
                
                choosePhotoBtn.addEventListener('click', () => {
                    fileInput.click();
                });
                
                fileInput.addEventListener('change', (e) => {
                    const file = e.target.files[0];
                    if (file) {
                        const maxSize = 2 * 1024 * 1024;
                        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
                        
                        if (file.size > maxSize) {
                            Swal.showValidationMessage('File size exceeds 2MB limit');
                            selectedFile = null;
                            return;
                        }
                        
                        if (!allowedTypes.includes(file.type)) {
                            Swal.showValidationMessage('Only JPG and PNG files are allowed');
                            selectedFile = null;
                            return;
                        }
                        
                        selectedFile = file;
                        selectedFileName.textContent = `Selected: ${file.name}`;
                        
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            previewImage.src = e.target.result;
                        };
                        reader.readAsDataURL(file);
                    }
                });
            },
            preConfirm: () => {
                if (!selectedFile) {
                    Swal.showValidationMessage('Please select a photo');
                    return false;
                }
                return selectedFile;
            }
        });

        if (result.isConfirmed && result.value) {
            try {
                this.uiManager.showLoading('Uploading profile picture...');
                const uploadResult = await this.dataService.uploadProfilePicture(result.value);
                
                if (uploadResult.success) {
                    this.currentProfile.avatar = uploadResult.url;
                    this.uiManager.updateAllAvatars(uploadResult.url);
                    this.uiManager.updateHeaderInfo(this.currentProfile);
                    
                    this.uiManager.hideLoading();
                    this.uiManager.showSuccess('Profile picture updated successfully!');
                }
            } catch (error) {
                this.uiManager.hideLoading();
                console.error('Error uploading profile picture:', error);
                this.uiManager.showError('Failed to upload profile picture. Please try again.');
            }
        }
    }

    setupCVUploadEvents() {
        const cvUploadArea = document.getElementById('cvUploadArea');
        const cvFileInput = document.getElementById('cvFileInput');
        const browseBtn = document.getElementById('browseBtn');

        if (cvUploadArea && cvFileInput) {
            cvUploadArea.addEventListener('click', (e) => {
                if (e.target !== browseBtn && !browseBtn.contains(e.target)) {
                    cvFileInput.click();
                }
            });

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
                if (files.length > 0) {
                    this.handleCVUpload(files[0]);
                }
            });

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
    }

    setupSkillEvents() {
        const addSkillBtn = document.getElementById('addSkillBtn');
        if (addSkillBtn) {
            addSkillBtn.addEventListener('click', () => this.addSkill());
        }
    }

    setupExperienceEvents() {
        const editExpBtn = document.getElementById('editExperienceBtn');
        if (editExpBtn) {
            editExpBtn.addEventListener('click', () => this.editExperience());
        }
    }

    setupProfileUpdateEvents() {
        const updateBtn = document.getElementById('updateProfileBtn');
        if (updateBtn) {
            updateBtn.addEventListener('click', () => this.updateProfile());
        }
    }

    setupLogoutEvent() {
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }
    }

    async loadProfile() {
        try {
            this.uiManager.showLoading('Loading profile...');
            this.currentProfile = await this.dataService.getEmployeeProfile();
            this.uiManager.renderProfile(this.currentProfile);
            this.uiManager.updateHeaderInfo(this.currentProfile);
            this.uiManager.hideLoading();
        } catch (error) {
            this.uiManager.hideLoading();
            console.error('Error loading profile:', error);
            this.uiManager.showError('Failed to load profile');
        }
    }

    async handleCVUpload(file) {
        const maxSize = 5 * 1024 * 1024;
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
            this.uiManager.showLoading('Processing CV with OCR and NLP...');
            const result = await this.dataService.uploadCV(file);
            this.uiManager.hideLoading();
            
            if (result.success) {
                this.currentProfile.uploadedFiles.push({
                    name: result.fileName,
                    size: result.fileSize,
                    uploadDate: result.uploadDate
                });

                await Swal.fire({
                    icon: 'success',
                    title: 'CV Uploaded Successfully!',
                    html: `
                        <div style="text-align: left; padding: 20px;">
                            <p style="margin-bottom: 16px;">Your CV has been processed using OCR and NLP technology.</p>
                            <p style="font-weight: 600; margin-bottom: 12px;">Extracted Skills:</p>
                            <div class="extracted-skills-container">
                                ${result.skills.map(skill => `
                                    <span class="extracted-skill">${this.uiManager.escapeHtml(skill)}</span>
                                `).join('')}
                            </div>
                            <p style="margin-top: 16px; font-size: 13px; color: #6C757D;">
                                These skills have been automatically detected. You can add them to your profile or manage them manually.
                            </p>
                        </div>
                    `,
                    width: 600,
                    confirmButtonColor: '#000000',
                    confirmButtonText: 'Great!',
                    showCancelButton: true,
                    cancelButtonText: 'Add Skills to Profile',
                    cancelButtonColor: '#4A90E2'
                }).then(async (swalResult) => {
                    if (swalResult.isDismissed) {
                        await this.addExtractedSkills(result.skills);
                    }
                });
                
                this.uiManager.renderUploadedFiles(this.currentProfile.uploadedFiles);
                
                const cvFileInput = document.getElementById('cvFileInput');
                if (cvFileInput) cvFileInput.value = '';
            }
        } catch (error) {
            this.uiManager.hideLoading();
            console.error('Error uploading CV:', error);
            this.uiManager.showError('Failed to upload CV. Please try again.');
        }
    }

    async addExtractedSkills(skills) {
        try {
            this.uiManager.showLoading('Adding skills to your profile...');
            
            const existingSkillNames = this.currentProfile.skills.map(s => s.name.toLowerCase());
            const newSkills = skills.filter(skill => 
                !existingSkillNames.includes(skill.toLowerCase())
            );

            for (const skillName of newSkills) {
                const skillData = { name: skillName, level: 'Intermediate' };
                await this.dataService.addSkill(skillData);
                this.currentProfile.skills.push(skillData);
            }

            this.uiManager.hideLoading();
            
            if (newSkills.length > 0) {
                this.uiManager.renderSkills(this.currentProfile.skills);
                this.uiManager.showSuccess(`${newSkills.length} skill(s) added to your profile!`);
            } else {
                this.uiManager.showSuccess('All extracted skills already exist in your profile.');
            }
        } catch (error) {
            this.uiManager.hideLoading();
            console.error('Error adding extracted skills:', error);
            this.uiManager.showError('Failed to add skills to profile');
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
                        <option value="Intermediate" selected>Intermediate</option>
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
                const skillName = document.getElementById('skillName').value.trim();
                const skillLevel = document.getElementById('skillLevel').value;
                
                if (!skillName) {
                    Swal.showValidationMessage('Please enter a skill name');
                    return false;
                }

                const existingSkill = profileApp.currentProfile.skills.find(
                    s => s.name.toLowerCase() === skillName.toLowerCase()
                );
                
                if (existingSkill) {
                    Swal.showValidationMessage('This skill already exists in your profile');
                    return false;
                }
                
                return { name: skillName, level: skillLevel };
            }
        });

        if (formValues) {
            try {
                await this.dataService.addSkill(formValues);
                this.currentProfile.skills.push(formValues);
                this.uiManager.renderSkills(this.currentProfile.skills);
                this.uiManager.showSuccess(`${formValues.name} has been added to your skills`);
            } catch (error) {
                console.error('Error adding skill:', error);
                this.uiManager.showError('Failed to add skill');
            }
        }
    }

    async removeSkill(skillName) {
        const confirmed = await this.uiManager.showConfirmation(
            'Remove Skill',
            `Are you sure you want to remove "${skillName}" from your skills?`
        );

        if (confirmed) {
            try {
                await this.dataService.removeSkill(skillName);
                this.currentProfile.skills = this.currentProfile.skills.filter(
                    s => s.name !== skillName
                );
                this.uiManager.renderSkills(this.currentProfile.skills);
                this.uiManager.showSuccess(`${skillName} has been removed from your skills`);
            } catch (error) {
                console.error('Error removing skill:', error);
                this.uiManager.showError('Failed to remove skill');
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
                const totalExp = document.getElementById('totalExp').value.trim();
                const currentPos = document.getElementById('currentPos').value.trim();
                
                if (!totalExp || !currentPos) {
                    Swal.showValidationMessage('Please fill in all fields');
                    return false;
                }
                
                return {
                    experience: totalExp,
                    role: currentPos
                };
            }
        });

        if (formValues) {
            try {
                await this.dataService.updateExperience(formValues);
                this.currentProfile.experience = formValues.experience;
                this.currentProfile.role = formValues.role;
                
                const totalExperience = document.getElementById('totalExperience');
                const currentPosition = document.getElementById('currentPosition');
                const profileRole = document.getElementById('profileRole');
                
                if (totalExperience) totalExperience.textContent = formValues.experience;
                if (currentPosition) currentPosition.textContent = formValues.role;
                if (profileRole) profileRole.textContent = formValues.role;
                
                this.uiManager.showSuccess('Experience updated successfully');
            } catch (error) {
                console.error('Error updating experience:', error);
                this.uiManager.showError('Failed to update experience');
            }
        }
    }

    async updateProfile() {
        const confirmed = await this.uiManager.showConfirmation(
            'Update Profile',
            'Are you sure you want to save all changes to your profile?'
        );

        if (confirmed) {
            try {
                this.uiManager.showLoading('Updating profile...');
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

    async viewFile(fileName) {
        await Swal.fire({
            title: fileName,
            html: `
                <div style="text-align: center; padding: 20px;">
                    <div class="file-preview-container">
                        <i class="fas fa-file-pdf file-preview-icon"></i>
                        <p class="file-preview-info">File preview will be available when integrated with backend storage.</p>
                    </div>
                    <p style="font-size: 13px; color: #6C757D; margin-top: 16px;">
                        You can download this file or view it in a new tab once the backend integration is complete.
                    </p>
                </div>
            `,
            width: 600,
            confirmButtonColor: '#000000',
            confirmButtonText: 'Close',
            showCancelButton: true,
            cancelButtonText: 'Download',
            cancelButtonColor: '#4A90E2'
        }).then((result) => {
            if (result.isDismissed) {
                this.uiManager.showSuccess('Download functionality will be available soon');
            }
        });
    }

    async deleteFile(fileName) {
        const confirmed = await this.uiManager.showConfirmation(
            'Delete File',
            `Are you sure you want to delete "${fileName}"? This action cannot be undone.`
        );

        if (confirmed) {
            try {
                this.uiManager.showLoading('Deleting file...');
                await this.dataService.deleteCV(fileName);
                this.currentProfile.uploadedFiles = this.currentProfile.uploadedFiles.filter(
                    f => f.name !== fileName
                );
                this.uiManager.hideLoading();
                this.uiManager.renderUploadedFiles(this.currentProfile.uploadedFiles);
                this.uiManager.showSuccess('File deleted successfully');
            } catch (error) {
                this.uiManager.hideLoading();
                console.error('Error deleting file:', error);
                this.uiManager.showError('Failed to delete file');
            }
        }
    }

    async logout() {
        const confirmed = await this.uiManager.showConfirmation(
            'Confirm Logout',
            'Are you sure you want to logout?'
        );

        if (confirmed) {
            this.uiManager.showLoading('Logging out...');
            
            // Clear localStorage
            localStorage.removeItem('userData');
            
            // Sign out from Supabase
            await this.dataService.supabase.auth.signOut();
            
            setTimeout(() => {
                window.location.href = "/login/HTML_Files/login.html";
            }, 1000);
        }
    }
}

// ============================================
// INITIALIZE APPLICATION
// ============================================
let profileApp;

window.profileApp = null;

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded - Initializing Profile App...');
    profileApp = new ProfileApp();
    window.profileApp = profileApp;
    profileApp.init();
    console.log('Profile App initialized:', window.profileApp);
});