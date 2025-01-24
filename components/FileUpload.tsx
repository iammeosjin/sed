import { useState } from 'preact/hooks';

export default function FileUpload({ uploadType }: { uploadType: string }) {
  const [isLoading, setIsLoading] = useState(false); // Track loading state

  const handleFileUpload = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (!target.files?.[0]) return;

    const file = target.files[0];
    const reader = new FileReader();

    // Read file content
    reader.onload = async (e) => {
      if (!e.target?.result) return;

      const csvData = e.target.result;
      setIsLoading(true); // Start loading state

      try {
        // Simulate a fetch call for demonstration purposes
        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: csvData }),
        });

        if (response.ok) {
          console.log('File uploaded successfully!');
          window.location.reload();
        } else {
          console.error('Failed to upload file');
        }
      } catch (error) {
        console.error('Error during upload:', error);
      } finally {
        setIsLoading(false); // End loading state
      }
    };

    // Read file as text
    reader.readAsText(file);
  };

  return (
    <div class='flex items-center space-x-4'>
      <label class='bg-purple-700 hover:bg-purple-600 text-white px-4 py-2 rounded cursor-pointer'>
        Upload {uploadType}
        <input
          type='file'
          accept='.csv'
          onChange={handleFileUpload}
          class='hidden'
        />
      </label>
      {isLoading && (
        <div class='flex items-center space-x-2'>
          <div class='relative w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin'>
          </div>
          <span class='text-gray-300'>Uploading...</span>
        </div>
      )}
    </div>
  );
}
