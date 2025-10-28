// ============================================
// DATA SERVICE MODULE - Ready for Supabase
// ============================================

class PMDataService {
    constructor() {
        // TODO: Initialize Supabase client
        // this.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        this.currentPMId = 'PM001'; // Mock current user
    }

    // Project Methods
    async getProjects() {
        // TODO: Replace with Supabase query
        // const { data, error } = await this.supabase.from('projects').select('*').eq('manager_id', this.currentPMId);
        return this.getMockProjects();
    }

    async getProjectById(id) {
        // TODO: Replace with Supabase query
        const projects = await this.getProjects();
        return projects.find(p => p.id === id);
    }

    async createProject(projectData) {
        // TODO: Replace with Supabase insert
        // const { data, error } = await this.supabase.from('projects').insert(projectData);
        console.log('Project created:', projectData);
        return { success: true, id: generateId() };
    }

    async updateProject(id, projectData) {
        // TODO: Replace with Supabase update
        // const { data, error } = await this.supabase.from('projects').update(projectData).eq('id', id);
        console.log('Project updated:', id, projectData);
        return { success: true };
    }

    // Team Methods
    async getTeamMembers(projectId = null) {
        // TODO: Replace with Supabase query
        // const { data, error } = await this.supabase.from('project_assignments').select('*, employees(*)').eq('project_id', projectId);
        return this.getMockTeamMembers();
    }

    // Resource Methods
    async searchResources(query, filters = {}) {
        // TODO: Replace with Supabase query
        // const { data, error } = await this.supabase.from('employees').select('*').ilike('name', `%${query}%`);
        const resources = this.getMockResources();
        return resources.filter(r => {
            const matchesQuery = !query || 
                r.name.toLowerCase().includes(query.toLowerCase()) ||
                r.role.toLowerCase().includes(query.toLowerCase()) ||
                r.skills.some(s => s.toLowerCase().includes(query.toLowerCase()));
            
            const matchesSkill = !filters.skill || r.skills.includes(filters.skill);
            const matchesDept = !filters.department || r.department === filters.department;
            const matchesAvail = !filters.availability || r.availability === filters.availability;
            
            return matchesQuery && matchesSkill && matchesDept && matchesAvail;
        });
    }

    async getAIRecommendations(projectRequirements) {
        // TODO: Replace with AI recommendation API call
        // This would call your backend service that uses NLP/ML to recommend employees
        const resources = this.getMockResources();
        
        // Simple mock recommendation logic based on skill matching
        return resources.map(r => ({
            ...r,
            matchScore: calculateSkillMatch(projectRequirements.skills, r.skills),
            recommended: true
        })).filter(r => r.matchScore > 50).sort((a, b) => b.matchScore - a.matchScore);
    }

    // Request Methods
    async getRequests() {
        // TODO: Replace with Supabase query
        // const { data, error } = await this.supabase.from('resource_requests').select('*').eq('requester_id', this.currentPMId);
        return this.getMockRequests();
    }

    async submitRequest(requestData) {
        // TODO: Replace with Supabase insert
        // const { data, error } = await this.supabase.from('resource_requests').insert(requestData);
        console.log('Request submitted:', requestData);
        return { success: true, id: generateId() };
    }

    async cancelRequest(requestId) {
        // TODO: Replace with Supabase delete
        // const { data, error } = await this.supabase.from('resource_requests').delete().eq('id', requestId);
        console.log('Request cancelled:', requestId);
        return { success: true };
    }

    // Stats Methods
    async getDashboardStats() {
        // TODO: Replace with Supabase queries
        const projects = await this.getProjects();
        const requests = await this.getRequests();
        const team = await this.getTeamMembers();
        
        return {
            activeProjects: projects.filter(p => p.status === 'active').length,
            pendingRequests: requests.filter(r => r.status === 'pending').length,
            teamMembers: team.length,
            overdueProjects: projects.filter(p => {
                const deadline = new Date(p.deadline);
                return deadline < new Date() && p.status !== 'completed';
            }).length
        };
    }

    // Mock Data Methods
    getMockProjects() {
        return [
            {
                id: 'PROJ001',
                name: 'Customer Portal Redesign',
                description: 'Complete redesign of the customer portal with modern UI/UX',
                status: 'active',
                progress: 65,
                deadline: '2025-12-15',
                teamSize: 5,
                budget: '$50,000',
                priority: 'high'
            },
            {
                id: 'PROJ002',
                name: 'Mobile App Development',
                description: 'Native mobile application for iOS and Android platforms',
                status: 'planning',
                progress: 20,
                deadline: '2026-03-30',
                teamSize: 3,
                budget: '$80,000',
                priority: 'medium'
            },
            {
                id: 'PROJ003',
                name: 'API Integration',
                description: 'Integrate third-party APIs for payment and analytics',
                status: 'active',
                progress: 80,
                deadline: '2025-11-10',
                teamSize: 2,
                budget: '$25,000',
                priority: 'high'
            },
            {
                id: 'PROJ004',
                name: 'Database Migration',
                description: 'Migrate legacy database to cloud infrastructure',
                status: 'on-hold',
                progress: 35,
                deadline: '2026-01-20',
                teamSize: 4,
                budget: '$40,000',
                priority: 'medium'
            }
        ];
    }

