
export const calcOrderPrices = (orderItems) => {
    const itemsPrice = orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const shippingPrice = itemsPrice < 500 ? 50 : 0;
    const taxPrice = (itemsPrice * 0.10).toFixed(2);
    const totalPrice = (itemsPrice + shippingPrice + parseFloat(taxPrice)).toFixed(2);
    return {
        itemsPrice: parseInt(totalPrice), 
        totalPrice: parseInt(totalPrice), 
        shippingPrice: parseInt(shippingPrice), 
        taxPrice: parseInt(taxPrice).toFixed(0)
    }
}