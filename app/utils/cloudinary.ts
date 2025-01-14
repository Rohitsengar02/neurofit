const uploadToCloudinary = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);
    formData.append('folder', 'neurofitness');
    formData.append('resource_type', 'auto');

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    if (!cloudName) {
      throw new Error('Cloudinary cloud name is not configured');
    }

    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

    console.log('Starting Cloudinary upload...');
    console.log('File type:', file.type);
    console.log('File size:', file.size);

    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Cloudinary error response:', errorData);
      throw new Error(errorData.error?.message || `Upload failed with status: ${response.status}`);
    }

    const responseData = await response.json();
    console.log('Cloudinary upload successful');

    return {
      url: responseData.secure_url,
      publicId: responseData.public_id,
    };
  } catch (error: any) {
    console.error('Cloudinary upload error:', {
      message: error.message,
      name: error.name,
      stack: error.stack,
    });
    throw new Error(error.message || 'Failed to upload image to Cloudinary');
  }
};

export { uploadToCloudinary };
