import { useAppSelector } from '@/lib/store/hooks';
import { selectTemplateById } from '@/lib/store/slices/templateSlice';
import ModalBasic from '@/components/common/modal-basic';

interface FeatureInfoModalProps {
    isOpen: boolean;
    onClose: () => void;
    templateId: string;
    featureKey: string;
}

export default function FeatureInfoModal({
    isOpen,
    onClose,
    templateId,
    featureKey
}: FeatureInfoModalProps) {
    const getTemplateById = useAppSelector(selectTemplateById);
    const template = getTemplateById(templateId);

    if (!template) return null;

    // Find the feature in the template
    const feature = template.Formulation?.find(f => f.featureKey === featureKey) ||
                   template.Process?.find(f => f.featureKey === featureKey) ||
                   template.Output?.find(f => f.featureKey === featureKey);

    if (!feature) return null;

    // Determine which section the feature belongs to
    const featureType = template.Formulation?.find(f => f.featureKey === featureKey) ? 'Formulation' :
                       template.Process?.find(f => f.featureKey === featureKey) ? 'Process' :
                       template.Output?.find(f => f.featureKey === featureKey) ? 'Output' : '';

    return (
        <ModalBasic
            isOpen={isOpen}
            onClose={onClose}
            title={`${featureKey} (${featureType})`}
        >
            <div className="p-5">
                <div className="space-y-4">
                    {/* Feature Type Badge */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Type:</span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                            ${featureType === 'Formulation' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                              featureType === 'Process' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                              'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'}`}>
                            {featureType}
                        </span>
                    </div>

                    {/* Feature Details */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                        <pre className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                            {JSON.stringify(feature, null, 2)}
                        </pre>
                    </div>

                    {/* Template Reference */}
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        From template: <span className="font-medium text-gray-700 dark:text-gray-300">{template.name}</span>
                    </div>
                </div>
            </div>
        </ModalBasic>
    );
} 