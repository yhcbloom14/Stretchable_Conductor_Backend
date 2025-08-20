interface TextAreaInputProps {
    label: string
    name: string
    error?: string
}

export default function TextAreaInput({label, name, error}: TextAreaInputProps) {
    return (
        <div className="space-y-2">
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor={name}>{label}</label>
                <textarea id={name} name={name} className="form-textarea w-full rounded-md border border-[#2a3349] bg-[#1c2438] px-3 py-2 text-sm text-white" rows={4} required></textarea>
            </div>
            {error && <p className="text-xs text-[#FF5252] mt-1">{error}</p>}
        </div>
    )
}
