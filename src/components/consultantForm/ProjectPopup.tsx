import type { useConsultantForm } from './useConsultantForm'
import MultiSelectDropdown from '../multiSelectDropdown/multiSelectDropdown'

type FormHook = ReturnType<typeof useConsultantForm>

interface ProjectPopupProps {
    form: FormHook
}

const ProjectPopup = ({ form }: ProjectPopupProps) => {
    if (!form.showAddProjectPopup) return null

    return (
        <div className='popup-overlay' onClick={form.resetProjectPopup}>
            <div className='popup-form' onClick={e => e.stopPropagation()}>
                <h4>Tildel prosjekt</h4>

                <div className='popup-field'>
                    <label className='checkbox-label'>
                        <input
                            type='checkbox'
                            checked={form.isCreatingNewProject}
                            onChange={e => {
                                form.setIsCreatingNewProject(e.target.checked)
                                form.setSelectedProjectId('')
                                form.setNewProjectName('')
                            }}
                            className='accent-checkbox'
                        />
                        Opprett nytt prosjekt
                    </label>
                </div>

                {form.isCreatingNewProject ? (
                    <>
                        <div className='popup-field'>
                            <label>Prosjektnavn</label>
                            <input
                                type='text'
                                placeholder='F.eks. Mobile App Redesign'
                                value={form.newProjectName}
                                onChange={e => form.setNewProjectName(e.target.value)}
                            />
                        </div>
                        <div className='popup-field'>
                            <label>Bedrift (valgfri)</label>
                            <select
                                value={form.newProjectCompanyId}
                                onChange={e => form.setNewProjectCompanyId(e.target.value)}
                            >
                                <option value=''>Ingen bedrift</option>
                                {form.allCompanies.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className='popup-field'>
                            <label>Prosjekt startdato (valgfri)</label>
                            <input
                                type='date'
                                value={form.newProjectStartDate}
                                onChange={e => form.setNewProjectStartDate(e.target.value)}
                            />
                        </div>
                        <div className='popup-field'>
                            <label>Prosjekt sluttdato (valgfri)</label>
                            <input
                                type='date'
                                value={form.newProjectEndDate}
                                onChange={e => form.setNewProjectEndDate(e.target.value)}
                            />
                            {!form.projectDatesValid && (
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
                            value={form.selectedProjectId}
                            onChange={e => form.setSelectedProjectId(e.target.value)}
                        >
                            <option value=''>Velg prosjekt...</option>
                            {form.availableProjects.map(p => (
                                <option key={p.id} value={p.id}>
                                    {p.name} {p.company ? `(${p.company.name})` : ''}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <hr className='popup-divider' />

                <MultiSelectDropdown
                    label='Rolle'
                    placeholder='F.eks. Backend Developer'
                    options={form.roleOptions}
                    selected={form.assignRole ? [form.assignRole] : []}
                    onAdd={(value) => form.setAssignRole(value)}
                    onRemove={() => form.setAssignRole('')}
                />

                <div className='popup-field'>
                    <label>Allokering (%)</label>
                    <input
                        type='number'
                        min={0}
                        max={100}
                        value={form.assignAllocation}
                        onChange={e => {
                            const raw = Number(e.target.value);
                            const sanitized = Number.isNaN(raw) ? 0 : Math.min(100, Math.max(0, raw));
                            form.setAssignAllocation(sanitized);
                        }}
                    />
                </div>
                <div className='popup-field'>
                    <label>Status</label>
                    <select
                        value={form.assignIsActive ? 'active' : 'inactive'}
                        onChange={e => form.setAssignIsActive(e.target.value === 'active')}
                    >
                        <option value='active'>Aktiv</option>
                        <option value='inactive'>Tidligere</option>
                    </select>
                </div>
                <div className='popup-field'>
                    <label>Tildeling startdato (valgfri)</label>
                    <input
                        type='date'
                        value={form.assignStartDate}
                        onChange={e => form.setAssignStartDate(e.target.value)}
                    />
                </div>
                <div className='popup-field'>
                    <label>Tildeling sluttdato (valgfri)</label>
                    <input
                        type='date'
                        value={form.assignEndDate}
                        onChange={e => form.setAssignEndDate(e.target.value)}
                    />
                    {!form.assignDatesValid && (
                        <span className='validation-error'>
                            Sluttdato kan ikke være før startdato
                        </span>
                    )}
                </div>

                <div className='popup-actions'>
                    <button className='cancel-button' onClick={form.resetProjectPopup}>Avbryt</button>
                    <button
                        className='save-button'
                        onClick={form.handleAssignProject}
                        disabled={!form.projectPopupValid}
                    >
                        Tildel
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ProjectPopup
