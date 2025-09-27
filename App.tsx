
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { EditorWorkspace } from './components/EditorWorkspace';
import { Footer } from './components/Footer';
import { Loader } from './components/Loader';
import { ImageState } from './types';
import { convertToCartoon, editImage } from './services/geminiService';

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<ImageState>(null);
  const [cartoonImage, setCartoonImage] = useState<ImageState>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = useCallback(async (file: File) => {
    setError(null);
    setIsLoading(true);
    setLoadingMessage('Reading your image...');
    
    const reader = new FileReader();
    reader.onloadend = async () => {
      const dataUrl = reader.result as string;
      setOriginalImage({ dataUrl, mimeType: file.type });
      setCartoonImage(null); // Reset cartoon image on new upload

      try {
        setLoadingMessage('Cartoonifying your masterpiece...');
        const { base64Data, mimeType } = await convertToCartoon(dataUrl);
        const newCartoonDataUrl = `data:${mimeType};base64,${base64Data}`;
        setCartoonImage({ dataUrl: newCartoonDataUrl, mimeType });
      } catch (e) {
        console.error(e);
        setError('Failed to generate cartoon image. Please try another photo.');
      } finally {
        setIsLoading(false);
        setLoadingMessage('');
      }
    };
    reader.onerror = () => {
        setError('Failed to read the image file.');
        setIsLoading(false);
    }
    reader.readAsDataURL(file);
  }, []);

  const handleEditRequest = useCallback(async (prompt: string) => {
    if (!cartoonImage) {
      setError('No cartoon image to edit.');
      return;
    }
    setError(null);
    setIsLoading(true);
    setLoadingMessage('Applying your creative edits...');

    try {
      const { base64Data, mimeType } = await editImage(cartoonImage.dataUrl, prompt);
      const newCartoonDataUrl = `data:${mimeType};base64,${base64Data}`;
      setCartoonImage({ dataUrl: newCartoonDataUrl, mimeType });
    } catch (e) {
      console.error(e);
      setError('Failed to apply edits. The AI might be stumped! Please try a different prompt.');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [cartoonImage]);

  const handleReset = () => {
    setOriginalImage(null);
    setCartoonImage(null);
    setError(null);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col font-sans">
      {isLoading && <Loader message={loadingMessage} />}
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg relative mb-6" role="alert">
              <strong className="font-bold">Oops! </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          {!originalImage ? (
            <ImageUploader onImageUpload={handleImageUpload} disabled={isLoading} />
          ) : (
            <EditorWorkspace
              originalImage={originalImage}
              cartoonImage={cartoonImage}
              onEditRequest={handleEditRequest}
              onReset={handleReset}
              isEditing={isLoading}
            />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;
