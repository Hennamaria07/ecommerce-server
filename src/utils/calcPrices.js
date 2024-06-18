export const calcOrderPrices = (orderItems) => {
    const itemsPrice = orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const shippingPrice = itemsPrice < 500 ? 50 : 0;
    const taxPrice = Math.round(itemsPrice * 0.01); // Calculate tax and round to nearest integer
    const totalPrice = itemsPrice + shippingPrice + taxPrice;

    return {
        itemsPrice: parseInt(itemsPrice.toFixed(0)),   // Convert to integer after rounding
        totalPrice: parseInt(totalPrice.toFixed(0)),   // Convert to integer after rounding
        shippingPrice: parseInt(shippingPrice.toFixed(0)), // Convert to integer after rounding
        taxPrice: parseInt(taxPrice.toFixed(0))         // Convert to integer after rounding
    };
};
