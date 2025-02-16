import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { getSuggestions } from '../lib/gemini';
import { Lightbulb, Plus, X, BookOpen, MessageSquare } from 'lucide-react';

interface Annotation {
  id: string;
  content: string;
  ai_suggestions: string | null;
  position: string;
  created_at: string;
  user_identity: string;
  color: string;
}

interface AnnotationsProps {
  paperId: string;
  paperText: string;
  userName: string;
  userColor: string;
}

export function Annotations({ paperId, paperText, userName, userColor }: AnnotationsProps) {
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [newAnnotation, setNewAnnotation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (paperId) {
      fetchAnnotations();
      
      // Set up real-time subscription
      const annotationsSubscription = supabase
        .channel(`annotations_${paperId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'annotations',
            filter: `paper_id=eq.${paperId}`,
          },
          (payload) => {
            console.log('Annotations change received:', payload);
            fetchAnnotations();
          }
        )
        .subscribe();

      // Set up polling for additional reliability
      const pollInterval = setInterval(fetchAnnotations, 1000);

      return () => {
        annotationsSubscription.unsubscribe();
        clearInterval(pollInterval);
      };
    }
  }, [paperId]);

  async function fetchAnnotations() {
    try {
      const { data, error } = await supabase
        .from('annotations')
        .select('*')
        .eq('paper_id', paperId)
        .order('created_at', { ascending: true });

      if (error) {
        throw new Error(error.message);
      }
      
      setAnnotations(data || []);
    } catch (err: any) {
      console.error('Error fetching annotations:', err);
      setError(err.message || 'Failed to load annotations');
    }
  }

  async function addAnnotation(e: React.FormEvent) {
    e.preventDefault();
    if (!newAnnotation.trim() || !paperId) return;

    try {
      setLoading(true);
      setError(null);

      const suggestions = await getSuggestions(paperText, newAnnotation);
      
      const { data, error } = await supabase
        .from('annotations')
        .insert([
          {
            paper_id: paperId,
            content: newAnnotation,
            ai_suggestions: suggestions,
            position: 'end',
            user_identity: userName,
            color: userColor,
          },
        ])
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      setNewAnnotation('');
    } catch (err: any) {
      console.error('Error adding annotation:', err);
      setError(err.message || 'Failed to add annotation');
    } finally {
      setLoading(false);
    }
  }

  async function deleteAnnotation(id: string) {
    try {
      setError(null);
      
      const { error } = await supabase
        .from('annotations')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(error.message);
      }
    } catch (err: any) {
      console.error('Error deleting annotation:', err);
      setError(err.message || 'Failed to delete annotation');
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <BookOpen className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Research Notes & Feedback</h3>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {annotations.map((annotation) => (
          <div
            key={annotation.id}
            className="bg-gray-50 rounded-lg p-6 space-y-4 shadow-sm"
            style={{ borderLeft: `4px solid ${annotation.color}` }}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <MessageSquare className="h-5 w-5 text-gray-400 mt-1" />
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">
                      {annotation.user_identity}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(annotation.created_at).toLocaleDateString()} at{' '}
                      {new Date(annotation.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-gray-900 mt-1">{annotation.content}</p>
                </div>
              </div>
              {annotation.user_identity === userName && (
                <button
                  onClick={() => deleteAnnotation(annotation.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            {annotation.ai_suggestions && (
              <div className="mt-4 pl-4 border-l-2 border-blue-200">
                <div className="flex items-center gap-2 text-sm text-blue-600 mb-3">
                  <Lightbulb className="h-4 w-4" />
                  <span className="font-medium">AI Mentor Feedback</span>
                </div>
                <div className="text-sm text-gray-600 whitespace-pre-wrap prose prose-sm max-w-none">
                  {annotation.ai_suggestions}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={addAnnotation} className="mt-6">
        <div className="space-y-3">
          <label htmlFor="annotation" className="block text-sm font-medium text-gray-700">
            Add your research note
          </label>
          <textarea
            id="annotation"
            rows={3}
            value={newAnnotation}
            onChange={(e) => setNewAnnotation(e.target.value)}
            placeholder="Share your thoughts, questions, or insights about the paper..."
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          <button
            type="submit"
            disabled={loading || !newAnnotation.trim()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Add Note
          </button>
        </div>
      </form>
    </div>
  );
}