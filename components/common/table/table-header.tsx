import { useState } from 'react';
import { Column } from "@/lib/types/Column";
import { getColumnLabel } from "./table-properties";
import FeatureInfoModal from '../feature-info-modal';
import { useAppSelector } from '@/lib/store/hooks';
import { selectTemplateById } from '@/lib/store/slices/templateSlice';

export default function TableHeader({ columns }: { columns: Column[] }) {
  const [selectedColumn, setSelectedColumn] = useState<{ templateId: string; featureKey: string } | null>(null);
  const getTemplateById = useAppSelector(selectTemplateById);

  const getFeatureType = (column: Column) => {
    if (column.type !== 'data' || !column.params?.templateId || !column.label) return null;
    
    const template = getTemplateById(column.params.templateId);
    if (!template) return null;
    if (column.params?.featureKey) {
      if (template.Formulation?.find(f => f.featureKey === column.params?.featureKey)) return 'Formulation';
      if (template.Process?.find(f => f.featureKey === column.params?.featureKey)) return 'Process';
      if (template.Output?.find(f => f.featureKey === column.params?.featureKey)) return 'Output';
    }
    return null;
  };

  return (
    <>
      <thead className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20 sticky top-0 z-10">
        <tr>
          {columns.map((column, i) => {
            const featureType = getFeatureType(column);
            return (
              <th 
                key={`th-${i}`} 
                className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap text-left group relative"
              >
                <div 
                  className={`flex items-center gap-2 cursor-pointer transition-all duration-200
                    ${column.type === 'data' && column.params?.templateId 
                      ? 'hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg px-3 py-2 shadow-sm hover:shadow-md' 
                      : ''}`}
                  onClick={() => {
                    if (column.type === 'data' && column.params?.templateId) {
                      setSelectedColumn({
                        templateId: column.params.templateId,
                        featureKey: column.label || ''
                      });
                    }
                  }}
                >
                  {featureType && (
                    <span className={`w-2 h-2 rounded-full
                      ${featureType === 'Formulation' ? 'bg-blue-500' :
                        featureType === 'Process' ? 'bg-green-500' :
                        'bg-purple-500'}`}
                    />
                  )}
                  {getColumnLabel(column)}
                  {column.type === 'data' && column.params?.templateId && (
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg 
                        className="w-3 h-3 text-gray-400/60 dark:text-gray-500/60" 
                        viewBox="0 0 16 16" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="1.5"
                      >
                        <path d="M8 14.5c3.59 0 6.5-2.91 6.5-6.5S11.59 1.5 8 1.5 1.5 4.41 1.5 8s2.91 6.5 6.5 6.5z" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M6 6.5c0-1.1.9-2 2-2s2 .9 2 2c0 1.1-.9 2-2 2v2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M8 11.5v.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                  )}
                </div>
              </th>
            );
          })}
        </tr>
      </thead>

      {/* Feature Info Modal */}
      {selectedColumn && (
        <FeatureInfoModal
          isOpen={true}
          onClose={() => setSelectedColumn(null)}
          templateId={selectedColumn.templateId}
          featureKey={selectedColumn.featureKey}
        />
      )}
    </>
  );
}

