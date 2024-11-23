class ShoppingCart {
    private static instance: ShoppingCart;
    private items: { bookId: string; title: string; price: string; quantity: number }[] = [];

    private constructor() {}

    static getInstance() {
        if (!ShoppingCart.instance) {
            ShoppingCart.instance = new ShoppingCart();
        }
        return ShoppingCart.instance;
    }

    addItem(bookId: string, title: string, price: string, quantity: number) {
        const existingItem = this.items.find((item) => item.bookId === bookId);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.items.push({ bookId, title, price, quantity });
        }
    }

    getItems() {
        return this.items;
    }

    clearCart() {
        this.items = [];
    }
}

export default ShoppingCart;
