import { useState, useRef, useEffect } from 'react'


interface MultiSelectProps {
    label: string
    placeholder: string
    options: string[]
    selected: string[]
    onAdd: (value: string) => void
    onRemove: (value: string) => void
    singleSelect?: boolean
}

const MultiSelectDropdown = ({ label, placeholder, options, selected, onAdd, onRemove, singleSelect = false }: MultiSelectProps) => {
    const [input, setInput] = useState('')
    const [isOpen, setIsOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    const handleSelect = (value: string) => {
        onAdd(value)
        setInput('')
        setIsOpen(false)
    }

    const handleClickOutside = (e: MouseEvent) => {
        if (ref.current && !ref.current.contains(e.target as Node)) {
            setIsOpen(false)
            if (singleSelect) setInput('')
        }
    }

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [singleSelect]) // Re-bind if singleSelect changes

    const filtered = options.filter(
        opt => opt.toLowerCase().includes(input.toLowerCase()) && (singleSelect ? true : !selected.includes(opt))
    )

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
                    placeholder={singleSelect && selected.length > 0 ? selected[0] : placeholder}
                    value={input}
                    onChange={(e) => { setInput(e.target.value); setIsOpen(true) }}
                    onFocus={() => {
                        setIsOpen(true)
                        if (singleSelect) setInput('')
                    }}
                    onBlur={() => {
                        // Small delay to allow handleSelect to trigger on mouse down
                        setTimeout(() => {
                            if (singleSelect) setInput('')
                        }, 200)
                    }}
                    onKeyDown={handleKeyDown}
                />
                <button className='dropdown-arrow' onClick={toggleDropdown} tabIndex={-1}>
                    {isOpen ? '▲' : '▼'}
                </button>
                {singleSelect && selected.length > 0 && !input && !isOpen && (
                    <div className='single-select-display' onClick={() => setIsOpen(true)}>
                        {selected[0]}
                        <button className='chip-remove' onClick={(e) => {
                            e.stopPropagation()
                            onRemove(selected[0])
                        }}>&times;</button>
                    </div>
                )}
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
            {!singleSelect && (
                <div className='chips'>
                    {selected.map(item => (
                        <span key={item} className='chip'>
                            {item}
                            <button className='chip-remove' onClick={() => onRemove(item)}>&times;</button>
                        </span>
                    ))}
                </div>
            )}
        </div>
    )
}

export default MultiSelectDropdown;