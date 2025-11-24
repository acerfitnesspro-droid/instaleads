import * as XLSX from 'xlsx';
import { Lead, ColumnMapping } from '../types';
import { cleanPhoneNumber } from './formatters';

const MAPPING: ColumnMapping = {
  name: ['nome', 'name', 'full_name', 'fullname', 'cliente', 'customer', 'title', 'razao'],
  username: ['usuario', 'user', 'username', 'instagram', 'ig', 'perfil', 'profile', 'link', 'handle'],
  phone: ['telefone', 'celular', 'phone', 'mobile', 'whatsapp', 'wpp', 'cel', 'tel', 'contato', 'contact', 'numero']
};

const findColumnKey = (row: any, candidates: string[]): string | undefined => {
  const keys = Object.keys(row);
  return keys.find(key => 
    candidates.some(candidate => key.toLowerCase().includes(candidate))
  );
};

export const parseExcelFile = async (file: File): Promise<Lead[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (jsonData.length === 0) {
          resolve([]);
          return;
        }

        // Detect columns from the first row
        const firstRow = jsonData[0] as any;
        const nameKey = findColumnKey(firstRow, MAPPING.name);
        const userKey = findColumnKey(firstRow, MAPPING.username);
        const phoneKey = findColumnKey(firstRow, MAPPING.phone);

        const leads: Lead[] = jsonData.map((row: any, index: number) => {
          // Extract raw values
          let rawName = nameKey ? row[nameKey] : (row['name'] || row['nome'] || '');
          let rawUser = userKey ? row[userKey] : (row['username'] || row['usuario'] || '');
          let rawPhone = phoneKey ? row[phoneKey] : '';

          let nameStr = String(rawName || '').trim();
          let userStr = String(rawUser || '').trim();
          let phoneClean = cleanPhoneNumber(rawPhone);

          // --- HEURISTICS TO FIX BAD DATA ---

          // 1. Check if 'username' field looks like a phone number (e.g. @5507...)
          // Logic: Remove non-digits. If length > 7 and looks numeric or starts with 55/@55, it's a phone.
          const userDigits = userStr.replace(/\D/g, '');
          const isPhoneInUser = 
             (userDigits.length >= 8 && !/[a-zA-Z]/.test(userStr)) || // Mostly digits, no letters
             /^@?55\d+/.test(userStr.replace(/\s/g, '')) || // Starts with 55
             (userDigits.length / userStr.length > 0.8 && userStr.length > 6); // > 80% digits

          if (isPhoneInUser) {
             // It is likely a phone number stuck in the user column
             if (!phoneClean) {
                 phoneClean = cleanPhoneNumber(userStr);
             }
             userStr = ''; // Clear invalid username
          }

          // 2. Check if 'name' field looks like a username (e.g. "milenapereira9616")
          // Logic: No spaces, contains letters, optional numbers/dots/underscores
          // This fixes cases where the Name column actually holds the IG Handle
          const isNameHandle = /^[a-zA-Z0-9._]+$/.test(nameStr);

          // If we don't have a username yet (or we cleared it), and the name looks like a handle, use the name
          if (!userStr && isNameHandle && nameStr.length > 2) {
              userStr = nameStr;
          }

          // 3. Clean up username
          // Remove URL parts if present
          userStr = userStr.replace(/^(https?:\/\/)?(www\.)?instagram\.com\//i, '');
          // Remove query params, trailing slashes, and leading @
          userStr = userStr.split('?')[0].replace(/\/$/, '').replace(/^@/, '').trim();

          // Final cleanup for Name
          if (nameStr === 'Sem Nome' || !nameStr) {
              nameStr = userStr || 'Lead sem nome';
          }

          return {
            id: `lead-${index}-${Date.now()}`,
            name: nameStr,
            username: userStr,
            originalPhone: rawPhone,
            phone: phoneClean,
            status: 'pending'
          };
        });

        resolve(leads);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
};