import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    type Skill,
    type Project,
    type Company,
    type AssignProjectPayload,
    type CreateProjectPayload,
    fetchSkills,
    fetchProjects,
    fetchCompanies,
    createConsultant,
    addSkillToConsultant,
    assignProjectToConsultant,
    createSkill,
    createProject,
} from '../../data/api'
import '../editConsultant/editConsultant.css'
import './addConsultant.css'

// ── Types for pending (uncommitted) changes ─────────────────
// (same as editConsultant)

interface PendingSkill {
    type: 'existing' | 'new'
    skillId?: string
    skillName: string
    synonyms?: string[]
    years: number
}

interface PendingProject {
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

const AddConsultant = () => {
    const navigate = useNavigate()

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

    // ── Pending changes (committed on Save) ─────────────────
    const [pendingSkills, setPendingSkills] = useState<PendingSkill[]>([])
    const [pendingProjects, setPendingProjects] = useState<PendingProject[]>([])
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

    // ── Load reference data ─────────────────────────────────

    useEffect(() => {
        const loadData = async () => {
            try {
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
            } catch (err) {
                console.error('Error fetching data:', err)
                setError('Kunne ikke laste data. Prøv igjen senere.')
            } finally {
                setIsLoading(false)
            }
        }

        loadData()
    }, [])

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

    // Availability preview based on pending active projects
    const pendingActiveCount = pendingProjects.filter(p => p.isActive).length
    const hasActiveProject = pendingActiveCount > 0
    const computedAvailability = !hasActiveProject

    // Skills available to add (exclude already-pending ones)
    const pendingSkillNames = new Set(pendingSkills.map(ps => ps.skillName))
    const availableSkillNames = allSkills
        .filter(s => !pendingSkillNames.has(s.name))
        .map(s => s.name)
        .sort()

    // Projects available to assign (exclude already-pending ones)
    const pendingProjectIds = new Set(
        pendingProjects.filter(p => p.type === 'existing').map(p => p.projectId!)
    )
    const availableProjects = allProjects.filter(p => !pendingProjectIds.has(p.id))

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
        if (!name.trim() || !email.trim()) {
            alert('Navn og e-post er påkrevd.')
            return
        }

        try {
            setIsSaving(true)

            // 1. Create the consultant
            const created = await createConsultant({
                name,
                email,
                yearsOfExperience,
                wantsNewProject,
                openToRemote,
            })

            const consultantId = created.id

            // 2. Process pending skill additions
            for (const ps of pendingSkills) {
                let skillId: string
                if (ps.type === 'new') {
                    const createdSkill = await createSkill(ps.skillName, ps.synonyms ?? [])
                    skillId = createdSkill.id
                } else {
                    skillId = ps.skillId!
                }
                await addSkillToConsultant(consultantId, skillId, ps.years)
            }

            // 3. Process pending project assignments
            for (const pp of pendingProjects) {
                let projectId: string
                if (pp.type === 'new') {
                    const payload: CreateProjectPayload = {
                        name: pp.projectName,
                        ...(pp.companyId && { companyId: pp.companyId }),
                        ...(pp.projectStartDate && { startDate: `${pp.projectStartDate}T00:00:00` }),
                        ...(pp.projectEndDate && { endDate: `${pp.projectEndDate}T00:00:00` }),
                    }
                    const createdProject = await createProject(payload)
                    projectId = createdProject.id
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
                await assignProjectToConsultant(consultantId, assignPayload)
            }

            navigate('/konsulenter')
        } catch (err) {
            console.error('Feil ved lagring:', err)
            alert('Kunne ikke opprette konsulenten. Prøv igjen senere.')
        } finally {
            setIsSaving(false)
        }
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

    // ── Render ──────────────────────────────────────────────

    if (isLoading) {
        return (
            <>
                <div className='header'><h1>Legg til Konsulent</h1></div>
                <div className='add-container'><p>Laster data...</p></div>
            </>
        )
    }

    if (error) {
        return (
            <>
                <div className='header'><h1>Legg til Konsulent</h1></div>
                <div className='add-container'>
                    <p className='error-text'>{error}</p>
                    <button className='cancel-button' onClick={() => navigate('/konsulenter')}>Tilbake</button>
                </div>
            </>
        )
    }

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

    return (
        <>
            <div className='header'>
                <h1>Legg til Konsulent</h1>
            </div>
            <div className='add-container'>
                <div className='add-form'>
                    <div className='add-row'>
                        <div className='add-field'>
                            <label>Navn</label>
                            <input type='text' placeholder='Fullt navn...' value={name} onChange={e => setName(e.target.value)} />
                        </div>
                        <div className='add-field'>
                            <label>E-post</label>
                            <input type='email' placeholder='epost@accenture.com' value={email} onChange={e => setEmail(e.target.value)} />
                        </div>
                    </div>

                    <div className='add-row'>
                        <div className='add-field'>
                            <label>Års erfaring</label>
                            <input
                                type='number'
                                min={0}
                                value={yearsOfExperience}
                                onChange={e => {
                                    const value = parseInt(e.target.value, 10)
                                    setYearsOfExperience(Number.isNaN(value) || value < 0 ? 0 : value)
                                }}
                            />
                        </div>
                        <div className='add-field'>
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
                    </div>

                    <div className='add-row'>
                        <div className='add-field'>
                            <label>Ønsker nytt prosjekt</label>
                            <select value={wantsNewProject ? 'ja' : 'nei'} onChange={e => setWantsNewProject(e.target.value === 'ja')}>
                                <option value='ja'>Ja</option>
                                <option value='nei'>Nei</option>
                            </select>
                        </div>
                        <div className='add-field'>
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

                    {/* ── Action buttons ────────────────────────────── */}
                    <div className='add-actions'>
                        <button className='cancel-button' onClick={() => navigate('/konsulenter')}>Avbryt</button>
                        <button className='save-button' onClick={handleSave} disabled={isSaving}>
                            {isSaving ? 'Lagrer...' : 'Legg til'}
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

export default AddConsultant