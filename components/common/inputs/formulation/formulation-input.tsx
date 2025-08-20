"use client"

import CompositionInput from "./composition-input";
import Card from "../../card";
import CompositionBar from "./composition-bar";
import InputTagGroup from "../input-tag-group";
import { useAppSelector } from "@/lib/store/hooks";
import { selectMaterials } from "@/lib/store/slices/templateSlice";

export type TitleConfig = {
    materialTagGroupTitle?: string
    compositionInputTitle?: string
}
export default function FormulationInput({ isSelectable = true, titleConfig = {}, removeCompositionIndicator = false }: { isSelectable?: boolean, titleConfig?: TitleConfig, removeCompositionIndicator?: boolean }) {
    // Templates are now cached and fetched conditionally by template-form
    // No need to refresh here as this component is used within template-form
    const materials = useAppSelector(selectMaterials)
    return (
        <div className="space-y-6 mt-8">
            {/* <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl"> */}
            {isSelectable && (
                <Card>
                    <InputTagGroup title={titleConfig?.materialTagGroupTitle} inputs={materials} />
                </Card>
            )}
            <Card>
                <CompositionInput title={titleConfig?.compositionInputTitle} removeCompositionIndicator={removeCompositionIndicator} />
            </Card> 
            {!removeCompositionIndicator && <CompositionBar />}
        </div>
    )
}