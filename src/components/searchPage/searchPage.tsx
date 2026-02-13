import { useState, useEffect } from 'react'
import './searchPage.css'
import '../../global.css'
import type { Consultant } from '../../types/consultant'
import { mockKonsulenter } from '../../data/mockData'
import ResultList from '../resultList/resultList'
import MultiSelectDropdown from '../multiSelectDropdown/multiSelectDropdown'
import { 
  fetchSkills, 
  fetchConsultants, 
  fetchProjects,
  extractUniqueRoles,
  extractProjectRoles 
} from '../../data/api'

const SearchPage = () => {
    // Filter options from backend
    const [kompetanseOptions, setKompetanseOptions] = useState<string[]>([])
    const [erfaringOptions, setErfaringOptions] = useState<string[]>([])
    const [rolleOptions, setRolleOptions] = useState<string[]>([])
    const [isLoadingOptions, setIsLoadingOptions] = useState(true)
    const [optionsError, setOptionsError] = useState<string | null>(null)

    // Filter states
    const [kompetanseList, setKompetanseList] = useState<string[]>([])
    const [tidFra, setTidFra] = useState('')
    const [tidTil, setTidTil] = useState('')
    const [ledighet, setLedighet] = useState('')
    const [onskerABytte, setOnskerABytte] = useState('')
    const [erfaringList, setErfaringList] = useState<string[]>([])
    const [rolleList, setRolleList] = useState<string[]>([])

    // Search results
    const [resultater, setResultater] = useState<Consultant[] | null>(null)

    // Fetch filter options on component mount
    useEffect(() => {
        const loadFilterOptions = async () => {
            try {
                setIsLoadingOptions(true)
                setOptionsError(null)

                // Fetch all data in parallel
                const [skills, consultants, projects] = await Promise.all([
                    fetchSkills(),
                    fetchConsultants(),
                    fetchProjects()
                ])

                // Set kompetanse options from skills
                setKompetanseOptions(skills.map(skill => skill.name).sort())

                // Extract unique roles from consultant experience (for "Tidligere erfaring")
                const consultantRoles = extractUniqueRoles(consultants)
                setErfaringOptions(consultantRoles)

                // Extract unique roles from project requirements (for "Rolle")
                const projectRoles = extractProjectRoles(projects)
                setRolleOptions(projectRoles)

            } catch (error) {
                console.error('Error loading filter options:', error)
                setOptionsError('Kunne ikke laste filteralternativer. Prøv igjen senere.')
            } finally {
                setIsLoadingOptions(false)
            }
        }

        loadFilterOptions()
    }, [])

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
         */

        let filtrert = [...mockKonsulenter]

        if (kompetanseList.length > 0) {
            filtrert = filtrert.filter(k =>
                kompetanseList.some(komp => k.kompetanse.includes(komp))
            )
        }

        if (ledighet) {
            filtrert = filtrert.filter(k => k.ledighet === ledighet)
        }

        if (onskerABytte) {
            filtrert = filtrert.filter(k =>
                onskerABytte === 'ja' ? k.onskerABytte : !k.onskerABytte
            )
        }

        if (rolleList.length > 0) {
            filtrert = filtrert.filter(k =>
                k.tidligereProsjekter.some(p => rolleList.includes(p.rolle))
            )
        }

        if (erfaringList.length > 0) {
            filtrert = filtrert.filter(k =>
                erfaringList.some(erfaring =>
                    k.tidligereProsjekter.some(p =>
                        p.navn.toLowerCase().includes(erfaring.toLowerCase())
                    )
                )
            )
        }

        setResultater(filtrert)
    }

    // Show loading state while fetching options
    if (isLoadingOptions) {
        return (
            <>
                <div className='header'>
                    <h1>Accenture Staffing</h1>
                </div>
                <div className='sub-header'>
                    <h2>Laster søkealternativer...</h2>
                </div>
            </>
        )
    }

    // Show error state if loading failed
    if (optionsError) {
        return (
            <>
                <div className='header'>
                    <h1>Accenture Staffing</h1>
                </div>
                <div className='sub-header'>
                    <h2>Feil ved lasting</h2>
                    <p style={{ color: 'red' }}>{optionsError}</p>
                </div>
            </>
        )
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

        {resultater !== null && <ResultList resultater={resultater} />}
        </>
    );
}

export default SearchPage;