import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Consultant, Prosjekt } from '../../types/consultant'
import './editConsultant.css'
import MultiSelectDropdown from '../multiSelectDropdown/multiSelectDropdown'


// BACKEND: Disse options-listene skal hentes fra backend API
// Eksempel: const kompetanseOptions = await fetch('/api/kompetanse').then(r => r.json())
const kompetanseOptions = ['React', 'TypeScript', 'Java', 'Python', 'C#', 'JavaScript', 'SQL', 'Azure', 'AWS']


/**
 * BACKEND: Denne siden skal hente konsulenten via API basert på ID fra URL.
 * Eksempel:
 *   const { id } = useParams()
 *   useEffect(() => {
 *       fetch(`/api/konsulenter/${id}`)
 *           .then(r => r.json())
 *           .then(data => setKonsulent(data))
 *   }, [id])
 * 
 * Ved lagring:
 *   await fetch(`/api/konsulenter/${id}`, {
 *       method: 'PUT',
 *       headers: { 'Content-Type': 'application/json' },
 *       body: JSON.stringify(konsulent)
 *   })
 */

interface EditConsultantProps {
    konsulent: Consultant
}

const EditConsultant = ({ konsulent: initial }: EditConsultantProps) => {
    const navigate = useNavigate()
    const [navn, setNavn] = useState(initial.navn)
    const [epost, setEpost] = useState(initial.epost)
    const [kompetanse, setKompetanse] = useState<string[]>(initial.kompetanse)
    const [ledighet, setLedighet] = useState(initial.ledighet)
    const [onskerABytte, setOnskerABytte] = useState(initial.onskerABytte)
    const [prosjekter, setProsjekter] = useState<Prosjekt[]>(initial.tidligereProsjekter)
    const [showProsjektPopup, setShowProsjektPopup] = useState(false)
    const [nyttProsjekt, setNyttProsjekt] = useState<Prosjekt>({ navn: '', rolle: '', periode: '' })

    const handleSave = () => {
        const updated: Consultant = {
            ...initial,
            navn,
            epost,
            kompetanse,
            tidligereProsjekter: prosjekter,
            ledighet,
            onskerABytte,
        }
        console.log('Lagrer konsulent:', updated)
        // BACKEND: Erstatt med PUT API-kall
        navigate('/konsulenter')
    }

    const handleDelete = () => {
        console.log('Sletter konsulent med ID:', initial.id)
        // BACKEND: Erstatt med DELETE API-kall
        navigate('/konsulenter')
    }

    const handleAddProsjekt = () => {
        if (!nyttProsjekt.navn.trim() || !nyttProsjekt.rolle.trim() || !nyttProsjekt.periode.trim()) return
        setProsjekter([...prosjekter, nyttProsjekt])
        setNyttProsjekt({ navn: '', rolle: '', periode: '' })
        setShowProsjektPopup(false)
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
                            <input type='text' value={navn} onChange={e => setNavn(e.target.value)} />
                        </div>
                        <div className='edit-field'>
                            <label>E-post</label>
                            <input type='email' value={epost} onChange={e => setEpost(e.target.value)} />
                        </div>
                    </div>

                    <div className='edit-row'>
                        <div className='edit-field'>
                            <label>Ledighet</label>
                            <select value={ledighet} onChange={e => setLedighet(e.target.value as 'ledig' | 'ikke-ledig')}>
                                <option value='ledig'>Ledig</option>
                                <option value='ikke-ledig'>Ikke ledig</option>
                            </select>
                        </div>
                        <div className='edit-field'>
                            <label>Ønsker å bytte</label>
                            <select value={onskerABytte ? 'ja' : 'nei'} onChange={e => setOnskerABytte(e.target.value === 'ja')}>
                                <option value='ja'>Ja</option>
                                <option value='nei'>Nei</option>
                            </select>
                        </div>
                    </div>

                    <div className='edit-section'>
                        <label className='section-label'>Tidligere prosjekter</label>
                        <div className='project-list-edit'>
                            {prosjekter.map((p, i) => (
                                <div key={i} className='project-item-edit'>
                                    <button className='remove-project-btn' onClick={() => setProsjekter(prosjekter.filter((_, idx) => idx !== i))}>×</button>
                                    <span className='project-name-edit'>{p.navn}</span>
                                    <span className='project-rolle-edit'>{p.rolle} ({p.periode})</span>
                                </div>
                            ))}
                            <button className='add-project-btn' onClick={() => setShowProsjektPopup(true)}>+ Legg til</button>
                        </div>

                        {showProsjektPopup && (
                            <div className='popup-overlay' onClick={() => setShowProsjektPopup(false)}>
                                <div className='popup-form' onClick={e => e.stopPropagation()}>
                                    <h4>Legg til prosjekt</h4>
                                    <div className='popup-field'>
                                        <label>Arbeidsgiver / Prosjekt</label>
                                        <input type='text' placeholder='F.eks. DNB Nettbank Redesign' value={nyttProsjekt.navn} onChange={e => setNyttProsjekt({ ...nyttProsjekt, navn: e.target.value })} />
                                    </div>
                                    <div className='popup-field'>
                                        <label>Rolle</label>
                                        <input type='text' placeholder='F.eks. Frontend' value={nyttProsjekt.rolle} onChange={e => setNyttProsjekt({ ...nyttProsjekt, rolle: e.target.value })} />
                                    </div>
                                    <div className='popup-field'>
                                        <label>Årstall / Periode</label>
                                        <input type='text' placeholder='F.eks. 2021-2023' value={nyttProsjekt.periode} onChange={e => setNyttProsjekt({ ...nyttProsjekt, periode: e.target.value })} />
                                    </div>
                                    <div className='popup-actions'>
                                        <button className='cancel-button' onClick={() => setShowProsjektPopup(false)}>Avbryt</button>
                                        <button className='save-button' onClick={handleAddProsjekt}>Legg til</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className='edit-row'>
                        <div className='edit-searchbar'>
                            <MultiSelectDropdown
                            label='Kompetanse'
                            placeholder='Legg til kompetanse...'
                            options={kompetanseOptions}
                            selected={kompetanse}
                            onAdd={(v) => setKompetanse([...kompetanse, v])}
                            onRemove={(v) => setKompetanse(kompetanse.filter(k => k !== v))}
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
