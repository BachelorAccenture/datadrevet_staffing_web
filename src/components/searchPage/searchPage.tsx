import { useState} from 'react'
import './searchPage.css'
import '../../global.css'
import type { Consultant } from '../../types/consultant'
import { mockKonsulenter } from '../../data/mockData'
import ResultList from '../resultList/resultList'
import MultiSelectDropdown from '../multiSelectDropdown/multiSelectDropdown'


// BACKEND: Disse options-listene skal hentes fra backend API
// Eksempel: const kompetanseOptions = await fetch('/api/kompetanse').then(r => r.json())
const kompetanseOptions = ['React', 'TypeScript', 'Java', 'Python', 'C#', 'JavaScript', 'SQL', 'Azure', 'AWS']
const erfaringOptions = ['Konsulent', 'Prosjektleder', 'Utvikler', 'Arkitekt', 'Tester', 'Scrum Master']
const rolleOptions = ['Frontend', 'Backend', 'Fullstack', 'DevOps', 'Tech Lead', 'UX Designer']


const SearchPage = () => {
    const [kompetanseList, setKompetanseList] = useState<string[]>([])
    const [tidFra, setTidFra] = useState('')
    const [tidTil, setTidTil] = useState('')
    const [ledighet, setLedighet] = useState('')
    const [onskerABytte, setOnskerABytte] = useState('')
    const [erfaringList, setErfaringList] = useState<string[]>([])
    const [rolleList, setRolleList] = useState<string[]>([])

    // Resultater vises kun etter bruker har trykket "Søk"
    const [resultater, setResultater] = useState<Consultant[] | null>(null)

    const handleSok = () => {
        /**
         * BACKEND: Erstatt hele denne filtreringslogikken med et API-kall.
         * 
         * Eksempel:
         *   const response = await fetch('/api/konsulenter/search', {
         *       method: 'POST',
         *       headers: { 'Content-Type': 'application/json' },
         *       body: JSON.stringify({
         *           kompetanse: kompetanseList,
         *           tidFra, tidTil, ledighet,
         *           onskerABytte, tidligereErfaring: erfaringList, rolle: rolleList
         *       })
         *   })
         *   const data: Konsulent[] = await response.json()
         *   setResultater(data)
         * 
         * All filtrering under kan da fjernes — backend håndterer det.
         */

        let filtrert = [...mockKonsulenter]

        // Filtrer på kompetanse: konsulenten må ha minst én matchende kompetanse
        if (kompetanseList.length > 0) {
            filtrert = filtrert.filter(k =>
                kompetanseList.some(komp => k.kompetanse.includes(komp))
            )
        }

        // Filtrer på ledighet
        if (ledighet) {
            filtrert = filtrert.filter(k => k.ledighet === ledighet)
        }

        // Filtrer på ønsker å bytte
        if (onskerABytte) {
            filtrert = filtrert.filter(k =>
                onskerABytte === 'ja' ? k.onskerABytte : !k.onskerABytte
            )
        }

        // Filtrer på rolle (sjekker rollene i konsulentens prosjekter)
        if (rolleList.length > 0) {
            filtrert = filtrert.filter(k =>
                k.tidligereProsjekter.some(p => rolleList.includes(p.rolle))
            )
        }

        // Filtrer på tidligere erfaring (sjekker om prosjektnavn inneholder søketeksten)
        if (erfaringList.length > 0) {
            filtrert = filtrert.filter(k =>
                erfaringList.some(erfaring =>
                    k.tidligereProsjekter.some(p =>
                        p.navn.toLowerCase().includes(erfaring.toLowerCase())
                    )
                )
            )
        }

        // BACKEND: tidFra/tidTil filtrering skjer på backend
        // (mock data har ikke datoer, så vi hopper over det her)

        setResultater(filtrert)
    }

    return (
        <>
        <div className='header'>
           <h1>Accenture Staffing</h1>
        </div>
        <div className='sub-header'>
            <h2>Søk etter konsulenter</h2>
        </div>
        <div className='search-box'>
            <div className='filters'>
                <div className='filter-row'>
                    <MultiSelectDropdown
                        label='Kompetanse'
                        placeholder='Søk kompetanse...'
                        options={kompetanseOptions}
                        selected={kompetanseList}
                        onAdd={(v) => setKompetanseList([...kompetanseList, v])}
                        onRemove={(v) => setKompetanseList(kompetanseList.filter(i => i !== v))}
                    />

                    <div className='filter-group'>
                        <label>Tid fra</label>
                        <input
                            type='date'
                            value={tidFra}
                            onChange={(e) => setTidFra(e.target.value)}
                        />
                    </div>

                    <div className='filter-group'>
                        <label>Tid til</label>
                        <input
                            type='date'
                            value={tidTil}
                            onChange={(e) => setTidTil(e.target.value)}
                        />
                    </div>

                    <div className='filter-group'>
                        <label>Ledighet</label>
                        <select value={ledighet} onChange={(e) => setLedighet(e.target.value)}>
                            <option value=''>Velg...</option>
                            <option value='ledig'>Ledig</option>
                            <option value='ikke-ledig'>Ikke ledig</option>
                        </select>
                    </div>
                </div>

                <div className='filter-row'>
                    <div className='filter-group'>
                        <label>Ønsker å bytte</label>
                        <select value={onskerABytte} onChange={(e) => setOnskerABytte(e.target.value)}>
                            <option value=''>Velg...</option>
                            <option value='ja'>Ja</option>
                            <option value='nei'>Nei</option>
                        </select>
                    </div>

                    <MultiSelectDropdown
                        label='Tidligere erfaring'
                        placeholder='Søk erfaring...'
                        options={erfaringOptions}
                        selected={erfaringList}
                        onAdd={(v) => setErfaringList([...erfaringList, v])}
                        onRemove={(v) => setErfaringList(erfaringList.filter(i => i !== v))}
                    />

                    <MultiSelectDropdown
                        label='Rolle'
                        placeholder='Søk rolle...'
                        options={rolleOptions}
                        selected={rolleList}
                        onAdd={(v) => setRolleList([...rolleList, v])}
                        onRemove={(v) => setRolleList(rolleList.filter(i => i !== v))}
                    />
                </div>

                <div className='filter-actions'>
                    <button className='sok-button' onClick={handleSok}>Søk</button>
                </div>
            </div>
        </div>

        {/* Resultatlisten vises kun etter bruker har trykket Søk */}
        {resultater !== null && <ResultList resultater={resultater} />}
        </>
    );
}

export default SearchPage;