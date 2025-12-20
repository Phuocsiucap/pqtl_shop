// Shared helpers for price calculations across search, cart, and product cards
export const computeFinalPrice = (product = {}) => {
  const basePrice = Number(product.price) || 0;
  const discount = Number(product.discount) || 0;
  const clearanceDiscount = Number(product.clearanceDiscount) || 0;

  if (product.isClearance && clearanceDiscount > 0) {
    return Math.max(0, basePrice * (1 - clearanceDiscount / 100));
  }

  return Math.max(0, basePrice - discount);
};
