import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
    type Consultant,
    type Skill,
    type Project,
    type Company,
    type AssignProjectPayload,
    type CreateProjectPayload,
    fetchSkills,
    fetchProjects,
    fetchCompanies,
    fetchConsultantById,
    deleteConsultant,
    updateConsultant,
    addSkillToConsultant,
    assignProjectToConsultant,
    createSkill,
    createProject,
    deactivateProjectAssignment,
    removeProjectAssignment,
} from '../../data/api'
import './editConsultant.css'

// ── Types for pending (uncommitted) changes ─────────────────

interface PendingSkill {
    type: 'existing' | 'new'
    skillId?: string       // set when type === 'existing'
    skillName: string
    synonyms?: string[]    // set when type === 'new'
    years: number
}

interface PendingProject {
    type: 'existing' | 'new'
    projectId?: string     // set when type === 'existing'
    projectName: string
    // new-project fields
    companyId?: string
    projectStartDate?: string
    projectEndDate?: string
    // assignment fields
    role: string
    allocationPercent: number
    isActive: boolean
    assignStartDate?: string
    assignEndDate?: string
}

interface PendingDeactivation {
    projectId: string
    projectName: string
}

interface PendingRemoval {
    projectId: string
    projectName: string
}


const EditConsultant = () => {
    const navigate = useNavigate()
    const { id } = useParams()

    // Data from backend
    const [allSkills, setAllSkills] = useState<Skill[]>([])
    const [allProjects, setAllProjects] = useState<Project[]>([])
    const [allCompanies, setAllCompanies] = useState<Company[]>([])
    const [consultant, setConsultant] = useState<Consultant | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Editable fields
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [wantsNewProject, setWantsNewProject] = useState(false)
    const [openToRemote, setOpenToRemote] = useState(false)

    // ── Pending changes (only committed on Save) ────────────
    const [pendingSkills, setPendingSkills] = useState<PendingSkill[]>([])
    const [pendingProjects, setPendingProjects] = useState<PendingProject[]>([])
    const [pendingDeactivations, setPendingDeactivations] = useState<PendingDeactivation[]>([])
    const [pendingRemovals, setPendingRemovals] = useState<PendingRemoval[]>([])
    const [isSaving, setIsSaving] = useState(false)

    // ── Add skill popup state ───────────────────────────────
    const [showAddSkillPopup, setShowAddSkillPopup] = useState(false)
    const [isCreatingNewSkill, setIsCreatingNewSkill] = useState(false)
    const [selectedSkillName, setSelectedSkillName] = useState('')
    const [newSkillName, setNewSkillName] = useState('')
    const [newSkillSynonyms, setNewSkillSynonyms] = useState('')
    const [skillYears, setSkillYears] = useState<number>(0)

    // ── Add project popup state ─────────────────────────────
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

    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoading(true)
                setError(null)

                const [found, skillsData, projectsData, companiesData] = await Promise.all([
                    fetchConsultantById(id!),
                    fetchSkills(),
                    fetchProjects(),
                    fetchCompanies(),
                ])

                setConsultant(found)
                setName(found.name)
                setEmail(found.email)
                setWantsNewProject(found.wantsNewProject)
                setOpenToRemote(found.openToRemote)
                setAllProjects(projectsData)
                setAllCompanies(companiesData)
            } catch (err) {
                console.error('Error fetching data:', err)
                setError('Kunne ikke laste konsulent. Prøv igjen senere.')
            } finally {
                setIsLoading(false)
            }
        }

        loadData()
    }, [id])

    // Close popups on Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setShowAddSkillPopup(false)
                setIsCreatingNewSkill(false)
                setSelectedSkillName('')
                setNewSkillName('')
                setNewSkillSynonyms('')
                setSkillYears(0)
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
        }
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [])

    // Availability is derived from active project assignments (managed by backend)
    // Include pending changes in the preview
    const deactivatedIds = new Set(pendingDeactivations.map(d => d.projectId))
    const removedIds = new Set(pendingRemovals.map(r => r.projectId))
    const existingActiveCount = consultant?.projectAssignments
        ?.filter(p => p.isActive && !deactivatedIds.has(p.projectId) && !removedIds.has(p.projectId))
        .length ?? 0
    const pendingActiveCount = pendingProjects.filter(p => p.isActive).length
    const hasActiveProject = (existingActiveCount + pendingActiveCount) > 0
    const computedAvailability = !hasActiveProject

    // Skills the consultant doesn't already have (also exclude pending additions)
    const existingSkillNames = new Set(consultant?.skills?.map(s => s.skillName) ?? [])
    const pendingSkillNames = new Set(pendingSkills.map(ps => ps.skillName))
    const availableSkillNames = allSkills
        .filter(s => !existingSkillNames.has(s.name) && !pendingSkillNames.has(s.name))
        .map(s => s.name)
        .sort()

    // Projects the consultant isn't already assigned to (also exclude pending)
    const assignedProjectIds = new Set(consultant?.projectAssignments?.map(p => p.projectId) ?? [])
    const pendingProjectIds = new Set(pendingProjects.filter(p => p.type === 'existing').map(p => p.projectId!))
    const availableProjects = allProjects.filter(
        p => !assignedProjectIds.has(p.id) && !pendingProjectIds.has(p.id)
    )

    // ── Reset helpers ───────────────────────────────────────

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

    // ── Handlers ────────────────────────────────────────────

    const handleSave = async () => {
        if (!consultant) return
        try {
            setIsSaving(true)

            // 1. Process pending deactivations
            for (const d of pendingDeactivations) {
                await deactivateProjectAssignment(id!, d.projectId)
            }

            // 2. Process pending removals
            for (const r of pendingRemovals) {
                await removeProjectAssignment(id!, r.projectId)
            }

            // 3. Process pending skill additions
            for (const ps of pendingSkills) {
                let skillId: string
                if (ps.type === 'new') {
                    const created = await createSkill(ps.skillName, ps.synonyms ?? [])
                    skillId = created.id
                } else {
                    skillId = ps.skillId!
                }
                await addSkillToConsultant(id!, skillId, ps.years)
            }

            // 4. Process pending project assignments
            for (const pp of pendingProjects) {
                let projectId: string
                if (pp.type === 'new') {
                    const payload: CreateProjectPayload = {
                        name: pp.projectName,
                        ...(pp.companyId && { companyId: pp.companyId }),
                        ...(pp.projectStartDate && { startDate: `${pp.projectStartDate}T00:00:00` }),
                        ...(pp.projectEndDate && { endDate: `${pp.projectEndDate}T00:00:00` }),
                    }
                    const created = await createProject(payload)
                    projectId = created.id
                } else {
                    projectId = pp.projectId!
                }
                const assignPayload: AssignProjectPayload = {
                    projectId,
                    role: pp.role,
                    allocationPercent: pp.allocationPercent,
                    isActive: pp.isActive,
                    ...(pp.assignStartDate && { startDate: `${pp.assignStartDate}T00:00:00` }),
                    ...(pp.assignEndDate && { endDate: `${pp.assignEndDate}T00:00:00` }),
                }
                await assignProjectToConsultant(id!, assignPayload)
            }

            // 5. Save basic consultant fields (backend recalculates availability)
            await updateConsultant(id!, {
                name,
                email,
                yearsOfExperience: consultant.yearsOfExperience,
                wantsNewProject,
                openToRemote: consultant.openToRemote,
            })

            navigate('/konsulenter')
        } catch (err) {
            console.error('Feil ved lagring:', err)
            alert('Kunne ikke lagre endringene. Prøv igjen senere.')
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async () => {
        const confirmed = window.confirm(
            `Er du sikker på at du vil slette ${name}? Denne handlingen kan ikke angres.`
        )
        if (!confirmed) return

        try {
            await deleteConsultant(id!)
            navigate('/konsulenter')
        } catch (err) {
            console.error('Feil ved sletting:', err)
            alert('Kunne ikke slette konsulenten. Prøv igjen senere.')
        }
    }

    /** Queue a skill addition locally (nothing hits the backend yet) */
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

    /** Queue a project assignment locally (nothing hits the backend yet) */
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

    const handleDeactivateProject = (projectId: string, projectName: string) => {
        setPendingDeactivations(prev => [...prev, { projectId, projectName }])
    }

    const handleRemoveProject = (projectId: string, projectName: string) => {
        setPendingRemovals(prev => [...prev, { projectId, projectName }])
    }

    const handleUndoDeactivation = (projectId: string) => {
        setPendingDeactivations(prev => prev.filter(d => d.projectId !== projectId))
    }

    const handleUndoRemoval = (projectId: string) => {
        setPendingRemovals(prev => prev.filter(r => r.projectId !== projectId))
    }

    const handleRemovePendingSkill = (index: number) => {
        setPendingSkills(prev => prev.filter((_, i) => i !== index))
    }

    const handleRemovePendingProject = (index: number) => {
        setPendingProjects(prev => prev.filter((_, i) => i !== index))
    }

    // ── Render ──────────────────────────────────────────────

    if (isLoading) {
        return (
            <>
                <div className='header'><h1>Rediger Konsulent</h1></div>
                <div className='edit-container'><p>Laster konsulent...</p></div>
            </>
        )
    }

    if (error || !consultant) {
        return (
            <>
                <div className='header'><h1>Rediger Konsulent</h1></div>
                <div className='edit-container'>
                    <p className='error-text'>{error || 'Konsulent ikke funnet.'}</p>
                    <button className='cancel-button' onClick={() => navigate('/konsulenter')}>Tilbake</button>
                </div>
            </>
        )
    }

    const skillPopupValid = isCreatingNewSkill
        ? newSkillName.trim().length > 0
        : selectedSkillName.length > 0

    // Date validation: start must not be after end
    const projectDatesValid = !newProjectStartDate || !newProjectEndDate || newProjectStartDate <= newProjectEndDate
    const assignDatesValid = !assignStartDate || !assignEndDate || assignStartDate <= assignEndDate

    const projectPopupValid = assignRole.trim().length > 0
        && assignDatesValid
        && (isCreatingNewProject
            ? newProjectName.trim().length > 0 && projectDatesValid
            : selectedProjectId.length > 0
        )

    const hasPendingChanges = pendingSkills.length > 0
        || pendingProjects.length > 0
        || pendingDeactivations.length > 0
        || pendingRemovals.length > 0

    return (
        <>
            <div className='header'>
                <h1>Rediger Konsulent</h1>
            </div>
            <div className='edit-container'>
                <div className='edit-form'>
                    <div className='edit-row'>
                        <div className='edit-field'>
                            <label>Navn</label>
                            <input type='text' value={name} onChange={e => setName(e.target.value)} />
                        </div>
                        <div className='edit-field'>
                            <label>E-post</label>
                            <input type='email' value={email} onChange={e => setEmail(e.target.value)} />
                        </div>
                    </div>

                    <div className='edit-row'>
                        <div className='edit-field'>
                            <label>Ledighet</label>
                            <select
                                value={computedAvailability ? 'ledig' : 'ikke-ledig'}
                                disabled
                                title='Styres automatisk av aktive prosjekter'
                            >
                                <option value='ledig'>Ledig</option>
                                <option value='ikke-ledig'>Ikke ledig</option>
                            </select>
                            <span className='availability-hint'>
                                {hasActiveProject
                                    ? 'Ikke ledig – har aktivt prosjekt'
                                    : 'Ledig – ingen aktive prosjekter'}
                            </span>
                        </div>
                        <div className='edit-field'>
                            <label>Ønsker nytt prosjekt</label>
                            <select value={wantsNewProject ? 'ja' : 'nei'} onChange={e => setWantsNewProject(e.target.value === 'ja')}>
                                <option value='ja'>Ja</option>
                                <option value='nei'>Nei</option>
                            </select>
                        </div>
                    </div>
                    <div className='edit-row'>
                        <div className='edit-field'>
                            <label>Åpen for remote</label>
                            <select value={openToRemote ? 'ja' : 'nei'} onChange={e => setOpenToRemote(e.target.value === 'ja')}>
                                <option value='ja'>Ja</option>
                                <option value='nei'>Nei</option>
                            </select>
                        </div>
                    </div>
                    

                    {/* ── Projects section ──────────────────────────── */}
                    <div className='edit-section'>
                        <label className='section-label'>Prosjekter</label>
                        <div className='project-list-edit'>
                            {consultant.projectAssignments?.map((p, i) => {
                                const isDeactivated = deactivatedIds.has(p.projectId)
                                const isRemoved = removedIds.has(p.projectId)

                                if (isRemoved) {
                                    return (
                                        <div key={i} className='project-item-edit project-item--removed'>
                                            <div className='project-item-content'>
                                                <span className='project-name-edit'>{p.projectName}</span>
                                                <span className='project-rolle-edit'>{p.role} – Fjernes ved lagring</span>
                                            </div>
                                            <button
                                                className='cancel-button btn-sm'
                                                onClick={() => handleUndoRemoval(p.projectId)}
                                            >
                                                Angre
                                            </button>
                                        </div>
                                    )
                                }

                                if (isDeactivated) {
                                    return (
                                        <div key={i} className='project-item-edit project-item--deactivated'>
                                            <div className='project-item-content'>
                                                <span className='project-name-edit'>{p.projectName}</span>
                                                <span className='project-rolle-edit'>{p.role} – Avsluttes ved lagring</span>
                                            </div>
                                            <button
                                                className='cancel-button btn-sm'
                                                onClick={() => handleUndoDeactivation(p.projectId)}
                                            >
                                                Angre
                                            </button>
                                        </div>
                                    )
                                }

                                return (
                                    <div key={i} className='project-item-edit'>
                                        <div className='project-item-content'>
                                            <span className='project-name-edit'>{p.projectName}</span>
                                            <span className='project-rolle-edit'>
                                                {p.role} ({p.allocationPercent}%)
                                                {p.isActive ? ' – Aktiv' : ' – Tidligere'}
                                            </span>
                                        </div>
                                        <div className='project-item-actions'>
                                            {p.isActive && (
                                                <button
                                                    className='cancel-button btn-sm'
                                                    onClick={() => handleDeactivateProject(p.projectId, p.projectName)}
                                                    title='Avslutt tildeling (beholder historikk)'
                                                >
                                                    Avslutt
                                                </button>
                                            )}
                                            <button
                                                className='delete-button btn-sm'
                                                onClick={() => handleRemoveProject(p.projectId, p.projectName)}
                                                title='Fjern tildeling helt'
                                            >
                                                Fjern
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}

                            {/* Pending project additions */}
                            {pendingProjects.map((pp, i) => (
                                <div key={`pending-proj-${i}`} className='project-item-edit project-item--pending'>
                                    <div className='project-item-content'>
                                        <span className='project-name-edit'>
                                            {pp.projectName}
                                            {pp.type === 'new' && <em className='label-new'> (nytt)</em>}
                                        </span>
                                        <span className='project-rolle-edit'>
                                            {pp.role} ({pp.allocationPercent}%)
                                            {pp.isActive ? ' – Aktiv' : ' – Tidligere'}
                                            <em className='label-pending-save'> – Lagres ved lagring</em>
                                        </span>
                                    </div>
                                    <button
                                        className='delete-button btn-sm'
                                        onClick={() => handleRemovePendingProject(i)}
                                    >
                                        Fjern
                                    </button>
                                </div>
                            ))}

                            <button className='add-project-btn' onClick={() => setShowAddProjectPopup(true)}>
                                + Legg til prosjekt
                            </button>
                        </div>
                    </div>

                    {/* ── Skills section ────────────────────────────── */}
                    <div className='edit-section'>
                        <label className='section-label'>Kompetanse</label>
                        <div className='tag-list tag-list--skills'>
                            {consultant.skills?.map(skill => (
                                <span key={skill.skillId} className='tag'>
                                    {skill.skillName} ({skill.skillYearsOfExperience} år)
                                </span>
                            ))}
                            {pendingSkills.map((ps, i) => (
                                <span
                                    key={`pending-skill-${i}`}
                                    className='tag tag--pending'
                                    title='Klikk for å fjerne'
                                    onClick={() => handleRemovePendingSkill(i)}
                                >
                                    {ps.skillName} ({ps.years} år)
                                    {ps.type === 'new' && <em className='label-new'> nytt</em>}
                                    {' ✕'}
                                </span>
                            ))}
                        </div>
                        <button className='add-project-btn' onClick={() => setShowAddSkillPopup(true)}>
                            + Legg til kompetanse
                        </button>
                    </div>

                    {/* ── Unsaved changes notice ───────────────────── */}
                    {hasPendingChanges && (
                        <div className='pending-banner'>
                            Du har ulagrede endringer. Trykk «Lagre» for å bekrefte.
                        </div>
                    )}

                    {/* ── Action buttons ────────────────────────────── */}
                    <div className='edit-actions'>
                        <button className='cancel-button' onClick={() => navigate('/konsulenter')}>Avbryt</button>
                        <button className='delete-button' onClick={handleDelete}>Slett</button>
                        <button className='save-button' onClick={handleSave} disabled={isSaving}>
                            {isSaving ? 'Lagrer...' : 'Lagre'}
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Add Skill Popup ───────────────────────────────── */}
            {showAddSkillPopup && (
                <div className='popup-overlay' onClick={resetSkillPopup}>
                    <div className='popup-form' onClick={e => e.stopPropagation()}>
                        <h4>Legg til kompetanse</h4>

                        <div className='popup-field'>
                            <label className='checkbox-label'>
                                <input
                                    type='checkbox'
                                    checked={isCreatingNewSkill}
                                    onChange={e => {
                                        setIsCreatingNewSkill(e.target.checked)
                                        setSelectedSkillName('')
                                        setNewSkillName('')
                                    }}
                                    className='accent-checkbox'
                                />
                                Opprett ny kompetanse
                            </label>
                        </div>

                        {isCreatingNewSkill ? (
                            <>
                                <div className='popup-field'>
                                    <label>Navn</label>
                                    <input
                                        type='text'
                                        placeholder='F.eks. Kotlin'
                                        value={newSkillName}
                                        onChange={e => setNewSkillName(e.target.value)}
                                    />
                                </div>
                                <div className='popup-field'>
                                    <label>Synonymer (valgfri, semikolon-separert)</label>
                                    <input
                                        type='text'
                                        placeholder='F.eks. KotlinJVM;Kotlin/JVM'
                                        value={newSkillSynonyms}
                                        onChange={e => setNewSkillSynonyms(e.target.value)}
                                    />
                                </div>
                            </>
                        ) : (
                            <div className='popup-field'>
                                <label>Kompetanse</label>
                                <select
                                    value={selectedSkillName}
                                    onChange={e => setSelectedSkillName(e.target.value)}
                                >
                                    <option value=''>Velg kompetanse...</option>
                                    {availableSkillNames.map(name => (
                                        <option key={name} value={name}>{name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className='popup-field'>
                            <label>Års erfaring</label>
                            <input
                                type='number'
                                min={0}
                                value={skillYears}
                                onChange={e => {
                                    const value = parseInt(e.target.value, 10)
                                    setSkillYears(Number.isNaN(value) || value < 0 ? 0 : value)
                                }}
                            />
                        </div>

                        <div className='popup-actions'>
                            <button className='cancel-button' onClick={resetSkillPopup}>Avbryt</button>
                            <button
                                className='save-button'
                                onClick={handleAddSkill}
                                disabled={!skillPopupValid}
                            >
                                Legg til
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Assign Project Popup ──────────────────────────── */}
            {showAddProjectPopup && (
                <div className='popup-overlay' onClick={resetProjectPopup}>
                    <div className='popup-form' onClick={e => e.stopPropagation()}>
                        <h4>Tildel prosjekt</h4>

                        <div className='popup-field'>
                            <label className='checkbox-label'>
                                <input
                                    type='checkbox'
                                    checked={isCreatingNewProject}
                                    onChange={e => {
                                        setIsCreatingNewProject(e.target.checked)
                                        setSelectedProjectId('')
                                        setNewProjectName('')
                                    }}
                                    className='accent-checkbox'
                                />
                                Opprett nytt prosjekt
                            </label>
                        </div>

                        {isCreatingNewProject ? (
                            <>
                                <div className='popup-field'>
                                    <label>Prosjektnavn</label>
                                    <input
                                        type='text'
                                        placeholder='F.eks. Mobile App Redesign'
                                        value={newProjectName}
                                        onChange={e => setNewProjectName(e.target.value)}
                                    />
                                </div>
                                <div className='popup-field'>
                                    <label>Bedrift (valgfri)</label>
                                    <select
                                        value={newProjectCompanyId}
                                        onChange={e => setNewProjectCompanyId(e.target.value)}
                                    >
                                        <option value=''>Ingen bedrift</option>
                                        {allCompanies.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className='popup-field'>
                                    <label>Prosjekt startdato (valgfri)</label>
                                    <input
                                        type='date'
                                        value={newProjectStartDate}
                                        onChange={e => setNewProjectStartDate(e.target.value)}
                                    />
                                </div>
                                <div className='popup-field'>
                                    <label>Prosjekt sluttdato (valgfri)</label>
                                    <input
                                        type='date'
                                        value={newProjectEndDate}
                                        onChange={e => setNewProjectEndDate(e.target.value)}
                                    />
                                    {!projectDatesValid && (
                                        <span className='validation-error'>
                                            Sluttdato kan ikke være før startdato
                                        </span>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className='popup-field'>
                                <label>Prosjekt</label>
                                <select
                                    value={selectedProjectId}
                                    onChange={e => setSelectedProjectId(e.target.value)}
                                >
                                    <option value=''>Velg prosjekt...</option>
                                    {availableProjects.map(p => (
                                        <option key={p.id} value={p.id}>
                                            {p.name} {p.company ? `(${p.company.name})` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <hr className='popup-divider' />

                        <div className='popup-field'>
                            <label>Rolle</label>
                            <input
                                type='text'
                                placeholder='F.eks. Backend Developer'
                                value={assignRole}
                                onChange={e => setAssignRole(e.target.value)}
                            />
                        </div>
                        <div className='popup-field'>
                            <label>Allokering (%)</label>
                            <input
                                type='number'
                                min={0}
                                max={100}
                                value={assignAllocation}
                                onChange={e => {
                                    const raw = Number(e.target.value);
                                    const sanitized = Number.isNaN(raw) ? 0 : Math.min(100, Math.max(0, raw));
                                    setAssignAllocation(sanitized);
                                }}
                            />
                        </div>
                        <div className='popup-field'>
                            <label>Status</label>
                            <select
                                value={assignIsActive ? 'active' : 'inactive'}
                                onChange={e => setAssignIsActive(e.target.value === 'active')}
                            >
                                <option value='active'>Aktiv</option>
                                <option value='inactive'>Tidligere</option>
                            </select>
                        </div>
                        <div className='popup-field'>
                            <label>Tildeling startdato (valgfri)</label>
                            <input
                                type='date'
                                value={assignStartDate}
                                onChange={e => setAssignStartDate(e.target.value)}
                            />
                        </div>
                        <div className='popup-field'>
                            <label>Tildeling sluttdato (valgfri)</label>
                            <input
                                type='date'
                                value={assignEndDate}
                                onChange={e => setAssignEndDate(e.target.value)}
                            />
                            {!assignDatesValid && (
                                <span className='validation-error'>
                                    Sluttdato kan ikke være før startdato
                                </span>
                            )}
                        </div>

                        <div className='popup-actions'>
                            <button className='cancel-button' onClick={resetProjectPopup}>Avbryt</button>
                            <button
                                className='save-button'
                                onClick={handleAssignProject}
                                disabled={!projectPopupValid}
                            >
                                Tildel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default EditConsultant