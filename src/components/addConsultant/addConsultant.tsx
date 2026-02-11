import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Consultant } from '../../types/consultant'
import './addConsultant.css'
import MultiSelectDropdown from '../multiSelectDropdown/multiSelectDropdown'
import type { Prosjekt } from '../../types/consultant'

/**
 * BACKEND: Ved lagring, send POST til API:
 *   await fetch('/api/konsulenter', {
 *       method: 'POST',
 *       headers: { 'Content-Type': 'application/json' },
 *       body: JSON.stringify(nyKonsulent)
 *   })
 */

// BACKEND: Disse options-listene skal hentes fra backend API
// Eksempel: const kompetanseOptions = await fetch('/api/kompetanse').then(r => r.json())
const kompetanseOptions = ['React', 'TypeScript', 'Java', 'Python', 'C#', 'JavaScript', 'SQL', 'Azure', 'AWS']


const AddConsultant = () => {
    const navigate = useNavigate()
    const [navn, setNavn] = useState('')
    const [epost, setEpost] = useState('')
    const [kompetanseList, setKompetanseList] = useState<string[]>([])
    const [ledighet, setLedighet] = useState<'ledig' | 'ikke-ledig'>('ledig')
    const [onskerABytte, setOnskerABytte] = useState(false)
    const [prosjekter, setProsjekter] = useState<Prosjekt[]>([])
    const [showProsjektPopup, setShowProsjektPopup] = useState(false)
    const [nyttProsjekt, setNyttProsjekt] = useState<Prosjekt>({ navn: '', rolle: '', periode: '' })
    

    const handleSave = () => {
        const nyKonsulent: Omit<Consultant, 'id'> = {
            navn,
            epost,
            kompetanse: kompetanseList,
            tidligereProsjekter: prosjekter,
            ledighet,
            onskerABytte,
        }
        console.log('Ny konsulent:', nyKonsulent)
        // BACKEND: Erstatt med POST API-kall, backend genererer ID
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
                <h1>Legg til Konsulent</h1>
            </div>
            <div className='add-container'>
                <div className='add-form'>
                    <div className='add-row'>
                        <div className='add-field'>
                            <label>Navn</label>
                            <input type='text' placeholder='Fullt navn...' value={navn} onChange={e => setNavn(e.target.value)} />
                        </div>
                        <div className='add-field'>
                            <label>E-post</label>
                            <input type='email' placeholder='epost@accenture.com' value={epost} onChange={e => setEpost(e.target.value)} />
                        </div>
                    </div>

                    <div className='add-row'>
                        <div className='add-field'>
                            <label>Ledighet</label>
                            <select value={ledighet} onChange={e => setLedighet(e.target.value as 'ledig' | 'ikke-ledig')}>
                                <option value='ledig'>Ledig</option>
                                <option value='ikke-ledig'>Ikke ledig</option>
                            </select>
                        </div>
                        <div className='add-field'>
                            <label>Ønsker å bytte</label>
                            <select value={onskerABytte ? 'ja' : 'nei'} onChange={e => setOnskerABytte(e.target.value === 'ja')}>
                                <option value='ja'>Ja</option>
                                <option value='nei'>Nei</option>
                            </select>
                        </div>
                    </div>

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
                    
                    <div className='edit-searchbar'>
                            <MultiSelectDropdown
                        label='Kompetanse'
                        placeholder='Søk kompetanse...'
                        options={kompetanseOptions}
                        selected={kompetanseList}
                        onAdd={(v) => setKompetanseList([...kompetanseList, v])}
                        onRemove={(v) => setKompetanseList(kompetanseList.filter(i => i !== v))}
                    />
                    </div>

                    <div className='add-actions'>
                        <button className='cancel-button' onClick={() => navigate('/konsulenter')}>Avbryt</button>
                        <button className='save-button' onClick={handleSave}>Legg til</button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default AddConsultant
