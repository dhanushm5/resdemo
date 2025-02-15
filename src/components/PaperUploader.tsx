import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';
import { pdfjs } from 'react-pdf';
import { supabase } from '../lib/supabase';
import { summarizePaper } from '../lib/gemini';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PaperUploaderProps {
  onUpload: (text: string, fileName: string) => Promise<void>;
}

export function PaperUploader({ onUpload }: PaperUploaderProps) {
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    try {
      console.log('Processing PDF file:', file.name);
      
      // Read PDF file
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument(arrayBuffer).promise;
      let fullText = '';

      // Extract text from each page
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + ' ';
      }

      console.log('PDF text extracted, generating summary...');
      
      // Get summary from Gemini API
      const summary = await summarizePaper(fullText);
      console.log('Summary generated');

      // Save to Supabase
      const { data, error } = await supabase
        .from('papers')
        .insert([
          {
            title: file.name,
            summary,
            full_text: fullText,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(error.message);
      }

      console.log('Paper saved to database:', data);
      await onUpload(fullText, file.name);
    } catch (error: any) {
      console.error('Error processing PDF:', error);
      alert(error.message || 'Error processing PDF file');
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
  });

  return (
    <div
      {...getRootProps()}
      className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
    >
      <input {...getInputProps()} />
      <Upload className="mx-auto h-12 w-12 text-gray-400" />
      <p className="mt-2 text-sm text-gray-600">
        {isDragActive
          ? 'Drop the PDF here'
          : 'Drag and drop a PDF file here, or click to select'}
      </p>
    </div>
  );
}