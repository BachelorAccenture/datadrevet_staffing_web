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
    const [skillsOptions, setSkillsOptions] = useState<string[]>([])
    const [experienceOptions, setExperienceOptions] = useState<string[]>([])
    const [roleOptions, setRoleOptions] = useState<string[]>([])
    const [isLoadingOptions, setIsLoadingOptions] = useState(true)
    const [optionsError, setOptionsError] = useState<string | null>(null)

    // Filter states
    const [selectedSkills, setSelectedSkills] = useState<string[]>([])
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [availability, setAvailability] = useState('')
    const [wantsToSwitch, setWantsToSwitch] = useState('')
    const [selectedExperience, setSelectedExperience] = useState<string[]>([])
    const [selectedRoles, setSelectedRoles] = useState<string[]>([])

    // Search results
    const [results, setResults] = useState<Consultant[] | null>(null)

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

                // Set skills options
                setSkillsOptions(skills.map(skill => skill.name).sort())

                // Extract unique roles from consultant experience
                const consultantRoles = extractUniqueRoles(consultants)
                setExperienceOptions(consultantRoles)

                // Extract unique roles from project requirements
                const projectRoles = extractProjectRoles(projects)
                setRoleOptions(projectRoles)

            } catch (error) {
                console.error('Error loading filter options:', error)
                setOptionsError('Kunne ikke laste filteralternativer. Prøv igjen senere.')
            } finally {
                setIsLoadingOptions(false)
            }
        }

        loadFilterOptions()
    }, [])

    const handleSearch = () => {
        /**
         * BACKEND: Replace this entire filtering logic with an API call.
         * 
         * Example:
         *   const response = await fetch('/api/consultants/search', {
         *       method: 'POST',
         *       headers: { 'Content-Type': 'application/json' },
         *       body: JSON.stringify({
         *           skills: selectedSkills,
         *           startDate, endDate, availability,
         *           wantsToSwitch, experience: selectedExperience, roles: selectedRoles
         *       })
         *   })
         *   const data: Consultant[] = await response.json()
         *   setResults(data)
         */

        let filtered = [...mockKonsulenter]

        if (selectedSkills.length > 0) {
            filtered = filtered.filter(consultant =>
                selectedSkills.some(skill => consultant.kompetanse.includes(skill))
            )
        }

        if (availability) {
            filtered = filtered.filter(consultant => consultant.ledighet === availability)
        }

        if (wantsToSwitch) {
            filtered = filtered.filter(consultant =>
                wantsToSwitch === 'ja' ? consultant.onskerABytte : !consultant.onskerABytte
            )
        }

        if (selectedRoles.length > 0) {
            filtered = filtered.filter(consultant =>
                consultant.tidligereProsjekter.some(project => selectedRoles.includes(project.rolle))
            )
        }

        if (selectedExperience.length > 0) {
            filtered = filtered.filter(consultant =>
                selectedExperience.some(experience =>
                    consultant.tidligereProsjekter.some(project =>
                        project.navn.toLowerCase().includes(experience.toLowerCase())
                    )
                )
            )
        }

        setResults(filtered)
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
                        options={skillsOptions}
                        selected={selectedSkills}
                        onAdd={(value) => setSelectedSkills([...selectedSkills, value])}
                        onRemove={(value) => setSelectedSkills(selectedSkills.filter(item => item !== value))}
                    />

                    <div className='filter-group'>
                        <label>Tid fra</label>
                        <input
                            type='date'
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>

                    <div className='filter-group'>
                        <label>Tid til</label>
                        <input
                            type='date'
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>

                    <div className='filter-group'>
                        <label>Ledighet</label>
                        <select value={availability} onChange={(e) => setAvailability(e.target.value)}>
                            <option value=''>Velg...</option>
                            <option value='ledig'>Ledig</option>
                            <option value='ikke-ledig'>Ikke ledig</option>
                        </select>
                    </div>
                </div>

                <div className='filter-row'>
                    <div className='filter-group'>
                        <label>Ønsker å bytte</label>
                        <select value={wantsToSwitch} onChange={(e) => setWantsToSwitch(e.target.value)}>
                            <option value=''>Velg...</option>
                            <option value='ja'>Ja</option>
                            <option value='nei'>Nei</option>
                        </select>
                    </div>

                    <MultiSelectDropdown
                        label='Tidligere erfaring'
                        placeholder='Søk erfaring...'
                        options={experienceOptions}
                        selected={selectedExperience}
                        onAdd={(value) => setSelectedExperience([...selectedExperience, value])}
                        onRemove={(value) => setSelectedExperience(selectedExperience.filter(item => item !== value))}
                    />

                    <MultiSelectDropdown
                        label='Rolle'
                        placeholder='Søk rolle...'
                        options={roleOptions}
                        selected={selectedRoles}
                        onAdd={(value) => setSelectedRoles([...selectedRoles, value])}
                        onRemove={(value) => setSelectedRoles(selectedRoles.filter(item => item !== value))}
                    />
                </div>

                <div className='filter-actions'>
                    <button className='sok-button' onClick={handleSearch}>Søk</button>
                </div>
            </div>
        </div>

        {results !== null && <ResultList resultater={results} />}
        </>
    );
}

export default SearchPage;