import { useState, useEffect } from 'react'
import {
    type Skill,
    type Project,
    type Company,
    fetchSkills,
    fetchProjects,
    fetchCompanies,
    extractProjectRoles,
} from '../../data/api'

// ── Types for pending (uncommitted) changes ─────────────────

export interface PendingSkill {
    type: 'existing' | 'new'
    skillId?: string
    skillName: string
    synonyms?: string[]
    years: number
}

export interface PendingProject {
    type: 'existing' | 'new'
    projectId?: string
    projectName: string
    companyId?: string
    projectStartDate?: string
    projectEndDate?: string
    role: string
    allocationPercent: number
    isActive: boolean
    assignStartDate?: string
    assignEndDate?: string
}

export interface PendingDeactivation {
    projectId: string
    projectName: string
}

export interface PendingRemoval {
    projectId: string
    projectName: string
}

interface ExistingSkillNames {
    /** Skill names the consultant already has (edit mode only) */
    existingSkillNames?: Set<string>
    /** Project IDs the consultant is already assigned to (edit mode only) */
    assignedProjectIds?: Set<string>
}

export function useConsultantForm(existing?: ExistingSkillNames) {
    // Data from backend
    const [allSkills, setAllSkills] = useState<Skill[]>([])
    const [allProjects, setAllProjects] = useState<Project[]>([])
    const [allCompanies, setAllCompanies] = useState<Company[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Editable fields
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [yearsOfExperience, setYearsOfExperience] = useState<number>(0)
    const [wantsNewProject, setWantsNewProject] = useState(false)
    const [openToRemote, setOpenToRemote] = useState(false)

    // Pending changes (committed on Save)
    const [pendingSkills, setPendingSkills] = useState<PendingSkill[]>([])
    const [pendingProjects, setPendingProjects] = useState<PendingProject[]>([])
    const [isSaving, setIsSaving] = useState(false)

    // Add skill popup state
    const [showAddSkillPopup, setShowAddSkillPopup] = useState(false)
    const [isCreatingNewSkill, setIsCreatingNewSkill] = useState(false)
    const [selectedSkillName, setSelectedSkillName] = useState('')
    const [newSkillName, setNewSkillName] = useState('')
    const [newSkillSynonyms, setNewSkillSynonyms] = useState('')
    const [skillYears, setSkillYears] = useState<number>(0)

    // Add project popup state
    const [showAddProjectPopup, setShowAddProjectPopup] = useState(false)
    const [isCreatingNewProject, setIsCreatingNewProject] = useState(false)
    const [selectedProjectId, setSelectedProjectId] = useState('')
    const [newProjectName, setNewProjectName] = useState('')
    const [newProjectCompanyId, setNewProjectCompanyId] = useState('')
    const [newProjectStartDate, setNewProjectStartDate] = useState('')
    const [newProjectEndDate, setNewProjectEndDate] = useState('')
    const [assignRole, setAssignRole] = useState('')
    const [assignAllocation, setAssignAllocation] = useState<number>(100)
    const [assignIsActive, setAssignIsActive] = useState(true)
    const [assignStartDate, setAssignStartDate] = useState('')
    const [assignEndDate, setAssignEndDate] = useState('')

    // Close popups on Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                resetSkillPopup()
                resetProjectPopup()
            }
        }
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [])

    // Skills available to add (exclude already-pending and existing ones)
    const pendingSkillNames = new Set(pendingSkills.map(ps => ps.skillName))
    const availableSkillNames = allSkills
        .filter(s =>
            !pendingSkillNames.has(s.name) &&
            !(existing?.existingSkillNames?.has(s.name))
        )
        .map(s => s.name)
        .sort()

    // Projects available to assign (exclude already-pending and existing ones)
    const pendingProjectIds = new Set(
        pendingProjects.filter(p => p.type === 'existing').map(p => p.projectId!)
    )
    const availableProjects = allProjects.filter(
        p =>
            !pendingProjectIds.has(p.id) &&
            !(existing?.assignedProjectIds?.has(p.id))
    )

    // Role options from all projects
    const roleOptions = extractProjectRoles(allProjects)

    // Reset helpers
    const resetSkillPopup = () => {
        setShowAddSkillPopup(false)
        setIsCreatingNewSkill(false)
        setSelectedSkillName('')
        setNewSkillName('')
        setNewSkillSynonyms('')
        setSkillYears(0)
    }

    const resetProjectPopup = () => {
        setShowAddProjectPopup(false)
        setIsCreatingNewProject(false)
        setSelectedProjectId('')
        setNewProjectName('')
        setNewProjectCompanyId('')
        setNewProjectStartDate('')
        setNewProjectEndDate('')
        setAssignRole('')
        setAssignAllocation(100)
        setAssignIsActive(true)
        setAssignStartDate('')
        setAssignEndDate('')
    }

    /** Queue a skill addition locally */
    const handleAddSkill = () => {
        if (isCreatingNewSkill) {
            if (!newSkillName.trim()) return
            const synonymsList = newSkillSynonyms
                .split(';')
                .map(s => s.trim())
                .filter(s => s.length > 0)
            setPendingSkills(prev => [...prev, {
                type: 'new',
                skillName: newSkillName.trim(),
                synonyms: synonymsList,
                years: skillYears,
            }])
        } else {
            if (!selectedSkillName) return
            const skill = allSkills.find(s => s.name === selectedSkillName)
            if (!skill) return
            setPendingSkills(prev => [...prev, {
                type: 'existing',
                skillId: skill.id,
                skillName: skill.name,
                years: skillYears,
            }])
        }
        resetSkillPopup()
    }

    /** Queue a project assignment locally */
    const handleAssignProject = () => {
        if (!assignRole.trim()) return

        if (isCreatingNewProject) {
            if (!newProjectName.trim()) return
            setPendingProjects(prev => [...prev, {
                type: 'new',
                projectName: newProjectName.trim(),
                companyId: newProjectCompanyId || undefined,
                projectStartDate: newProjectStartDate || undefined,
                projectEndDate: newProjectEndDate || undefined,
                role: assignRole.trim(),
                allocationPercent: assignAllocation,
                isActive: assignIsActive,
                assignStartDate: assignStartDate || undefined,
                assignEndDate: assignEndDate || undefined,
            }])
        } else {
            if (!selectedProjectId) return
            const project = allProjects.find(p => p.id === selectedProjectId)
            setPendingProjects(prev => [...prev, {
                type: 'existing',
                projectId: selectedProjectId,
                projectName: project?.name ?? selectedProjectId,
                role: assignRole.trim(),
                allocationPercent: assignAllocation,
                isActive: assignIsActive,
                assignStartDate: assignStartDate || undefined,
                assignEndDate: assignEndDate || undefined,
            }])
        }
        resetProjectPopup()
    }

    const handleRemovePendingSkill = (index: number) => {
        setPendingSkills(prev => prev.filter((_, i) => i !== index))
    }

    const handleRemovePendingProject = (index: number) => {
        setPendingProjects(prev => prev.filter((_, i) => i !== index))
    }

    // Load reference data
    const loadReferenceData = async () => {
        setIsLoading(true)
        setError(null)
        const [skillsData, projectsData, companiesData] = await Promise.all([
            fetchSkills(),
            fetchProjects(),
            fetchCompanies(),
        ])
        setAllSkills(skillsData)
        setAllProjects(projectsData)
        setAllCompanies(companiesData)
        return { skillsData, projectsData, companiesData }
    }

    // Validation
    const skillPopupValid = isCreatingNewSkill
        ? newSkillName.trim().length > 0
        : selectedSkillName.length > 0

    const projectDatesValid = !newProjectStartDate || !newProjectEndDate || newProjectStartDate <= newProjectEndDate
    const assignDatesValid = !assignStartDate || !assignEndDate || assignStartDate <= assignEndDate

    const projectPopupValid = assignRole.trim().length > 0
        && assignDatesValid
        && (isCreatingNewProject
            ? newProjectName.trim().length > 0 && projectDatesValid
            : selectedProjectId.length > 0
        )

    return {
        // Reference data
        allSkills, allProjects, allCompanies,
        isLoading, setIsLoading, error, setError,
        loadReferenceData,

        // Form fields
        name, setName,
        email, setEmail,
        yearsOfExperience, setYearsOfExperience,
        wantsNewProject, setWantsNewProject,
        openToRemote, setOpenToRemote,

        // Pending changes
        pendingSkills, setPendingSkills,
        pendingProjects, setPendingProjects,
        isSaving, setIsSaving,

        // Skill popup
        showAddSkillPopup, setShowAddSkillPopup,
        isCreatingNewSkill, setIsCreatingNewSkill,
        selectedSkillName, setSelectedSkillName,
        newSkillName, setNewSkillName,
        newSkillSynonyms, setNewSkillSynonyms,
        skillYears, setSkillYears,

        // Project popup
        showAddProjectPopup, setShowAddProjectPopup,
        isCreatingNewProject, setIsCreatingNewProject,
        selectedProjectId, setSelectedProjectId,
        newProjectName, setNewProjectName,
        newProjectCompanyId, setNewProjectCompanyId,
        newProjectStartDate, setNewProjectStartDate,
        newProjectEndDate, setNewProjectEndDate,
        assignRole, setAssignRole,
        assignAllocation, setAssignAllocation,
        assignIsActive, setAssignIsActive,
        assignStartDate, setAssignStartDate,
        assignEndDate, setAssignEndDate,

        // Computed / derived
        availableSkillNames,
        availableProjects,
        roleOptions,
        pendingActiveCount: pendingProjects.filter(p => p.isActive).length,

        // Reset helpers
        resetSkillPopup,
        resetProjectPopup,

        // Handlers
        handleAddSkill,
        handleAssignProject,
        handleRemovePendingSkill,
        handleRemovePendingProject,

        // Validation
        skillPopupValid,
        projectDatesValid,
        assignDatesValid,
        projectPopupValid,
    }
}
