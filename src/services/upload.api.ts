import axios from 'axios';

// Get base URL from environment
const baseURL = process.env.NEXT_PUBLIC_BASE_URL;

if (!baseURL) {
  throw new Error(
    'Missing NEXT_PUBLIC_BASE_URL. Set it in your website .env (e.g. https://api.st10.info/api/v1).'
  );
}

// Get auth token from localStorage
const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

/**
 * Upload a single file to S3
 * 
 * @param file - File object to upload
 * @param folder - Folder path in S3 (products, banners, profiles, documents, categories, vendors, kyc)
 * @returns Promise with S3 URL
 */
export const uploadFileToS3 = async (
  file: File,
  folder: 'products' | 'banners' | 'profiles' | 'documents' | 'categories' | 'vendors' | 'kyc' = 'products'
): Promise<string> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Authentication required. Please login first.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  try {
    // Use direct API call (not proxy) since upload needs multipart/form-data
    const response = await axios.post(
      `${baseURL}/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (response.data.success && response.data.data?.url) {
      return response.data.data.url;
    }

    throw new Error('Upload failed: Invalid response from server');
  } catch (error: any) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error(`Upload failed: ${error.message}`);
  }
};

/**
 * Upload multiple files to S3
 * 
 * @param files - Array of File objects to upload
 * @param folder - Folder path in S3
 * @returns Promise with array of S3 URLs
 */
export const uploadMultipleFilesToS3 = async (
  files: File[],
  folder: 'products' | 'banners' | 'profiles' | 'documents' | 'categories' | 'vendors' | 'kyc' = 'products'
): Promise<string[]> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Authentication required. Please login first.');
  }

  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });
  formData.append('folder', folder);

  try {
    // Use direct API call (not proxy) since upload needs multipart/form-data
    const response = await axios.post(
      `${baseURL}/upload/multiple`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (response.data.success && response.data.data?.files) {
      return response.data.data.files.map((file: any) => file.url);
    }

    throw new Error('Upload failed: Invalid response from server');
  } catch (error: any) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error(`Upload failed: ${error.message}`);
  }
};

/**
 * Convert file to Base64 data URL (for preview only)
 * This should NOT be sent to the backend - use uploadFileToS3 instead
 */
export const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
