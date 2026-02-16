import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { type Consultant, fetchConsultantById, deleteConsultant } from '../../data/api'
import './editConsultant.css'
import MultiSelectDropdown from '../multiSelectDropdown/multiSelectDropdown'


// BACKEND: Disse options-listene skal hentes fra backend API
// Eksempel: const kompetanseOptions = await fetch('/api/kompetanse').then(r => r.json())
const kompetanseOptions = ['React', 'TypeScript', 'Java', 'Python', 'C#', 'JavaScript', 'SQL', 'Azure', 'AWS']


const EditConsultant = () => {
    const navigate = useNavigate()
    const { id } = useParams()
    const [consultant, setConsultant] = useState<Consultant | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [skills, setSkills] = useState<string[]>([])
    const [availability, setAvailability] = useState(true)
    const [wantsNewProject, setWantsNewProject] = useState(false)

    // Fetch consultant by ID on mount
    useEffect(() => {
        const loadConsultant = async () => {
            try {
                setIsLoading(true)
                setError(null)
                const found = await fetchConsultantById(id!)
                setConsultant(found)
                setName(found.name)
                setEmail(found.email)
                setSkills(found.skills?.map(s => s.skillName) ?? [])
                setAvailability(found.availability)
                setWantsNewProject(found.wantsNewProject)
            } catch (err) {
                console.error('Error fetching consultant:', err)
                setError('Kunne ikke laste konsulent. Prøv igjen senere.')
            } finally {
                setIsLoading(false)
            }
        }

        loadConsultant()
    }, [id])

    const handleSave = () => {
        if (!consultant) return
        const updated = {
            ...consultant,
            name,
            email,
            availability,
            wantsNewProject,
        }
        console.log('Lagrer konsulent:', updated)
        // BACKEND: Erstatt med PUT API-kall
        // await fetch(`${API_BASE_URL}/consultants/${id}`, {
        //     method: 'PUT',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(updated)
        // })
        navigate('/konsulenter')
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

                    <div className='edit-section'>
                        <label className='section-label'>Prosjekter</label>
                        <div className='project-list-edit'>
                            {consultant.projectAssignments?.map((p, i) => (
                                <div key={i} className='project-item-edit'>
                                    <span className='project-name-edit'>{p.projectName}</span>
                                    <span className='project-rolle-edit'>{p.role} {p.isActive ? '(Aktiv)' : '(Tidligere)'}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className='edit-row'>
                        <div className='edit-searchbar'>
                            <MultiSelectDropdown
                            label='Kompetanse'
                            placeholder='Legg til kompetanse...'
                            options={kompetanseOptions}
                            selected={skills}
                            onAdd={(v) => setSkills([...skills, v])}
                            onRemove={(v) => setSkills(skills.filter(k => k !== v))}
                        />
                        </div>
                    </div>

                    <div className='edit-actions'>
                        <button className='cancel-button' onClick={() => navigate('/konsulenter')}>Avbryt</button>
                        <button className='delete-button' onClick={handleDelete}>Slett</button>
                        <button className='save-button' onClick={handleSave}>Lagre</button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default EditConsultant
