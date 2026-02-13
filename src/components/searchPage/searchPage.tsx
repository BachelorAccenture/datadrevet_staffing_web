import { useState, useEffect } from 'react'
import './searchPage.css'
import '../../global.css'
import ResultList from '../resultList/resultList'
import MultiSelectDropdown from '../multiSelectDropdown/multiSelectDropdown'
import { 
  fetchSkills, 
  fetchConsultants, 
  fetchProjects,
  extractUniqueRoles,
  extractProjectRoles,
  searchConsultants,
  type Consultant
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

    // Search results and loading states
    const [results, setResults] = useState<Consultant[] | null>(null)
    const [isSearching, setIsSearching] = useState(false)
    const [searchError, setSearchError] = useState<string | null>(null)

    // Fetch filter options on component mount
    useEffect(() => {
        const loadFilterOptions = async () => {
            try {
                setIsLoadingOptions(true)
                setOptionsError(null)

                const [skills, consultants, projects] = await Promise.all([
                    fetchSkills(),
                    fetchConsultants(),
                    fetchProjects()
                ])

                setSkillsOptions(skills.map(skill => skill.name).sort())
                setExperienceOptions(extractUniqueRoles(consultants))
                setRoleOptions(extractProjectRoles(projects))

            } catch (error) {
                console.error('Error loading filter options:', error)
                setOptionsError('Kunne ikke laste filteralternativer. Prøv igjen senere.')
            } finally {
                setIsLoadingOptions(false)
            }
        }

        loadFilterOptions()
    }, [])

    const handleSearch = async () => {
        try {
            setIsSearching(true)
            setSearchError(null)

            // Build search filters
            const filters: any = {}
            
            if (selectedSkills.length > 0) {
                filters.skillNames = selectedSkills
            }
            
            if (selectedRoles.length > 0) {
                // Backend accepts single role parameter
                filters.role = selectedRoles[0]
            }
            
            // You can add minYearsOfExperience if you have that filter
            // filters.minYearsOfExperience = 0

            // Call backend search API
            const searchResults = await searchConsultants(filters)
            
            // Filter results client-side for fields not supported by backend
            let filtered = searchResults

            // Filter by availability (map to backend field)
            if (availability === 'ledig') {
                filtered = filtered.filter(c => c.availability === true)
            } else if (availability === 'ikke-ledig') {
                filtered = filtered.filter(c => c.availability === false)
            }

            // Filter by wants to switch
            if (wantsToSwitch === 'ja') {
                filtered = filtered.filter(c => c.wantsNewProject === true)
            } else if (wantsToSwitch === 'nei') {
                filtered = filtered.filter(c => c.wantsNewProject === false)
            }

            setResults(filtered)

        } catch (error) {
            console.error('Search error:', error)
            setSearchError('Søket feilet. Prøv igjen senere.')
            setResults([])
        } finally {
            setIsSearching(false)
        }
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
                    <button 
                        className='sok-button' 
                        onClick={handleSearch}
                        disabled={isSearching}
                    >
                        {isSearching ? 'Søker...' : 'Søk'}
                    </button>
                </div>

                {searchError && (
                    <p style={{ color: 'red', marginTop: '1em' }}>{searchError}</p>
                )}
            </div>
        </div>

        {results !== null && <ResultList results={results} />}
        </>
    );
}

export default SearchPage;