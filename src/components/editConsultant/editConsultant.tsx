import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
    type Consultant,
    type AssignProjectPayload,
    type CreateProjectPayload,
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
import { useConsultantForm, type PendingDeactivation, type PendingRemoval } from '../consultantForm/useConsultantForm'
import SkillPopup from '../consultantForm/SkillPopup'
import ProjectPopup from '../consultantForm/ProjectPopup'
import './editConsultant.css'
import trash from "../../assets/images/bin-removebg-preview.png";

const EditConsultant = () => {
    const navigate = useNavigate()
    const { id } = useParams()

    const [consultant, setConsultant] = useState<Consultant | null>(null)

    // Edit-specific pending changes
    const [pendingDeactivations, setPendingDeactivations] = useState<PendingDeactivation[]>([])
    const [pendingRemovals, setPendingRemovals] = useState<PendingRemoval[]>([])

    // Memoize existing names/ids so the hook filters correctly
    const existingSkillNames = useMemo(
        () => new Set(consultant?.skills?.map(s => s.skillName) ?? []),
        [consultant]
    )
    const assignedProjectIds = useMemo(
        () => new Set(consultant?.projectAssignments?.map(p => p.projectId) ?? []),
        [consultant]
    )

    const form = useConsultantForm({ existingSkillNames, assignedProjectIds })

    // Load consultant + reference data
    useEffect(() => {
        const loadData = async () => {
            try {
                form.setIsLoading(true)
                form.setError(null)

                const [found] = await Promise.all([
                    fetchConsultantById(id!),
                    form.loadReferenceData(),
                ])

                setConsultant(found)
                form.setName(found.name)
                form.setEmail(found.email)
                form.setWantsNewProject(found.wantsNewProject)
                form.setOpenToRemote(found.openToRemote)
            } catch (err) {
                console.error('Error fetching data:', err)
                form.setError('Kunne ikke laste konsulent. Prøv igjen senere.')
            } finally {
                form.setIsLoading(false)
            }
        }

        loadData()
    }, [id])

    // Availability is derived from active project assignments
    const deactivatedIds = new Set(pendingDeactivations.map(d => d.projectId))
    const removedIds = new Set(pendingRemovals.map(r => r.projectId))
    const existingActiveCount = consultant?.projectAssignments
        ?.filter(p => p.isActive && !deactivatedIds.has(p.projectId) && !removedIds.has(p.projectId))
        .length ?? 0
    const hasActiveProject = (existingActiveCount + form.pendingActiveCount) > 0
    const computedAvailability = !hasActiveProject

    // Edit-specific handlers
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

    const handleSave = async () => {
        if (!consultant) return
        try {
            form.setIsSaving(true)

            // 1. Process pending deactivations
            for (const d of pendingDeactivations) {
                await deactivateProjectAssignment(id!, d.projectId)
            }

            // 2. Process pending removals
            for (const r of pendingRemovals) {
                await removeProjectAssignment(id!, r.projectId)
            }

            // 3. Process pending skill additions
            for (const ps of form.pendingSkills) {
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
            for (const pp of form.pendingProjects) {
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

            // 5. Save basic consultant fields
            await updateConsultant(id!, {
                name: form.name,
                email: form.email,
                yearsOfExperience: consultant.yearsOfExperience,
                wantsNewProject: form.wantsNewProject,
                openToRemote: consultant.openToRemote,
            })

            navigate('/konsulenter')
        } catch (err) {
            console.error('Feil ved lagring:', err)
            alert('Kunne ikke lagre endringene. Prøv igjen senere.')
        } finally {
            form.setIsSaving(false)
        }
    }

    const handleDelete = async () => {
        const confirmed = window.confirm(
            `Er du sikker på at du vil slette ${form.name}? Denne handlingen kan ikke angres.`
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

    // ── Render ──────────────────────────────────────────────

    if (form.isLoading) {
        return (
            <>
                <div className='header'><h1>Rediger Konsulent</h1></div>
                <div className='edit-container'><p>Laster konsulent...</p></div>
            </>
        )
    }

    if (form.error || !consultant) {
        return (
            <>
                <div className='header'><h1>Rediger Konsulent</h1></div>
                <div className='edit-container'>
                    <p className='error-text'>{form.error || 'Konsulent ikke funnet.'}</p>
                    <button className='cancel-button' onClick={() => navigate('/konsulenter')}>Tilbake</button>
                </div>
            </>
        )
    }

    const hasPendingChanges = form.pendingSkills.length > 0
        || form.pendingProjects.length > 0
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
                            <input type='text' value={form.name} onChange={e => form.setName(e.target.value)} />
                        </div>
                        <div className='edit-field'>
                            <label>E-post</label>
                            <input type='email' value={form.email} onChange={e => form.setEmail(e.target.value)} />
                        </div>
                    </div>

                    <div className='edit-row'>
                        <div className='edit-field'>
                            <div className='add-field checkbox-field'>
                                <label>Ledig
                                    <input className='accent-checkbox' type={'checkbox'} checked={computedAvailability} disabled/>
                                </label>
                            </div>
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
                                            <img className= {'delete-image'} src={trash} alt='Slett' onClick={() => handleRemoveProject(p.projectId, p.projectName)} />
                                        </div>
                                    </div>
                                )
                            })}

                            {/* Pending project additions */}
                            {form.pendingProjects.map((pp, i) => (
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
                                        onClick={() => form.handleRemovePendingProject(i)}
                                    >
                                        Fjern
                                    </button>
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
                            {consultant.skills?.map(skill => (
                                <span key={skill.skillId} className='tag'>
                                    {skill.skillName} ({skill.skillYearsOfExperience} år)
                                </span>
                            ))}
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
                        <button className='save-button' onClick={handleSave} disabled={form.isSaving}>
                            {form.isSaving ? 'Lagrer...' : 'Lagre'}
                        </button>
                    </div>
                </div>
            </div>

            <SkillPopup form={form} />
            <ProjectPopup form={form} />
        </>
    )
}

export default EditConsultant
