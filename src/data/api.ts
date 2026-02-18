// src/data/api.ts
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
    openToRemote: boolean;
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
  requirements: string[];
  startDate: string;
  endDate: string;
  company: Company | null;
  roles?: Record<string, number>;
}

// ── Skill endpoints ─────────────────────────────────────────

export const fetchSkills = async (): Promise<Skill[]> => {
  const response = await fetch(`${API_BASE_URL}/skills`);
  if (!response.ok) throw new Error('Failed to fetch skills');
  return response.json();
};

export const createSkill = async (name: string, synonyms: string[] = []): Promise<Skill> => {
  const response = await fetch(`${API_BASE_URL}/skills`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, synonyms }),
  });
  if (!response.ok) throw new Error('Failed to create skill');
  return response.json();
};

// ── Company endpoints ───────────────────────────────────────

export const fetchCompanies = async (): Promise<Company[]> => {
  const response = await fetch(`${API_BASE_URL}/companies`);
  if (!response.ok) throw new Error('Failed to fetch companies');
  return response.json();
};

// ── Project endpoints ───────────────────────────────────────

export const fetchProjects = async (): Promise<Project[]> => {
  const response = await fetch(`${API_BASE_URL}/projects`);
  if (!response.ok) throw new Error('Failed to fetch projects');
  return response.json();
};

export interface CreateProjectPayload {
  name: string;
  requirements?: string[];
  startDate?: string;
  endDate?: string;
  companyId?: string;
}

export const createProject = async (payload: CreateProjectPayload): Promise<Project> => {
  const response = await fetch(`${API_BASE_URL}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error('Failed to create project');
  return response.json();
};

// ── Consultant endpoints ────────────────────────────────────

export const fetchConsultants = async (): Promise<Consultant[]> => {
  const response = await fetch(`${API_BASE_URL}/consultants`);
  if (!response.ok) throw new Error('Failed to fetch consultants');
  return response.json();
};

export const fetchConsultantById = async (id: string): Promise<Consultant> => {
  const response = await fetch(`${API_BASE_URL}/consultants/${id}`);
  if (!response.ok) throw new Error('Failed to fetch consultant');
  return response.json();
};

export const deleteConsultant = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/consultants/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete consultant');
};

export interface UpdateConsultantPayload {
  name: string;
  email: string;
  yearsOfExperience: number;
  availability: boolean;
  wantsNewProject: boolean;
  openToRemote: boolean;
}

export const updateConsultant = async (id: string, data: UpdateConsultantPayload): Promise<Consultant> => {
  const response = await fetch(`${API_BASE_URL}/consultants/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update consultant');
  return response.json();
};

// ── Consultant skill management ─────────────────────────────

export const addSkillToConsultant = async (
  consultantId: string,
  skillId: string,
  skillYearsOfExperience: number
): Promise<Consultant> => {
  const response = await fetch(`${API_BASE_URL}/consultants/${consultantId}/skills`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ skillId, skillYearsOfExperience }),
  });
  if (!response.ok) throw new Error('Failed to add skill to consultant');
  return response.json();
};

// ── Consultant project assignment ───────────────────────────

export interface AssignProjectPayload {
  projectId: string;
  role: string;
  allocationPercent: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
}

export const assignProjectToConsultant = async (
  consultantId: string,
  payload: AssignProjectPayload
): Promise<Consultant> => {
  const response = await fetch(`${API_BASE_URL}/consultants/${consultantId}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error('Failed to assign project to consultant');
  return response.json();
};

/**
 * Marks a project assignment as inactive (ended). Preserves history.
 * Availability is recalculated server-side.
 */
export const deactivateProjectAssignment = async (
  consultantId: string,
  projectId: string
): Promise<Consultant> => {
  const response = await fetch(
    `${API_BASE_URL}/consultants/${consultantId}/projects/${projectId}/deactivate`,
    { method: 'PATCH' }
  );
  if (!response.ok) throw new Error('Failed to deactivate project assignment');
  return response.json();
};

/**
 * Completely removes a project assignment from a consultant.
 * Availability is recalculated server-side.
 */
export const removeProjectAssignment = async (
  consultantId: string,
  projectId: string
): Promise<Consultant> => {
  const response = await fetch(
    `${API_BASE_URL}/consultants/${consultantId}/projects/${projectId}`,
    { method: 'DELETE' }
  );
  if (!response.ok) throw new Error('Failed to remove project assignment');
  return response.json();
};

// ── Search ──────────────────────────────────────────────────

export interface SearchFilters {
  skillNames?: string[];
  role?: string;
  minYearsOfExperience?: number;
  availability?: boolean;
  wantsNewProject?: boolean;
  openToRemote?: boolean;
  previousCompanies?: string[];
  startDate?: string;
  endDate?: string;
}

export const searchConsultants = async (filters: SearchFilters): Promise<Consultant[]> => {
  const params = new URLSearchParams();

  if (filters.skillNames && filters.skillNames.length > 0) {
    filters.skillNames.forEach(skill => params.append('skillNames', skill));
  }

  if (filters.role) {
    params.append('role', filters.role);
  }

  if (filters.minYearsOfExperience !== undefined) {
    params.append('minYearsOfExperience', filters.minYearsOfExperience.toString());
  }

  if (filters.availability !== undefined) {
    params.append('availability', filters.availability.toString());
  }

  if (filters.wantsNewProject !== undefined) {
    params.append('wantsNewProject', filters.wantsNewProject.toString());
  }

  if (filters.openToRemote !== undefined) {
    params.append('openToRemote', filters.openToRemote.toString());
  }

  if (filters.previousCompanies && filters.previousCompanies.length > 0) {
    filters.previousCompanies.forEach(company => params.append('previousCompanies', company));
  }

  if (filters.startDate) {
    params.append('startDate', filters.startDate);
  }

  if (filters.endDate) {
    params.append('endDate', filters.endDate);
  }

  const url = `${API_BASE_URL}/consultants/search?${params.toString()}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Failed to search consultants');
  }

  return response.json();
};

// ── Utility extractors ──────────────────────────────────────

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

export const extractProjectRoles = (projects: Project[]): string[] => {
  const rolesSet = new Set<string>();
  projects.forEach(project => {
    if (project.roles) {
      Object.keys(project.roles).forEach(role => rolesSet.add(role));
    }
  });
  return Array.from(rolesSet).sort();
};