export const cleanPhoneNumber = (phone: any): string | null => {
  if (!phone) return null;
  
  // Convert to string in case it's a number from Excel
  const str = String(phone).trim();
  
  // Remove all non-numeric characters
  let cleaned = str.replace(/\D/g, '');

  // Basic validation: if too short, it's probably not a valid phone number
  if (cleaned.length < 8) return null;

  return cleaned;
};

export const formatPhoneNumberDisplay = (phone: string | null): string => {
  if (!phone) return 'Sem número';
  
  // Simple formatting for display only (assuming BR format mostly)
  if (phone.length === 11) { // 11 99999 9999
    return `(${phone.substring(0, 2)}) ${phone.substring(2, 7)}-${phone.substring(7)}`;
  }
  if (phone.length === 13 && phone.startsWith('55')) { // 55 11 99999 9999
    return `+55 (${phone.substring(2, 4)}) ${phone.substring(4, 9)}-${phone.substring(9)}`;
  }
  
  return phone;
};

export const generateWhatsAppLink = (phone: string, template: string, leadName: string): string => {
  // Replace placeholders
  const processedText = template.replace(/{nome}/gi, leadName || 'Cliente');
  
  const encodedText = encodeURIComponent(processedText);
  return `https://wa.me/${phone}?text=${encodedText}`;
};

export const generateInstagramLink = (username: string): string => {
  if (!username) return '';

  // Handle cases where the input might be a full URL already or contain @
  let cleanUser = String(username).trim();
  
  // Remove protocol and domain if user pasted a full link
  cleanUser = cleanUser.replace(/^(https?:\/\/)?(www\.)?instagram\.com\//i, '');
  
  // Remove query params
  cleanUser = cleanUser.split('?')[0];

  // Remove trailing slashes
  cleanUser = cleanUser.replace(/\/+$/, '');
  
  // Remove @ if present at start
  cleanUser = cleanUser.replace(/^@/, '').trim();
  
  if (!cleanUser) return '';

  // Return strictly the format requested: https://www.instagram.com/username/
  return `https://www.instagram.com/${cleanUser}/`;
};