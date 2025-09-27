
import React, { useState } from 'react';
import { ImageState } from '../types';

interface EditorWorkspaceProps {
  originalImage: ImageState;
  cartoonImage: ImageState;
  onEditRequest: (prompt: string) => void;
  onReset: () => void;
  isEditing: boolean;
}

const ImageDisplay: React.FC<{ title: string; image: ImageState, isCartoon?: boolean }> = ({ title, image, isCartoon = false }) => (
  <div className="w-full">
    <h3 className="text-lg font-semibold text-center mb-4 text-gray-300">{title}</h3>
    <div className="aspect-square w-full bg-gray-800/50 rounded-lg overflow-hidden border border-gray-700 shadow-lg flex items-center justify-center">
      {image ? (
        <img src={image.dataUrl} alt={title} className="object-contain w-full h-full" />
      ) : (
         <div className="flex flex-col items-center text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.657-6.657l-1.414 1.414m-9.9 9.9l-1.414 1.414M20.485 20.485L19.071 19.071m-9.9-9.9l-1.414-1.414" />
            </svg>
            <span className="mt-2 text-sm">Generating...</span>
        </div>
      )}
    </div>
    {isCartoon && image && (
      <a
        href={image.dataUrl}
        download="cartoonified-me.png"
        className="mt-4 w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Download
      </a>
    )}
  </div>
);


export const EditorWorkspace: React.FC<EditorWorkspaceProps> = ({
  originalImage,
  cartoonImage,
  onEditRequest,
  onReset,
  isEditing,
}) => {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onEditRequest(prompt);
      setPrompt('');
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <ImageDisplay title="Original Photo" image={originalImage} />
        <ImageDisplay title="Your Cartoon" image={cartoonImage} isCartoon={true}/>
      </div>

      <div className="bg-gray-800/50 border border-gray-700 p-6 rounded-lg shadow-xl">
        <h3 className="text-xl font-bold mb-4 text-indigo-300">Customize Your Cartoon</h3>
        <p className="text-gray-400 mb-4">Describe the changes you want to make. For example: "Change the background to a sunny beach", "make the t-shirt red", or "add a pirate hat".</p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Change hair color to blue"
            className="flex-grow w-full px-4 py-2 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            disabled={isEditing || !cartoonImage}
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center px-6 py-2 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            disabled={isEditing || !prompt.trim() || !cartoonImage}
          >
            {isEditing ? 'Applying...' : 'Apply Edit'}
          </button>
        </form>
      </div>
      <div className="text-center">
        <button
            onClick={onReset}
            className="px-6 py-2 border border-gray-600 text-base font-medium rounded-md text-gray-300 hover:bg-gray-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 transition-colors"
            disabled={isEditing}
        >
            Start Over
        </button>
      </div>
    </div>
  );
};
