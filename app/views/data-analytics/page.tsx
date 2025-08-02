"use client"

import Image, { StaticImageData } from 'next/image';
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks"
import { templateSlice, selectTemplates, refreshTemplates } from "@/lib/store/slices/templateSlice"
import { ActionEnum } from "@/lib/types/Action"
import Title from "@/components/common/title";
import { Select } from 'antd';
import SpearmansCorrelationImg from '@/public/images/spearmans-correlation.jpg';
import PearsonCorrelationImg from '@/public/images/pearsons-correlation.jpg';
import APR1 from '@/public/images/ap-r1.jpg';
import APR2 from '@/public/images/ap-r2.jpg';
import D1D2R1 from '@/public/images/d1-d2-r1.jpg';
import D1D2R2 from '@/public/images/d1-d2-r2.jpg';  

const correlationTypeOptions = [
  {
    label: 'Pearson\'s Correlation',
    value: 'pearson',
    image: PearsonCorrelationImg
  },
  {
    label: 'Spearman\'s Rank Correlation',
    value: 'spearman',
    image: SpearmansCorrelationImg
  },
];
const productOutputOptions = [
{
    label: 'AP - R1',
    value: 'ap-r1',
    image: APR1
  },
  {
    label: 'AP - R2',
    value: 'ap-r2',
    image: APR2
  },
  {
    label: 'D1/D2 - R1',
    value: 'd1-d2-r1',
    image: D1D2R1
  },
  {
    label: 'D1/D2 - R2',
    value: 'd1-d2-r2',
    image: D1D2R2
  },
];
type Option =  { label: string, value: number | string, image: StaticImageData };
const ImageRenderer = ({ title, options = [], defaultValue }: {
    title: string
    options: Option[]
    defaultValue?: string
}) => {
    const [selectedImage, setSelectedImage] = useState<Option | null>(null);
    const [imageLoaded, setImageLoaded] = useState<boolean>(false);
    const handleChange = (value: number | string) => {
        setSelectedImage(options.find(option => option.value === value) || null);
    };
    return (
        <>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg md:text-xl text-gray-700 dark:text-gray-200 font-medium">{title}</h2>
                <Select
                    defaultValue={defaultValue}
                    onChange={handleChange}
                    options={options}
                />
            </div>
            {!imageLoaded && selectedImage && <Loader2 className="w-10 h-10 ml-[50%] !mt-[20%] animate-spin" />}
            {selectedImage && (
                <Image
                    src={selectedImage?.image || ''}
                    alt={selectedImage?.label || ''}
                    onLoad={() => setImageLoaded(true)}
                />
            )}
        </>
    )
}
export default function DataAnalyticsPage() {
    const dispatch = useAppDispatch()
    const templates = useAppSelector(selectTemplates)
    // const [selectedCorrelation, setSelectedCorrelation] = useState<number | null>(null);

    useEffect(() => {
        // Only fetch templates if we don't have any cached
        if (templates.length === 0) {
            dispatch(refreshTemplates(false))
        }
    }, [dispatch, templates.length])
    
    const handleTemplateChange = (value: string) => {
        dispatch(templateSlice.actions.setActiveId(value))
    }

    return (
        <>
            <Title text="Data Analytics View" actions={[{type: ActionEnum.SELECT_TEMPLATE, label: 'Select Data File', handler: handleTemplateChange}]}/>
            <ImageRenderer title="Section I - Statistical Analysis" options={correlationTypeOptions} defaultValue="Select Correlation Type" />
            <ImageRenderer title="Section II – SHAP Model Interpretation Tools" options={productOutputOptions} defaultValue="Select Product Output" />
        </>
    );
}