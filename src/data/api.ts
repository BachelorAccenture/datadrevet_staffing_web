// src/services/api.ts
const API_BASE_URL = 'http://localhost:8080/api/v1';

export interface Skill {
  id: string;
  name: string;
  synonyms: string[];
}

export interface ConsultantFromAPI {
  id: string;
  name: string;
  email: string;
  projectAssignments?: Array<{
    projectId: string;
    projectName: string;
    role: string;
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

// Fetch all consultants
export const fetchConsultants = async (): Promise<ConsultantFromAPI[]> => {
  const response = await fetch(`${API_BASE_URL}/consultants`);
  if (!response.ok) throw new Error('Failed to fetch consultants');
  return response.json();
};

// Fetch all projects
export const fetchProjects = async (): Promise<Project[]> => {
  const response = await fetch(`${API_BASE_URL}/projects`);
  if (!response.ok) throw new Error('Failed to fetch projects');
  return response.json();
};

// Extract unique roles from consultants' project history
export const extractUniqueRoles = (consultants: ConsultantFromAPI[]): string[] => {
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