export const generateBasketId = async (id: string) => {
  // Encode as base64
  const base64 = btoa(id) // encode '9ddcce46-206b-4b2f-9002-f674fd36963a'
    .replace(/\+/g, '')      // remove '+' if any
    .replace(/\//g, '')      // remove '/' if any
    .replace(/=/g, '');      // remove '=' padding

  // Truncate to match your format length (e.g., 22 characters)
  return base64.substring(0, 22); // or 20/24/other length you prefer
};
