import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    type AssignProjectPayload,
    type CreateProjectPayload,
    createConsultant,
    addSkillToConsultant,
    assignProjectToConsultant,
    createSkill,
    createProject,
} from '../../data/api'
import { useConsultantForm } from '../consultantForm/useConsultantForm'
import SkillPopup from '../consultantForm/SkillPopup'
import ProjectPopup from '../consultantForm/ProjectPopup'
import './addConsultant.css'
import trash from '../../assets/images/bin-removebg-preview.png'

const AddConsultant = () => {
    const navigate = useNavigate()
    const form = useConsultantForm()

    // Load reference data
    useEffect(() => {
        form.loadReferenceData()
            .catch(err => {
                console.error('Error fetching data:', err)
                form.setError('Kunne ikke laste data. Prøv igjen senere.')
            })
            .finally(() => form.setIsLoading(false))
    }, [])

    // Availability preview based on pending active projects
    const hasActiveProject = form.pendingActiveCount > 0
    const computedAvailability = !hasActiveProject

    const handleSave = async () => {
        if (!form.name.trim() || !form.email.trim()) {
            alert('Navn og e-post er påkrevd.')
            return
        }

        try {
            form.setIsSaving(true)

            // 1. Create the consultant
            const created = await createConsultant({
                name: form.name,
                email: form.email,
                yearsOfExperience: form.yearsOfExperience,
                wantsNewProject: form.wantsNewProject,
                openToRemote: form.openToRemote,
            })

            const consultantId = created.id

            // 2. Process pending skill additions
            for (const ps of form.pendingSkills) {
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
            for (const pp of form.pendingProjects) {
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
            form.setIsSaving(false)
        }
    }

    // ── Render ──────────────────────────────────────────────

    if (form.isLoading) {
        return (
            <>
                <div className='header'><h1>Legg til Konsulent</h1></div>
                <div className='add-container'><p>Laster data...</p></div>
            </>
        )
    }

    if (form.error) {
        return (
            <>
                <div className='header'><h1>Legg til Konsulent</h1></div>
                <div className='add-container'>
                    <p className='error-text'>{form.error}</p>
                    <button className='cancel-button' onClick={() => navigate('/konsulenter')}>Tilbake</button>
                </div>
            </>
        )
    }

    return (
        <>
            <div className='header'>
                <h1>Legg til Konsulent</h1>
            </div>
            <div className='add-container'>
                <div className='add-form'>
                    <div className='add-field'>
                        <label>Navn</label>
                        <input type='text' placeholder='Fullt navn...' value={form.name} onChange={e => form.setName(e.target.value)} />
                    </div>
                    <div className='add-field'>
                        <label>E-post</label>
                        <input type='email' placeholder='epost@accenture.com' value={form.email} onChange={e => form.setEmail(e.target.value)} />
                    </div>

                    <div className='add-field experience-field'>
                        <label>Års erfaring</label>
                        <input
                            type='number'
                            min={0}
                            value={form.yearsOfExperience}
                            onChange={e => {
                                const value = parseInt(e.target.value, 10)
                                form.setYearsOfExperience(Number.isNaN(value) || value < 0 ? 0 : value)
                            }}
                        />
                    </div>
                    <div className='add-field checkbox-field'>
                        <label>Ledig
                            <input className='accent-checkbox' type={'checkbox'} checked={computedAvailability} disabled/>
                        </label>
                        <span className='availability-hint'>
                            {hasActiveProject
                                ? 'Ikke ledig – har aktivt prosjekt'
                                : 'Ledig – ingen aktive prosjekter'}
                        </span>
                    </div>
                    <div className='add-field checkbox-field'>
                        <label>Ønsker nytt prosjekt
                        <input className='accent-checkbox' type={'checkbox'} checked={form.wantsNewProject} onChange={e => form.setWantsNewProject(e.target.checked)}/>
                        </label>
                    </div>
                    <div className='add-field checkbox-field'>
                        <label>Åpen for remote
                        <input className='accent-checkbox' type={'checkbox'} checked={form.openToRemote} onChange={e => form.setOpenToRemote(e.target.checked)}/>
                        </label>
                    </div>

                    {/* ── Projects section ──────────────────────────── */}
                    <div className='edit-section'>
                        <label className='section-label'>Prosjekter</label>
                        <div className='project-list-edit'>
                            {form.pendingProjects.map((pendingProject, i) => (
                                <div key={`pending-proj-${i}`} className='project-item-edit project-item--pending'>
                                    <div className='project-item-content'>
                                        <span className='project-name'>{pendingProject.projectName}</span>
                                        <div className='project-role-row'>
                                            <div className='project-role-column'>
                                                <span className='project-role'>{pendingProject.role}</span>
                                                <span className='project-period'>{pendingProject.assignStartDate?.slice(0,7) || 'Ukjent'} – {pendingProject.assignEndDate?.slice(0,7) || 'Pågår'}</span>
                                            </div>
                                            <img className= {'delete-image'} src={trash} alt='Slett' onClick={() => form.handleRemovePendingProject(i)} />
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <button className='add-project-btn' onClick={() => form.setShowAddProjectPopup(true)}>
                                + Legg til prosjekt
                            </button>
                        </div>
                    </div>

                    {/* ── Skills section ────────────────────────────── */}
                    <div className='edit-section'>
                        <label className='section-label'>Kompetanse</label>
                        <div className='tag-list tag-list--skills'>
                            {form.pendingSkills.map((ps, i) => (
                                <span
                                    key={`pending-skill-${i}`}
                                    className='tag tag--pending'
                                    title='Klikk for å fjerne'
                                    onClick={() => form.handleRemovePendingSkill(i)}
                                >
                                    {ps.skillName} ({ps.years} år)
                                    {ps.type === 'new' && <em className='label-new'> nytt</em>}
                                    {' ✕'}
                                </span>
                            ))}
                        </div>
                        <button className='add-project-btn' onClick={() => form.setShowAddSkillPopup(true)}>
                            + Legg til kompetanse
                        </button>
                    </div>

                    {/* ── Action buttons ────────────────────────────── */}
                    <div className='add-actions'>
                        <button className='cancel-button' onClick={() => navigate('/konsulenter')}>Avbryt</button>
                        <button className='save-button' onClick={handleSave} disabled={form.isSaving}>
                            {form.isSaving ? 'Lagrer...' : 'Legg til'}
                        </button>
                    </div>
                </div>
            </div>

            <SkillPopup form={form} />
            <ProjectPopup form={form} />
        </>
    )
}

export default AddConsultant
