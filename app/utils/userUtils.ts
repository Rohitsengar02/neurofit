export const extractNameFromEmail = (email: string): string => {
  if (!email) return '';
  
  // Get the part before @ symbol
  const localPart = email.split('@')[0];
  
  // Remove numbers and special characters, keep only letters
  const nameOnly = localPart.replace(/[^a-zA-Z]/g, '');
  
  // Capitalize first letter and make rest lowercase
  return nameOnly.charAt(0).toUpperCase() + nameOnly.slice(1).toLowerCase();
};
