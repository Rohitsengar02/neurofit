const uploadToCloudinary = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);
    formData.append('folder', 'profile-images');
    formData.append('resource_type', 'auto');

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

    console.log('Uploading to:', uploadUrl);
    console.log('Upload preset:', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);

    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json',
      },
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error('Upload error response:', responseData);
      throw new Error(responseData.error?.message || 'Upload failed');
    }

    console.log('Upload response:', responseData);

    return {
      url: responseData.secure_url,
      publicId: responseData.public_id,
    };
  } catch (error: any) {
    console.error('Detailed upload error:', {
      message: error.message,
      response: error.response,
    });
    throw error;
  }
};

export { uploadToCloudinary };
