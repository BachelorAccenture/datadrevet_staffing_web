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

    return (
        <div className='filter-group' ref={ref}>
            <label>{label}</label>
            <input
                type='text'
                placeholder={placeholder}
                value={input}
                onChange={(e) => { setInput(e.target.value); setIsOpen(true) }}
                onFocus={() => setIsOpen(true)}
            />
            {isOpen && filtered.length > 0 && (
                <ul className='dropdown-list'>
                    {filtered.map(opt => (
                        <li key={opt} className='dropdown-item' onMouseDown={() => handleSelect(opt)}>
                            {opt}
                        </li>
                    ))}
                </ul>
            )}
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