'use client';

import { useState, ChangeEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit2, Trash2, Check, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Annotation } from '@/lib/types';

interface AnnotationsProps {
  summaryId: string;
}

export function Annotations({ summaryId }: AnnotationsProps) {
  const queryClient = useQueryClient();
  const [newNote, setNewNote] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const { data: annotations, isLoading } = useQuery({
    queryKey: ['annotations', summaryId],
    queryFn: async () => {
      const response = await fetch(`/api/summaries/${summaryId}/annotations`);
      if (!response.ok) throw new Error('Failed to fetch annotations');
      return response.json() as Promise<Annotation[]>;
    },
  });

  const addMutation = useMutation<Annotation, Error, string>({
    mutationFn: async (content: string) => {
      const response = await fetch(`/api/summaries/${summaryId}/annotations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      if (!response.ok) throw new Error('Failed to add annotation');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['annotations', summaryId] });
      setNewNote('');
    },
  });

  const updateMutation = useMutation<Annotation, Error, { id: string; content: string }>({
    mutationFn: async ({ id, content }: { id: string; content: string }) => {
      const response = await fetch(`/api/summaries/${summaryId}/annotations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      if (!response.ok) throw new Error('Failed to update annotation');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['annotations', summaryId] });
      setEditingId(null);
    },
  });

  const deleteMutation = useMutation<void, Error, string>({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/summaries/${summaryId}/annotations/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete annotation');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['annotations', summaryId] });
    },
  });

  const handleAdd = () => {
    if (newNote.trim()) {
      addMutation.mutate(newNote);
    }
  };

  const handleUpdate = (id: string) => {
    if (editText.trim()) {
      updateMutation.mutate({ id, content: editText });
    }
  };

  const startEdit = (annotation: Annotation) => {
    setEditingId(annotation.id);
    setEditText(annotation.content);
  };

  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setNewNote(e.target.value);
  };

  const handleEditChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setEditText(e.target.value);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Notes & Annotations</h3>

      {/* Add new annotation */}
      <div className="space-y-2">
        <Textarea
          placeholder="Add a note..."
          value={newNote}
          onChange={handleTextChange}
          className="min-h-[100px]"
        />
        <Button
          onClick={handleAdd}
          disabled={!newNote.trim() || addMutation.isLoading}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Note
        </Button>
      </div>

      {/* Annotations list */}
      <div className="space-y-4">
        {annotations?.map((annotation: Annotation) => (
          <div
            key={annotation.id}
            className="border rounded-lg p-4 space-y-2"
          >
            {editingId === annotation.id ? (
              <div className="space-y-2">
                <Textarea
                  value={editText}
                  onChange={handleEditChange}
                  className="min-h-[100px]"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleUpdate(annotation.id)}
                    disabled={updateMutation.isLoading}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingId(null)}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <p className="whitespace-pre-wrap">{annotation.content}</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>
                    {formatDistanceToNow(new Date(annotation.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(annotation)}
                      className="hover:text-blue-600"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteMutation.mutate(annotation.id)}
                      className="hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 