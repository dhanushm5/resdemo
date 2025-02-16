import React, { useState } from 'react';
import { Users, Link as LinkIcon, Copy, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

const COLORS = [
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#14B8A6', // Teal
  '#F97316', // Orange
];

export function RoomJoin() {
  const [mode, setMode] = useState<'create' | 'join'>('create');
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [createdRoomCode, setCreatedRoomCode] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setLoading(true);
      setError(null);

      if (mode === 'create') {
        const { data: room, error: roomError } = await supabase
          .from('rooms')
          .insert([
            {
              name: `${name}'s Room`,
              created_by: name,
            },
          ])
          .select()
          .single();

        if (roomError) throw roomError;

        setCreatedRoomCode(room.id);
        setShowShareModal(true);
      } else {
        // Validate room exists
        const { data: room, error: roomError } = await supabase
          .from('rooms')
          .select('id')
          .eq('id', roomCode)
          .single();

        if (roomError || !room) {
          throw new Error('Invalid room code. Please check and try again.');
        }
      }

      // Store user preferences
      localStorage.setItem('userName', name);
      localStorage.setItem('userColor', selectedColor);

      if (mode === 'join') {
        navigate(`/room/${roomCode}`);
      }
    } catch (err: any) {
      console.error('Error:', err.message);
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const copyRoomCode = async () => {
    if (!createdRoomCode) return;
    await navigator.clipboard.writeText(createdRoomCode);
  };

  const continueToRoom = () => {
    if (createdRoomCode) {
      navigate(`/room/${createdRoomCode}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center px-4">
      <div className="max-w-xl w-full space-y-8">
        <div className="text-center">
          <Users className="mx-auto h-16 w-16 text-blue-500" />
          <h1 className="mt-6 text-4xl font-bold text-gray-900">
            Research Room
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Collaborate on research papers in real-time
          </p>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-lg">
          <div className="flex space-x-4 mb-8">
            <button
              onClick={() => setMode('create')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                mode === 'create'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Create Room
            </button>
            <button
              onClick={() => setMode('join')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                mode === 'join'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Join Room
            </button>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Your Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter your name"
              />
            </div>

            {mode === 'join' && (
              <div>
                <label htmlFor="roomCode" className="block text-sm font-medium text-gray-700">
                  Room Code
                </label>
                <input
                  id="roomCode"
                  type="text"
                  required
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter room code"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Choose Your Color
              </label>
              <div className="flex flex-wrap gap-3">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`w-8 h-8 rounded-full transition-transform ${
                      selectedColor === color
                        ? 'ring-2 ring-offset-2 ring-blue-500 scale-110'
                        : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !name.trim() || (mode === 'join' && !roomCode.trim())}
              className="w-full flex justify-center items-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <LinkIcon className="w-4 h-4 mr-2" />
                  {mode === 'create' ? 'Create Room' : 'Join Room'}
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && createdRoomCode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Share Room</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Share this room code with others to invite them to your research room:
            </p>
            
            <div className="flex items-center space-x-2 mb-6">
              <input
                type="text"
                readOnly
                value={createdRoomCode}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 bg-gray-50 text-sm font-mono"
              />
              <button
                onClick={copyRoomCode}
                className="p-2 text-blue-600 hover:text-blue-700"
                title="Copy to clipboard"
              >
                <Copy className="h-5 w-5" />
              </button>
            </div>

            <button
              onClick={continueToRoom}
              className="w-full flex justify-center items-center px-4 py-3 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Continue to Room
            </button>
          </div>
        </div>
      )}
    </div>
  );
}