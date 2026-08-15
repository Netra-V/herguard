export const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
export const isPhone = (v) => /^[\d+\-\s()]{7,15}$/.test(v);
export const minLen = (v, n) => v && v.length >= n;