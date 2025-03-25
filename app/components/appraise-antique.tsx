const handleImageUpload = async (file: File) => {
  try {
    setIsUploading(true);
    
    // Create a form data object
    const formData = new FormData();
    formData.append('file', file);
    
    // Upload the image to the server
    const response = await fetch('/api/upload-image', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Upload failed:', errorData);
      throw new Error(errorData.error || 'Failed to upload image');
    }
    
    const data = await response.json();
    
    // Add the uploaded image to the list
    setImageUrls(prev => [...prev, data.url]);
  } catch (error) {
    console.error('Error uploading image:', error);
    toast({
      title: 'Upload Failed',
      description: error instanceof Error ? error.message : 'Failed to upload image',
      variant: 'destructive',
    });
  } finally {
    setIsUploading(false);
  }
}; 