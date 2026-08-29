export const cpfMask = (value) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');
};

export const celularMask = (value) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{4})\d+?$/, '$1');
};

export const validateCPF = (cpf) => {
  cpf = cpf.replace(/\D/g, '');
  if (cpf.length !== 11 || !!cpf.match(/(\d)\1{10}/)) return false;

  const split = cpf.split('');
  let v1 = 0;
  let v2 = 0;

  for (let i = 0; i < 9; i++) {
    v1 = v1 + split[i] * (10 - i);
  }
  v1 = (v1 * 10) % 11;
  if (v1 === 10 || v1 === 11) v1 = 0;
  if (v1 != split[9]) return false;

  for (let i = 0; i < 10; i++) {
    v2 = v2 + split[i] * (11 - i);
  }
  v2 = (v2 * 10) % 11;
  if (v2 === 10 || v2 === 11) v2 = 0;
  if (v2 != split[10]) return false;

  return true;
};

export const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const randomCaptcha = () => ({
  num1: Math.floor(Math.random() * 10) + 1,
  num2: Math.floor(Math.random() * 10) + 1,
});
