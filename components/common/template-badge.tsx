import { useState } from 'react';
import { useAppSelector } from '@/lib/store/hooks';
import { selectTemplateById } from '@/lib/store/slices/templateSlice';
import ModalBasic from '@/components/common/modal-basic';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface TemplateBadgeProps {
    templateId: string;
}

export default function TemplateBadge({ templateId }: TemplateBadgeProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const getTemplateById = useAppSelector(selectTemplateById);
    const template = getTemplateById(templateId);

    if (!template) return null;

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400 hover:bg-violet-200 dark:hover:bg-violet-900/50 transition-colors duration-200"
            >
                {template.name}
            </button>

            <ModalBasic
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={template.name}
            >
                <div className="p-5">
                    <div className="rounded-lg overflow-hidden">
                        <SyntaxHighlighter
                            language="json"
                            style={vscDarkPlus}
                            customStyle={{
                                margin: 0,
                                borderRadius: '0.5rem',
                                maxHeight: '60vh'
                            }}
                        >
                            {JSON.stringify(template, null, 2)}
                        </SyntaxHighlighter>
                    </div>
                </div>
            </ModalBasic>
        </>
    );
} 