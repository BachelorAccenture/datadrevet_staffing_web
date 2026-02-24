import { useState, useEffect } from 'react'
import './searchPage.css'
import '../../global.css'
import ResultList from '../resultList/resultList'
import MultiSelectDropdown from '../multiSelectDropdown/multiSelectDropdown'
import { 
  fetchSkills, 
  fetchCompanies,
  fetchConsultants, 
  extractUniqueRoles,
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
    const [availability, setAvailability] = useState(false)
    const [wantsToSwitch, setWantsToSwitch] = useState(false)
    const [selectedCompanies, setSelectedCompanies] = useState<string[]>([])
    const [selectedRoles, setSelectedRoles] = useState<string[]>([])
    const [openToRemote, setOpenToRemote] = useState(false)

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

                const [skills, companies, consultants] = await Promise.all([
                    fetchSkills(),
                    fetchCompanies(),
                    fetchConsultants(),
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
                filters.roles = selectedRoles
            }
            
            // Previous experience/companies filter
            if (selectedCompanies.length > 0) {
                filters.previousCompanies = selectedCompanies
            }
            
            // Boolean filters — only apply when checkbox is checked
            if (availability) {
                filters.availability = true
            }
            
            if (wantsToSwitch) {
                filters.wantsNewProject = true
            }
            
            if (openToRemote) {
                filters.openToRemote = true
            }
            
            // Date range filter (send as ISO datetime strings for backend LocalDateTime)
            if (startDate) {
                filters.startDate = `${startDate}T00:00:00`
            }
            
            if (endDate) {
                filters.endDate = `${endDate}T23:59:59`
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
                </div>

                <div className='filter-row'>

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

                    <div className='filter-checkbox'>
                        <label>
                            <input
                                type='checkbox'
                                checked={availability}
                                onChange={(e) => setAvailability(e.target.checked)}
                            />
                            Kun ledige
                        </label>
                    </div>

                    <div className='filter-checkbox'>
                        <label>
                            <input
                                type='checkbox'
                                checked={wantsToSwitch}
                                onChange={(e) => setWantsToSwitch(e.target.checked)}
                            />
                            Ønsker nytt prosjekt
                        </label>
                    </div>
                    
                    <div className='filter-checkbox'>
                        <label>
                            <input
                                type='checkbox'
                                checked={openToRemote}
                                onChange={(e) => setOpenToRemote(e.target.checked)}
                            />
                            Åpen for remote
                        </label>
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

        {results !== null && <ResultList results={results} highlightedSkills={selectedSkills} />}
        </>
    );
}

export default SearchPage;