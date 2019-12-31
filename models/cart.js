
module.exports = function Cart(oldCart) {
    //! Gets the old cart 
    this.items = oldCart.items || {};
    this.totalQty = oldCart.totalQty || 0;
    this.totalPrice = oldCart.totalPrice || 0;

    //! Add item to cart
    this.add = function (item, id, qty = 1) {

        //! Find product in Cart
        let storedItem = this.items[id];

        if (!storedItem) {
            //! If its a new Product create a record
            storedItem = this.items[id] = { item: item, qty: 0, price: 0 };
        }

        //! now that it exists, update it.
        storedItem.qty++;
        storedItem.price = storedItem.item.price * storedItem.qty;

        //! Update Cart
        this.totalQty++;
        this.totalPrice += storedItem.item.price;
    }

    this.reduceByOne = function (id) {
        this.items[id].qty--;
        this.items[id].price -= this.items[id].item.price;
        this.totalQty--;
        this.totalPrice -= this.items[id].item.price;

        if (this.items[id].qty <= 0) {
            delete this.items[id];
        }
    }

    this.removeItem = function (id) {
        this.totalQty -= this.items[id].qty;
        this.totalPrice -= this.items[id].price;
        delete this.items[id]
        console.log(this);
        
    }

    this.generateArray = function () {
        let arr = [];
        for (let id in this.items) {
            arr.push(this.items[id]);
        }
        return arr;
    }
}