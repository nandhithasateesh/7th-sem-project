export const uploadFile = async (file, mode = 'normal', customFileName = null) => {
  const formData = new FormData();
  
  // Handle Blob with custom filename
  if (customFileName && file instanceof Blob) {
    formData.append('file', file, customFileName);
  } else {
    formData.append('file', file);
  }
  
  formData.append('mode', mode);

  try {
    const uploadUrl = `${window.location.protocol}//${window.location.hostname}:5000/api/upload`;
    console.log('[Upload] Uploading file to:', uploadUrl);
    
    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    console.log('[Upload] Server response:', data);

    if (!response.ok) {
      console.error('[Upload] Upload failed:', data.error);
      throw new Error(data.error || 'Upload failed');
    }

    console.log('[Upload] Upload completed successfully');
    return data;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};

export const deleteFile = async (filename, mode = 'normal') => {
  try {
    const deleteUrl = `${window.location.protocol}//${window.location.hostname}:5000/api/upload/${filename}?mode=${mode}`;
    const response = await fetch(deleteUrl, {
      method: 'DELETE',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Delete failed');
    }

    return data;
  } catch (error) {
    console.error('Delete error:', error);
    throw error;
  }
};

export const getFileUrl = (filename, mode = 'normal') => {
  return `${window.location.protocol}//${window.location.hostname}:5000/api/uploads/${mode === 'secure' ? 'secure/' : ''}${filename}`;
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

export const getFileIcon = (mimetype) => {
  if (mimetype.startsWith('image/')) return '🖼️';
  if (mimetype.startsWith('video/')) return '🎥';
  if (mimetype.startsWith('audio/')) return '🎵';
  if (mimetype.includes('pdf')) return '📄';
  if (mimetype.includes('word') || mimetype.includes('document')) return '📝';
  if (mimetype.includes('powerpoint') || mimetype.includes('presentation')) return '📊';
  if (mimetype.includes('excel') || mimetype.includes('sheet')) return '📈';
  return '📎';
};
