import * as XLSX from 'xlsx';
import { Lead, ColumnMapping } from '../types';
import { cleanPhoneNumber } from './formatters';

// Mapeamento expandido para incluir termos comuns do Growman e outros extratores
const MAPPING: ColumnMapping = {
  name: [
    'nome', 'name', 'full_name', 'fullname', 'full name', // Padrão
    'title', 'razao', 'cliente', 'customer', // CRM
    'business_name', 'external_url' // Growman/Scrapers as vezes jogam nome aqui se não tiver full_name
  ],
  username: [
    'usuario', 'user', 'username', 'user_name', // Padrão
    'instagram', 'ig', 'perfil', 'profile', 'link', 'handle', 'url', // Variações
    'profile_url', 'user_id' // Scrapers
  ],
  phone: [
    'telefone', 'celular', 'phone', 'mobile', // Padrão
    'whatsapp', 'wpp', 'cel', 'tel', 'contato', 'contact', 'numero', // Variações BR
    'phone_number', 'contact_phone_number', 'public_phone_country_code', 'whatsapp_number', // Growman/Scrapers
    'contact_phone'
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

    // Fallback: Se não achou telefone na coluna principal, tenta procurar em colunas comuns de scrapers
    if (!rawPhone) {
       // Tenta combinar DDI + Telefone se estiverem separados (comum em alguns exports)
       if (row['public_phone_country_code'] && row['public_phone_number']) {
          rawPhone = row['public_phone_country_code'] + row['public_phone_number'];
       }
    }

    let nameStr = String(rawName || '').trim();
    let userStr = String(rawUser || '').trim();
    let phoneClean = cleanPhoneNumber(rawPhone);

    // --- HEURISTICS TO FIX BAD DATA ---

    // 1. Check if 'username' field looks like a phone number (e.g. @5507...)
    const userDigits = userStr.replace(/\D/g, '');
    const isPhoneInUser = 
       (userDigits.length >= 8 && !/[a-zA-Z]/.test(userStr)) || // Mostly digits, no letters
       /^@?55\d+/.test(userStr.replace(/\s/g, '')) || // Starts with 55
       (userDigits.length / userStr.length > 0.8 && userStr.length > 6); // > 80% digits

    if (isPhoneInUser) {
       if (!phoneClean) {
           phoneClean = cleanPhoneNumber(userStr);
       }
       userStr = ''; 
    }

    // 2. Check if 'name' field looks like a username
    const isNameHandle = /^[a-zA-Z0-9._]+$/.test(nameStr);
    if (!userStr && isNameHandle && nameStr.length > 2) {
        userStr = nameStr;
    }

    // 3. Clean up username
    userStr = userStr.replace(/^(https?:\/\/)?(www\.)?instagram\.com\//i, '');
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
            // Tenta achar arrays comuns em respostas de API ou Scrapers
            // Ex: { "data": [...], "items": [...] }
            const possibleKeys = ['data', 'items', 'users', 'profiles', 'leads', 'results'];
            const foundKey = possibleKeys.find(key => Array.isArray(parsed[key]));
            
            if (foundKey) {
                data = parsed[foundKey];
            } else {
                // Se não achou por nome, pega qualquer propriedade que seja array
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