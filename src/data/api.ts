// src/services/api.ts
const API_BASE_URL = 'http://localhost:8080/api/v1';

export interface Skill {
  id: string;
  name: string;
  synonyms: string[];
}

export interface Company {
  id: string;
  name: string;
  field: string;
}

export interface Consultant {
    id: string;
    name: string;
    email: string;
    yearsOfExperience: number;
    availability: boolean;
    wantsNewProject: boolean;
    openToRelocation: boolean;
    openToRemote: boolean;
    preferredRegions: string[];
    skills: Array<{
        skillId: string;
        skillName: string;
        skillYearsOfExperience: number;
    }>;
    projectAssignments: Array<{
        projectId: string;
        projectName: string;
        role: string;
        allocationPercent: number;
        isActive: boolean;
    }>;
}

export interface Project {
  id: string;
  name: string;
  roles?: Record<string, number>;
}

// Fetch all skills
export const fetchSkills = async (): Promise<Skill[]> => {
  const response = await fetch(`${API_BASE_URL}/skills`);
  if (!response.ok) throw new Error('Failed to fetch skills');
  return response.json();
};

// Fetch all companies
export const fetchCompanies = async (): Promise<Company[]> => {
  const response = await fetch(`${API_BASE_URL}/companies`);
  if (!response.ok) throw new Error('Failed to fetch companies');
  return response.json();
};

// Fetch all consultants
export const fetchConsultants = async (): Promise<Consultant[]> => {
  const response = await fetch(`${API_BASE_URL}/consultants`);
  if (!response.ok) throw new Error('Failed to fetch consultants');
  return response.json();
};

// Fetch a single consultant by ID
export const fetchConsultantById = async (id: string): Promise<Consultant> => {
  const response = await fetch(`${API_BASE_URL}/consultants/${id}`);
  if (!response.ok) throw new Error('Failed to fetch consultant');
  return response.json();
};

// Search filters interface
export interface SearchFilters {
  skillNames?: string[];
  role?: string;
  minYearsOfExperience?: number;
  availability?: boolean;
  wantsNewProject?: boolean;
  openToRemote?: boolean;
  openToRelocation?: boolean;
  previousCompanies?: string[];  // Company names (e.g., "Amazon", "Google")
  startDate?: number;  // Unix timestamp (milliseconds)
  endDate?: number;    // Unix timestamp (milliseconds)
}

// Search consultants with all filters
export const searchConsultants = async (filters: SearchFilters): Promise<Consultant[]> => {
  const params = new URLSearchParams();
  
  // Add skill names as separate parameters
  if (filters.skillNames && filters.skillNames.length > 0) {
    filters.skillNames.forEach(skill => params.append('skillNames', skill));
  }
  
  // Add role if provided
  if (filters.role) {
    params.append('role', filters.role);
  }
  
  // Add minimum years of experience
  if (filters.minYearsOfExperience !== undefined) {
    params.append('minYearsOfExperience', filters.minYearsOfExperience.toString());
  }
  
  // Add boolean filters
  if (filters.availability !== undefined) {
    params.append('availability', filters.availability.toString());
  }
  
  if (filters.wantsNewProject !== undefined) {
    params.append('wantsNewProject', filters.wantsNewProject.toString());
  }
  
  if (filters.openToRemote !== undefined) {
    params.append('openToRemote', filters.openToRemote.toString());
  }
  
  if (filters.openToRelocation !== undefined) {
    params.append('openToRelocation', filters.openToRelocation.toString());
  }
  
  // Add previous companies as separate parameters
  if (filters.previousCompanies && filters.previousCompanies.length > 0) {
    filters.previousCompanies.forEach(company => params.append('previousCompanies', company));
  }
  
  // Add date range
  if (filters.startDate !== undefined) {
    params.append('startDate', filters.startDate.toString());
  }
  
  if (filters.endDate !== undefined) {
    params.append('endDate', filters.endDate.toString());
  }
  
  const url = `${API_BASE_URL}/consultants/search?${params.toString()}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error('Failed to search consultants');
  }
  
  return response.json();
};

// Extract unique companies from consultants' project history
export const extractUniqueCompanies = (consultants: Consultant[]): string[] => {
  const companiesSet = new Set<string>();
  
  // We need to fetch companies from the projects the consultants worked on
  // This is a placeholder - you'll need to enhance the Consultant interface
  // to include company information in projectAssignments
  
  // For now, return empty array - will be populated from fetchCompanies() instead
  return Array.from(companiesSet).sort();
};

// Extract unique roles from consultants' project history  
export const extractUniqueRoles = (consultants: Consultant[]): string[] => {
  const rolesSet = new Set<string>();
  consultants.forEach(consultant => {
    consultant.projectAssignments?.forEach(assignment => {
      if (assignment.role) {
        rolesSet.add(assignment.role);
      }
    });
  });
  return Array.from(rolesSet).sort();
};

// Extract unique role types from projects
export const extractProjectRoles = (projects: Project[]): string[] => {
  const rolesSet = new Set<string>();
  projects.forEach(project => {
    if (project.roles) {
      Object.keys(project.roles).forEach(role => rolesSet.add(role));
    }
  });
  return Array.from(rolesSet).sort();
};