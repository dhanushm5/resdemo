import React from 'react';
import { FileText, Trash2 } from 'lucide-react';

interface Paper {
  id: string;
  title: string;
  summary: string;
  created_at: string;
}

interface PaperListProps {
  papers: Paper[];
  onSelect: (paper: Paper) => void;
  onDelete: (id: string) => void;
}

export function PaperList({ papers, onSelect, onDelete }: PaperListProps) {
  return (
    <div className="space-y-4">
      {papers.map((paper) => (
        <div
          key={paper.id}
          className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div
              className="flex items-center space-x-3 cursor-pointer"
              onClick={() => onSelect(paper)}
            >
              <FileText className="h-5 w-5 text-blue-500" />
              <div>
                <h3 className="font-medium text-gray-900">{paper.title}</h3>
                <p className="text-sm text-gray-500">
                  {new Date(paper.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(paper.id);
              }}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}