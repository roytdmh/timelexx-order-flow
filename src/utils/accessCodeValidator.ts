/**
 * Simple obfuscation for access code
 * Uses string reversal + character shifting
 * NOT cryptographically secure - just hides from casual inspection
 */

const SHIFT_AMOUNT = 3;

/**
 * Obfuscate a string by reversing it and shifting characters
 * Used to generate the obfuscated constant
 */
export const obfuscate = (input: string): string => {
  const reversed = input.split('').reverse().join('');
  return reversed
    .split('')
    .map(char => String.fromCharCode(char.charCodeAt(0) + SHIFT_AMOUNT))
    .join('');
};

/**
 * Deobfuscate a string by reversing the obfuscation process
 */
const deobfuscate = (obfuscated: string): string => {
  const unshifted = obfuscated
    .split('')
    .map(char => String.fromCharCode(char.charCodeAt(0) - SHIFT_AMOUNT))
    .join('');
  return unshifted.split('').reverse().join('');
};

// Pre-obfuscated access code
// Original: TimelexxInn00233
const OBFUSCATED_ACCESS_CODE = '66533qqL{{hohplW';

/**
 * Validate if the provided access code matches the expected code
 */
export const validateAccessCode = (input: string): boolean => {
  try {
    const originalCode = deobfuscate(OBFUSCATED_ACCESS_CODE);
    return input === originalCode;
  } catch {
    return false;
  }
};

/**
 * Get the deobfuscated access code for authentication
 * Only use this for Supabase auth password, never display it
 */
export const getAccessCode = (): string => {
  return deobfuscate(OBFUSCATED_ACCESS_CODE);
};
