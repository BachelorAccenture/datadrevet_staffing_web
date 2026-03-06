import { useState, useRef, useEffect } from 'react'


interface MultiSelectProps {
    label: string
    placeholder: string
    options: string[]
    selected: string[]
    onAdd: (value: string) => void
    onRemove: (value: string) => void
}

const MultiSelectDropdown = ({ label, placeholder, options, selected, onAdd, onRemove }: MultiSelectProps) => {
    const [input, setInput] = useState('')
    const [isOpen, setIsOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    const filtered = options.filter(
        opt => opt.toLowerCase().includes(input.toLowerCase()) && !selected.includes(opt)
    )

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleSelect = (value: string) => {
        onAdd(value)
        setInput('')
        setIsOpen(false)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            if (filtered.length > 0) {
                handleSelect(filtered[0])
            }
        }
    }

    const toggleDropdown = () => {
        setIsOpen(prev => !prev)
    }

    return (
        <div className='filter-group' ref={ref}>
            <label>{label}</label>

            <div className='dropdown-input-wrapper'>
                <input
                    type='text'
                    placeholder={placeholder}
                    value={input}
                    onChange={(e) => { setInput(e.target.value); setIsOpen(true) }}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={handleKeyDown}
                />
                <button className='dropdown-arrow' onClick={toggleDropdown} tabIndex={-1}>
                    {isOpen ? '▲' : '▼'}
                </button>
                {isOpen && filtered.length > 0 && (
                <ul className='dropdown-list'>
                    {filtered.map((opt, i) => (
                        <li
                            key={opt}
                            className={`dropdown-item ${i === 0 && input ? 'dropdown-item--active' : ''}`}
                            onMouseDown={() => handleSelect(opt)}
                        >
                            {opt}
                        </li>
                    ))}
                </ul>
            )}
            </div>
            <div className='chips'>
                {selected.map(item => (
                    <span key={item} className='chip'>
                        {item}
                        <button className='chip-remove' onClick={() => onRemove(item)}>&times;</button>
                    </span>
                ))}
            </div>
        </div>
    )
}

export default MultiSelectDropdown;