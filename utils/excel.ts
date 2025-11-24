import * as XLSX from 'xlsx';
import { Lead, ColumnMapping } from '../types';
import { cleanPhoneNumber } from './formatters';

// Mapeamento expandido para incluir termos comuns do Growman e Scrapers de Google Maps
const MAPPING: ColumnMapping = {
  name: [
    'nome', 'name', 'full_name', 'fullname', 'full name', // Padrão
    'title', 'razao', 'cliente', 'customer', 'place_name', // CRM / Maps
    'business_name', 'external_url' 
  ],
  username: [
    // Padrão Excel/Instagram
    'usuario', 'user', 'username', 'user_name', 
    'instagram', 'ig', 'perfil', 'profile', 'handle',
    // Scrapers Google Maps JSON
    'instagram_url', 'social_media', 'social', 'links', 'website', 'site'
  ],
  phone: [
    'telefone', 'celular', 'phone', 'mobile', // Padrão
    'whatsapp', 'wpp', 'cel', 'tel', 'contato', 'contact', 'numero', // Variações BR
    'phone_number', 'contact_phone_number', 'public_phone_country_code', 'whatsapp_number', // Growman
    'formatted_phone_number', 'international_phone_number' // Google Maps Scraper
  ]
};

const findColumnKey = (row: any, candidates: string[]): string | undefined => {
  const keys = Object.keys(row);
  // Busca exata ou parcial, ignorando case e underlines/espaços
  return keys.find(key => {
    const normalizedKey = key.toLowerCase().replace(/[_-\s]/g, '');
    return candidates.some(candidate => {
      const normalizedCandidate = candidate.toLowerCase().replace(/[_-\s]/g, '');
      return normalizedKey.includes(normalizedCandidate);
    });
  });
};

/**
 * Processa um array de objetos brutos (seja vindo do Excel ou JSON)
 * e aplica as heurísticas de limpeza e detecção de campos.
 */
const processRawData = (jsonData: any[]): Lead[] => {
  if (jsonData.length === 0) return [];

  // Tenta encontrar uma linha que seja objeto para detectar as colunas
  const firstRow = jsonData.find(r => r && typeof r === 'object') || jsonData[0];
  
  if (!firstRow) return [];

  const nameKey = findColumnKey(firstRow, MAPPING.name);
  const userKey = findColumnKey(firstRow, MAPPING.username);
  const phoneKey = findColumnKey(firstRow, MAPPING.phone);

  return jsonData.map((row: any, index: number) => {
    // Extract raw values
    let rawName = nameKey ? row[nameKey] : (row['name'] || row['nome'] || '');
    let rawUser = userKey ? row[userKey] : (row['username'] || row['usuario'] || '');
    let rawPhone = phoneKey ? row[phoneKey] : '';

    // Fallback: Scrapers
    if (!rawPhone) {
       // Tenta combinar DDI + Telefone se estiverem separados
       if (row['public_phone_country_code'] && row['public_phone_number']) {
          rawPhone = row['public_phone_country_code'] + row['public_phone_number'];
       }
    }

    // Se o 'website' ou 'social' for pego como userKey, verifique se é realmente instagram
    if (rawUser && String(rawUser).startsWith('http') && !String(rawUser).includes('instagram.com')) {
        // Se pegou um link que não é instagram (ex: facebook ou site próprio), limpa
        rawUser = '';
    }

    let nameStr = String(rawName || '').trim();
    let userStr = String(rawUser || '').trim();
    let phoneClean = cleanPhoneNumber(rawPhone);

    // --- HEURISTICS ---

    // 1. Check if 'username' field looks like a phone number
    // Skip this check if userStr is a URL (http)
    if (!userStr.startsWith('http')) {
        const userDigits = userStr.replace(/\D/g, '');
        const isPhoneInUser = 
           (userDigits.length >= 8 && !/[a-zA-Z]/.test(userStr)) || 
           /^@?55\d+/.test(userStr.replace(/\s/g, '')) || 
           (userDigits.length / userStr.length > 0.8 && userStr.length > 6); 

        if (isPhoneInUser) {
           if (!phoneClean) {
               phoneClean = cleanPhoneNumber(userStr);
           }
           userStr = ''; 
        }
    }

    // 2. Check if 'name' looks like a handle (only if userStr is empty)
    if (!userStr && /^[a-zA-Z0-9._]+$/.test(nameStr) && nameStr.length > 2) {
         // This heuristics is risky for business names, applied cautiously
         // Disabled for now as business names can be single words like "Fitness"
         // userStr = nameStr; 
    }

    // 3. Clean up username IF it's not a direct link
    if (!userStr.startsWith('http')) {
        // Remove instagram URL parts legacy
        userStr = userStr.replace(/^(https?:\/\/)?(www\.)?instagram\.com\//i, '');
        userStr = userStr.split('?')[0].replace(/\/$/, '').replace(/^@/, '').trim();
    }

    // STRICT CHECK: Remove garbage
    if (
        userStr.includes('googleusercontent') || 
        (userStr.length > 50 && !userStr.includes('instagram.com')) // Allow long urls only if instagram
    ) {
        userStr = '';
    }

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
        
        resolve(processRawData(jsonData));
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
};

export const parseJsonFile = async (file: File): Promise<Lead[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);
        let data: any[] = [];

        if (Array.isArray(parsed)) {
            data = parsed;
        } else if (typeof parsed === 'object' && parsed !== null) {
            // Tenta achar arrays comuns
            const possibleKeys = ['data', 'items', 'users', 'profiles', 'leads', 'results', 'places'];
            const foundKey = possibleKeys.find(key => Array.isArray(parsed[key]));
            
            if (foundKey) {
                data = parsed[foundKey];
            } else {
                const anyArray = Object.values(parsed).find(val => Array.isArray(val));
                if (anyArray) {
                    data = anyArray as any[];
                }
            }
        }
        
        resolve(processRawData(data));
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsText(file);
  });
};