import { useState, useEffect } from 'react'
import './searchPage.css'
import '../../global.css'
import ResultList from '../resultList/resultList'
import MultiSelectDropdown from '../multiSelectDropdown/multiSelectDropdown'
import { 
  fetchSkills, 
  fetchCompanies,
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
    const [companyOptions, setCompanyOptions] = useState<string[]>([])
    const [roleOptions, setRoleOptions] = useState<string[]>([])
    const [isLoadingOptions, setIsLoadingOptions] = useState(true)
    const [optionsError, setOptionsError] = useState<string | null>(null)

    // Filter states
    const [selectedSkills, setSelectedSkills] = useState<string[]>([])
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [availability, setAvailability] = useState('')
    const [wantsToSwitch, setWantsToSwitch] = useState('')
    const [selectedCompanies, setSelectedCompanies] = useState<string[]>([])
    const [selectedRoles, setSelectedRoles] = useState<string[]>([])
    const [openToRemote, setOpenToRemote] = useState('')

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

                const [skills, companies, consultants, projects] = await Promise.all([
                    fetchSkills(),
                    fetchCompanies(),
                    fetchConsultants(),
                    fetchProjects()
                ])

                setSkillsOptions(skills.map(skill => skill.name).sort())
                setCompanyOptions(companies.map(company => company.name).sort())
                setRoleOptions(extractUniqueRoles(consultants))

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

            // Build search filters - all filtering happens in backend now
            const filters: any = {}
            
            // Skills filter
            if (selectedSkills.length > 0) {
                filters.skillNames = selectedSkills
            }
            
            // Roles filter - now supports multiple roles
            if (selectedRoles.length > 0) {
                filters.role = selectedRoles[0] // Backend currently supports single role search
            }
            
            // Previous experience/companies filter
            if (selectedCompanies.length > 0) {
                filters.previousCompanies = selectedCompanies
            }
            
            // Boolean filters
            if (availability === 'ledig') {
                filters.availability = true
            } else if (availability === 'ikke-ledig') {
                filters.availability = false
            }
            
            if (wantsToSwitch === 'ja') {
                filters.wantsNewProject = true
            } else if (wantsToSwitch === 'nei') {
                filters.wantsNewProject = false
            }
            
            if (openToRemote === 'ja') {
                filters.openToRemote = true
            } else if (openToRemote === 'nei') {
                filters.openToRemote = false
            }
            
            // Date range filter (convert to Unix timestamp in milliseconds)
            if (startDate) {
                filters.startDate = new Date(startDate).getTime()
            }
            
            if (endDate) {
                filters.endDate = new Date(endDate).getTime()
            }

            // Call backend search API - all filtering is done server-side
            const searchResults = await searchConsultants(filters)
            
            setResults(searchResults)

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
                        placeholder='Søk bedrift...'
                        options={companyOptions}
                        selected={selectedCompanies}
                        onAdd={(value) => setSelectedCompanies([...selectedCompanies, value])}
                        onRemove={(value) => setSelectedCompanies(selectedCompanies.filter(item => item !== value))}
                    />

                    <MultiSelectDropdown
                        label='Rolle'
                        placeholder='Søk rolle...'
                        options={roleOptions}
                        selected={selectedRoles}
                        onAdd={(value) => setSelectedRoles([...selectedRoles, value])}
                        onRemove={(value) => setSelectedRoles(selectedRoles.filter(item => item !== value))}
                    />
                    
                    <div className='filter-group'>
                        <label>Åpen for remote</label>
                        <select value={openToRemote} onChange={(e) => setOpenToRemote(e.target.value)}>
                            <option value=''>Velg...</option>
                            <option value='ja'>Ja</option>
                            <option value='nei'>Nei</option>
                        </select>
                    </div>
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