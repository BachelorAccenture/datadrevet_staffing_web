import './konsulenterPage.css'
import '../../global.css'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { mockKonsulenter } from '../../data/mockData'

/**
 * BACKEND: Erstatt mockKonsulenter med et API-kall:
 *   useEffect(() => {
 *       fetch('/api/konsulenter')
 *           .then(r => r.json())
 *           .then(data => setKonsulenter(data))
 *   }, [])
 */

const KonsulenterPage = () => {
    const navigate = useNavigate()
    const [search, setSearch] = useState('')

    const filtrert = mockKonsulenter.filter(k =>
        k.navn.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <>
            <div className='header'>
                <h1>Konsulenter</h1>
            </div>

            <div className='konsulenter-toolbar'>
                <input
                    type='text'
                    className='konsulenter-search'
                    placeholder='Søk etter navn...'
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
                    <p className='no-results'>Ingen konsulenter funnet.</p>
                ) : (
                    filtrert.map(konsulent => (
                        <div
                            key={konsulent.id}
                            className='konsulent-card'
                            onClick={() => navigate(`/konsulenter/edit/${konsulent.id}`)}
                        >
                            <div className='konsulent-info'>
                                <h4>{konsulent.navn}</h4>
                                <span className='konsulent-email'>{konsulent.epost}</span>
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
