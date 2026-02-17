import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
    type Consultant,
    type Skill,
    type Project,
    type Company,
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
} from '../../data/api'
import './editConsultant.css'


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
    const [skills, setSkills] = useState<string[]>([])
    const [availability, setAvailability] = useState(true)
    const [wantsNewProject, setWantsNewProject] = useState(false)

    // ── Add skill popup state ───────────────────────────────
    const [showAddSkillPopup, setShowAddSkillPopup] = useState(false)
    const [isCreatingNewSkill, setIsCreatingNewSkill] = useState(false)
    const [selectedSkillName, setSelectedSkillName] = useState('')
    const [newSkillName, setNewSkillName] = useState('')
    const [newSkillSynonyms, setNewSkillSynonyms] = useState('')
    const [skillYears, setSkillYears] = useState<number>(0)
    const [isAddingSkill, setIsAddingSkill] = useState(false)

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
    const [isAssigningProject, setIsAssigningProject] = useState(false)

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
                setSkills(found.skills?.map(s => s.skillName) ?? [])
                setAvailability(found.availability)
                setWantsNewProject(found.wantsNewProject)
                setAllSkills(skillsData)
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

    // Skills the consultant doesn't already have
    const availableSkillNames = allSkills
        .filter(s => !skills.includes(s.name))
        .map(s => s.name)
        .sort()

    // Projects the consultant isn't already assigned to
    const assignedProjectIds = new Set(consultant?.projectAssignments?.map(p => p.projectId) ?? [])
    const availableProjects = allProjects.filter(p => !assignedProjectIds.has(p.id))

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
            await updateConsultant(id!, {
                name,
                email,
                yearsOfExperience: consultant.yearsOfExperience,
                availability,
                wantsNewProject,
                openToRemote: consultant.openToRemote,
            })
            navigate('/konsulenter')
        } catch (err) {
            console.error('Feil ved lagring:', err)
            alert('Kunne ikke lagre endringene. Prøv igjen senere.')
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

    const handleAddSkill = async () => {
        try {
            setIsAddingSkill(true)

            let skillId: string

            if (isCreatingNewSkill) {
                if (!newSkillName.trim()) return
                const synonymsList = newSkillSynonyms
                    .split(';')
                    .map(s => s.trim())
                    .filter(s => s.length > 0)
                const created = await createSkill(newSkillName.trim(), synonymsList)
                skillId = created.id
                setAllSkills(prev => [...prev, created])
            } else {
                if (!selectedSkillName) return
                const skill = allSkills.find(s => s.name === selectedSkillName)
                if (!skill) return
                skillId = skill.id
            }

            const updated = await addSkillToConsultant(id!, skillId, skillYears)
            setConsultant(updated)
            setSkills(updated.skills?.map(s => s.skillName) ?? [])
            resetSkillPopup()
        } catch (err) {
            console.error('Feil ved å legge til kompetanse:', err)
            alert('Kunne ikke legge til kompetanse. Prøv igjen.')
        } finally {
            setIsAddingSkill(false)
        }
    }

    const handleAssignProject = async () => {
        if (!assignRole.trim()) return

        try {
            setIsAssigningProject(true)

            let projectId: string

            if (isCreatingNewProject) {
                if (!newProjectName.trim()) return
                const payload: any = { name: newProjectName.trim() }
                if (newProjectCompanyId) payload.companyId = newProjectCompanyId
                if (newProjectStartDate) payload.startDate = `${newProjectStartDate}T00:00:00`
                if (newProjectEndDate) payload.endDate = `${newProjectEndDate}T00:00:00`
                const created = await createProject(payload)
                projectId = created.id
                setAllProjects(prev => [...prev, created])
            } else {
                if (!selectedProjectId) return
                projectId = selectedProjectId
            }

            const assignPayload: any = {
                projectId,
                role: assignRole.trim(),
                allocationPercent: assignAllocation,
                isActive: assignIsActive,
            }
            if (assignStartDate) assignPayload.startDate = `${assignStartDate}T00:00:00`
            if (assignEndDate) assignPayload.endDate = `${assignEndDate}T00:00:00`

            const updated = await assignProjectToConsultant(id!, assignPayload)
            setConsultant(updated)
            resetProjectPopup()
        } catch (err) {
            console.error('Feil ved prosjekttildeling:', err)
            alert('Kunne ikke tildele prosjekt. Prøv igjen.')
        } finally {
            setIsAssigningProject(false)
        }
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
                    <p style={{ color: 'red' }}>{error || 'Konsulent ikke funnet.'}</p>
                    <button className='cancel-button' onClick={() => navigate('/konsulenter')}>Tilbake</button>
                </div>
            </>
        )
    }

    const skillPopupValid = isCreatingNewSkill
        ? newSkillName.trim().length > 0
        : selectedSkillName.length > 0

    const projectPopupValid = assignRole.trim().length > 0 && (
        isCreatingNewProject
            ? newProjectName.trim().length > 0
            : selectedProjectId.length > 0
    )

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
                            <select value={availability ? 'ledig' : 'ikke-ledig'} onChange={e => setAvailability(e.target.value === 'ledig')}>
                                <option value='ledig'>Ledig</option>
                                <option value='ikke-ledig'>Ikke ledig</option>
                            </select>
                        </div>
                        <div className='edit-field'>
                            <label>Ønsker nytt prosjekt</label>
                            <select value={wantsNewProject ? 'ja' : 'nei'} onChange={e => setWantsNewProject(e.target.value === 'ja')}>
                                <option value='ja'>Ja</option>
                                <option value='nei'>Nei</option>
                            </select>
                        </div>
                    </div>

                    {/* ── Projects section ──────────────────────────── */}
                    <div className='edit-section'>
                        <label className='section-label'>Prosjekter</label>
                        <div className='project-list-edit'>
                            {consultant.projectAssignments?.map((p, i) => (
                                <div key={i} className='project-item-edit'>
                                    <span className='project-name-edit'>{p.projectName}</span>
                                    <span className='project-rolle-edit'>
                                        {p.role} ({p.allocationPercent}%)
                                        {p.isActive ? ' – Aktiv' : ' – Tidligere'}
                                    </span>
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
                        <div className='tag-list' style={{ marginBottom: '0.5em' }}>
                            {consultant.skills?.map(skill => (
                                <span key={skill.skillId} className='tag'>
                                    {skill.skillName} ({skill.skillYearsOfExperience} år)
                                </span>
                            ))}
                        </div>
                        <button className='add-project-btn' onClick={() => setShowAddSkillPopup(true)}>
                            + Legg til kompetanse
                        </button>
                    </div>

                    {/* ── Action buttons ────────────────────────────── */}
                    <div className='edit-actions'>
                        <button className='cancel-button' onClick={() => navigate('/konsulenter')}>Avbryt</button>
                        <button className='delete-button' onClick={handleDelete}>Slett</button>
                        <button className='save-button' onClick={handleSave}>Lagre</button>
                    </div>
                </div>
            </div>

            {/* ── Add Skill Popup ───────────────────────────────── */}
            {showAddSkillPopup && (
                <div className='popup-overlay' onClick={resetSkillPopup}>
                    <div className='popup-form' onClick={e => e.stopPropagation()}>
                        <h4>Legg til kompetanse</h4>

                        <div className='popup-field'>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.6em' }}>
                                <input
                                    type='checkbox'
                                    checked={isCreatingNewSkill}
                                    onChange={e => {
                                        setIsCreatingNewSkill(e.target.checked)
                                        setSelectedSkillName('')
                                        setNewSkillName('')
                                    }}
                                    style={{ accentColor: '#A100FF' }}
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
                                disabled={!skillPopupValid || isAddingSkill}
                            >
                                {isAddingSkill ? 'Legger til...' : 'Legg til'}
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
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.6em' }}>
                                <input
                                    type='checkbox'
                                    checked={isCreatingNewProject}
                                    onChange={e => {
                                        setIsCreatingNewProject(e.target.checked)
                                        setSelectedProjectId('')
                                        setNewProjectName('')
                                    }}
                                    style={{ accentColor: '#A100FF' }}
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

                        <hr style={{ border: 'none', borderTop: '1px solid #ddd', margin: '0.3em 0' }} />

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
                        </div>

                        <div className='popup-actions'>
                            <button className='cancel-button' onClick={resetProjectPopup}>Avbryt</button>
                            <button
                                className='save-button'
                                onClick={handleAssignProject}
                                disabled={!projectPopupValid || isAssigningProject}
                            >
                                {isAssigningProject ? 'Tildeler...' : 'Tildel'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default EditConsultant