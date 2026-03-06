import type { useConsultantForm } from './useConsultantForm'

type FormHook = ReturnType<typeof useConsultantForm>

interface SkillPopupProps {
    form: FormHook
}

const SkillPopup = ({ form }: SkillPopupProps) => {
    if (!form.showAddSkillPopup) return null

    return (
        <div className='popup-overlay' onClick={form.resetSkillPopup}>
            <div className='popup-form' onClick={e => e.stopPropagation()}>
                <h4>Legg til kompetanse</h4>

                <div className='popup-field'>
                    <label className='checkbox-label'>
                        <input
                            type='checkbox'
                            checked={form.isCreatingNewSkill}
                            onChange={e => {
                                form.setIsCreatingNewSkill(e.target.checked)
                                form.setSelectedSkillName('')
                                form.setNewSkillName('')
                            }}
                            className='accent-checkbox'
                        />
                        Opprett ny kompetanse
                    </label>
                </div>

                {form.isCreatingNewSkill ? (
                    <>
                        <div className='popup-field'>
                            <label>Navn</label>
                            <input
                                type='text'
                                placeholder='F.eks. Kotlin'
                                value={form.newSkillName}
                                onChange={e => form.setNewSkillName(e.target.value)}
                            />
                        </div>
                        <div className='popup-field'>
                            <label>Synonymer (valgfri, semikolon-separert)</label>
                            <input
                                type='text'
                                placeholder='F.eks. KotlinJVM;Kotlin/JVM'
                                value={form.newSkillSynonyms}
                                onChange={e => form.setNewSkillSynonyms(e.target.value)}
                            />
                        </div>
                    </>
                ) : (
                    <div className='popup-field'>
                        <label>Kompetanse</label>
                        <select
                            value={form.selectedSkillName}
                            onChange={e => form.setSelectedSkillName(e.target.value)}
                        >
                            <option value=''>Velg kompetanse...</option>
                            {form.availableSkillNames.map(name => (
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
                        value={form.skillYears}
                        onChange={e => {
                            const value = parseInt(e.target.value, 10)
                            form.setSkillYears(Number.isNaN(value) || value < 0 ? 0 : value)
                        }}
                    />
                </div>

                <div className='popup-actions'>
                    <button className='cancel-button' onClick={form.resetSkillPopup}>Avbryt</button>
                    <button
                        className='save-button'
                        onClick={form.handleAddSkill}
                        disabled={!form.skillPopupValid}
                    >
                        Legg til
                    </button>
                </div>
            </div>
        </div>
    )
}

export default SkillPopup
