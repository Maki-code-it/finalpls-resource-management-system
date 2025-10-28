// ============================================
// UTILITY FUNCTIONS MODULE
// ============================================

/**
 * Debounce function to limit execution rate
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
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

/**
 * Format date to readable string
 * @param {string} dateString - Date string to format
 * @returns {string} Formatted date
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

/**
 * Capitalize first letter of string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Format status text
 * @param {string} status - Status string
 * @returns {string} Formatted status
 */
function formatStatus(status) {
    return status.split('-').map(word => capitalize(word)).join(' ');
}

/**
 * Calculate days until deadline
 * @param {string} deadline - Deadline date string
 * @returns {number} Days remaining
 */
function daysUntilDeadline(deadline) {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

/**
 * Get priority color
 * @param {string} priority - Priority level
 * @returns {string} Color code
 */
function getPriorityColor(priority) {
    const colors = {
        high: '#D0021B',
        medium: '#F5A623',
        low: '#4A90E2'
    };
    return colors[priority] || '#6C757D';
}

/**
 * Get status color
 * @param {string} status - Status
 * @returns {string} Color code
 */
function getStatusColor(status) {
    const colors = {
        active: '#7ED321',
        planning: '#4A90E2',
        'on-hold': '#F5A623',
        completed: '#6C757D',
        pending: '#F5A623',
        approved: '#7ED321',
        rejected: '#D0021B'
    };
    return colors[status] || '#6C757D';
}

/**
 * Calculate match score between required and available skills
 * @param {Array} requiredSkills - Required skills
 * @param {Array} availableSkills - Available skills
 * @returns {number} Match percentage
 */
function calculateSkillMatch(requiredSkills, availableSkills) {
    if (!requiredSkills || requiredSkills.length === 0) return 0;
    
    const required = requiredSkills.map(s => s.toLowerCase());
    const available = availableSkills.map(s => s.toLowerCase());
    
    const matches = required.filter(skill => 
        available.some(availSkill => availSkill.includes(skill) || skill.includes(availSkill))
    );
    
    return Math.round((matches.length / required.length) * 100);
}

/**
 * Validate form data
 * @param {Object} formData - Form data to validate
 * @returns {Object} Validation result
 */
function validateRequestForm(formData) {
    const errors = [];
    
    if (!formData.project) errors.push('Project is required');
    if (!formData.position) errors.push('Position is required');
    if (!formData.quantity || formData.quantity < 1) errors.push('Valid quantity is required');
    if (!formData.skills) errors.push('Skills are required');
    if (!formData.startDate) errors.push('Start date is required');
    
    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

/**
 * Generate unique ID
 * @returns {string} Unique ID
 */
function generateId() {
    return 'ID-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}