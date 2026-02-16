import './consultantPage.css'
import '../../global.css'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchConsultants, type Consultant } from '../../data/api'

const KonsulenterPage = () => {
    const navigate = useNavigate()
    const [search, setSearch] = useState('')
    const [consultants, setConsultants] = useState<Consultant[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Fetch consultants on component mount
    useEffect(() => {
        const loadConsultants = async () => {
            try {
                setIsLoading(true)
                setError(null)
                const data = await fetchConsultants()
                setConsultants(data)
            } catch (err) {
                console.error('Error fetching consultants:', err)
                setError('Kunne ikke laste konsulenter. Prøv igjen senere.')
            } finally {
                setIsLoading(false)
            }
        }

        loadConsultants()
    }, [])

    // Filter consultants by search term
    const filtrert = consultants.filter(k =>
        k.name.toLowerCase().includes(search.toLowerCase()) ||
        k.email.toLowerCase().includes(search.toLowerCase())
    )

    // Show loading state
    if (isLoading) {
        return (
            <>
                <div className='header'>
                    <h1>Konsulenter</h1>
                </div>
                <div className='konsulenter-toolbar'>
                    <p>Laster konsulenter...</p>
                </div>
            </>
        )
    }

    // Show error state
    if (error) {
        return (
            <>
                <div className='header'>
                    <h1>Konsulenter</h1>
                </div>
                <div className='konsulenter-toolbar'>
                    <p style={{ color: 'red' }}>{error}</p>
                </div>
            </>
        )
    }

    return (
        <>
            <div className='header'>
                <h1>Konsulenter</h1>
            </div>

            <div className='konsulenter-toolbar'>
                <input
                    type='text'
                    className='konsulenter-search'
                    placeholder='Søk etter navn eller e-post...'
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <button
                    className='add-konsulent-button'
                    onClick={() => navigate('/konsulenter/add')}
                >
                    + Legg til konsulent
                </button>
            </div>

            <div className='konsulenter-list'>
                {filtrert.length === 0 ? (
                    <p className='no-results'>
                        {search ? 'Ingen konsulenter funnet.' : 'Ingen konsulenter registrert.'}
                    </p>
                ) : (
                    filtrert.map(konsulent => (
                        <div
                            key={konsulent.id}
                            className='konsulent-card'
                            onClick={() => navigate(`/konsulenter/edit/${konsulent.id}`)}
                        >
                            <div className='konsulent-info'>
                                <h4>{konsulent.name}</h4>
                                <span className='konsulent-email'>{konsulent.email}</span>
                            </div>
                            <span className='konsulent-arrow'>→</span>
                        </div>
                    ))
                )}
            </div>
        </>
    )
}

export default KonsulenterPage