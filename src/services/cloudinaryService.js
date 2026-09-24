const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export async function uploadCloudinaryImage(file, folder) {
  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary upload preset is not configured');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', folder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
    { method: 'POST', body: formData }
  );
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error?.message || 'Cloudinary upload failed');
  }

  return result.secure_url;
}
