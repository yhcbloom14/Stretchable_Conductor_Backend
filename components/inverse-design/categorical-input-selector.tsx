import { Flex } from 'antd';

interface Props {
    label: string;
    options?: string[];
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}
const CategoricalInputSelector = ({ label, options = [], onChange }: Props) => {
    return (
        <Flex vertical gap="small">
            <span className="whitespace-nowrap font-bold">{label}</span>
            <Flex gap="small">
                {
                    options.length > 0 && options.map(option => (
                        <label key={option}>
                            <input type="checkbox" className="cursor-pointer form-checkbox focus:ring-0 focus:ring-offset-0 checked:border-0" defaultChecked onChange={onChange}/>
                            <span className="ml-2">{option}</span>
                        </label>
                    ))
                }
            </Flex>
        </Flex>
    )
}

export default CategoricalInputSelector