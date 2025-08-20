
import { Slider, InputNumber, Flex } from 'antd';

interface Props {
    label: string;
    min?: number;
    max?: number;
    currMin?: number;
    currMax?: number;
    disabled?: boolean;
    onChange?: (value: number[]) => void;
}
const NumericalInputSelector = ({ label, disabled = false, currMin = 0, currMax = 100, min = 0, max = 100, onChange }: Props) => {
    // const stepSize =  10 ** (Math.round(Math.log10(max - min))-2)
    const stepSize =  0.01
    return (
        <Flex gap="small" vertical className="grow">
            <span className="whitespace-nowrap font-bold">{label}</span>
            <Flex gap="middle">
                <Flex vertical gap="small">
                    <InputNumber
                        disabled={disabled}
                        min={min}
                        max={max}
                        value={currMin}
                        step={stepSize}
                        onChange={(val: number | null) => {
                            onChange && onChange([val ?? currMin, currMax]);
                        }}
                    />
                    <span className="text-xs">Lower Limit</span>
                </Flex>
                <Slider
                    className="w-full"
                    range
                    disabled={disabled}
                    min={min}
                    max={max}
                    defaultValue={[min, max]}
                    value={[currMin, currMax] as [number, number]}
                    onChange={onChange}
                    step={stepSize}
                />
                <Flex vertical gap="small">
                    <InputNumber
                            disabled={disabled}
                            min={min}
                            max={max}
                            value={currMax}
                            step={stepSize}
                            onChange={(val: number | null) => {
                                onChange && onChange([currMin, val ?? currMax]);
                            }}
                    />
                    <span className="text-xs">Upper Limit</span>
                </Flex>
            </Flex>      
        </Flex>
    )
}

export default NumericalInputSelector