    getMockTeamMembers() {
        return [
            {
                id: 'EMP001',
                name: 'John Doe',
                role: 'Senior Developer',
                avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=4A90E2&color=fff',
                project: 'Customer Portal'
            },
            {
                id: 'EMP002',
                name: 'Jane Smith',
                role: 'UI/UX Designer',
                avatar: 'https://ui-avatars.com/api/?name=Jane+Smith&background=7ED321&color=fff',
                project: 'Customer Portal'
            },
            {
                id: 'EMP003',
                name: 'Mike Johnson',
                role: 'Backend Developer',
                avatar: 'https://ui-avatars.com/api/?name=Mike+Johnson&background=F5A623&color=fff',
                project: 'API Integration'
            },
            {
                id: 'EMP005',
                name: 'David Brown',
                role: 'DevOps Engineer',
                avatar: 'https://ui-avatars.com/api/?name=David+Brown&background=D0021B&color=fff',
                project: 'Database Migration'
            }
        ];
    }

    getMockResources() {
        return [
            {
                id: 'EMP001',
                name: 'John Doe',
                role: 'Senior Developer',
                department: 'Engineering',
                skills: ['Python', 'JavaScript', 'React', 'Node.js'],
                availability: 'available',
                workloadHours: 3,
                experience: '5 years',
                avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=4A90E2&color=fff'
            },
            {
                id: 'EMP002',
                name: 'Jane Smith',
                role: 'UI/UX Designer',
                department: 'Design',
                skills: ['Figma', 'Adobe XD', 'Photoshop', 'UI Design'],
                availability: 'busy',
                workloadHours: 9,
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
                experience: '6 years',
                avatar: 'https://ui-avatars.com/api/?name=Mike+Johnson&background=F5A623&color=fff'
            },
            {
                id: 'EMP006',
                name: 'Emily Davis',
                role: 'Frontend Developer',
                department: 'Engineering',
                skills: ['Vue.js', 'CSS', 'HTML', 'TypeScript'],
                availability: 'available',
                workloadHours: 2,
                experience: '3 years',
                avatar: 'https://ui-avatars.com/api/?name=Emily+Davis&background=4A90E2&color=fff'
            },
            {
                id: 'EMP007',
                name: 'Robert Martinez',
                role: 'Backend Developer',
                department: 'Engineering',
                skills: ['Node.js', 'MongoDB', 'Express', 'GraphQL'],
                availability: 'available',
                workloadHours: 4,
                experience: '4 years',
                avatar: 'https://ui-avatars.com/api/?name=Robert+Martinez&background=7ED321&color=fff'
            },
            {
                id: 'EMP008',
                name: 'Lisa Anderson',
                role: 'QA Engineer',
                department: 'Quality Assurance',
                skills: ['Selenium', 'Jest', 'Automation', 'Testing'],
                availability: 'partial',
                workloadHours: 5,
                experience: '3 years',
                avatar: 'https://ui-avatars.com/api/?name=Lisa+Anderson&background=F5A623&color=fff'
            }
        ];
    }

    getMockRequests() {
        return [
            {
                id: 'REQ001',
                project: 'Customer Portal Redesign',
                position: 'Frontend Developer',
                quantity: 2,
                skills: ['React', 'TypeScript', 'CSS'],
                experience: 'Mid-level (3-5 years)',
                priority: 'high',
                startDate: '2025-11-15',
                duration: '6 months',
                status: 'pending',
                submittedDate: '2025-10-20'
            },
            {
                id: 'REQ002',
                project: 'Mobile App Development',
                position: 'Mobile Developer',
                quantity: 1,
                skills: ['React Native', 'Swift', 'Kotlin'],
                experience: 'Senior (5+ years)',
                priority: 'medium',
                startDate: '2025-12-01',
                duration: '8 months',
                status: 'approved',
                submittedDate: '2025-10-18'
            },
            {
                id: 'REQ003',
                project: 'API Integration',
                position: 'Backend Developer',
                quantity: 1,
                skills: ['Node.js', 'REST API', 'PostgreSQL'],
                experience: 'Mid-level (3-5 years)',
                priority: 'high',
                startDate: '2025-11-05',
                duration: '3 months',
                status: 'pending',
                submittedDate: '2025-10-25'
            }
        ];
    }
}