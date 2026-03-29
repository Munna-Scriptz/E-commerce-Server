const cartSchema = require("../models/cartSchema");
const orderSchema = require("../models/orderSchema");
const resHandler = require("../utils/resHandler")
const { ObjectId } = require('mongodb');

const checkout = async (req, res) => {
    try {
        const user = req.user._id
        const { paymentMethod, cartId, shippingAddress, division, } = req.body

        // ------- Validation
        if (!paymentMethod) return resHandler.error(res, 400, "Payment type is required")
        if (!cartId) return resHandler.error(res, 400, "Unauthorized request")
        if (!ObjectId.isValid(cartId)) return resHandler.error(res, 400, "Invalid order request")
        if (!shippingAddress) return resHandler.error(res, 400, "Shipping address is required")
        if (!division) return resHandler.error(res, 400, "Division is required")

        // ----- Find from db
        const existingCart = await cartSchema.findOne({ _id: cartId })
        if (!existingCart) return resHandler.error(res, 404, "Product doesn't exist")
        if (!user) return resHandler.error(res, 404, "user not found")

        // ----- Price and charges
        const insideDhaka = division.toLowerCase() == "dhaka"
        const deliveryCharge = insideDhaka ? 80 : 120

        const totalPrice = existingCart.items.reduce((charge, current) => {
            return charge + current.subTotal
        }, deliveryCharge)

        const orderId = `ORDER-${Math.random().toString(36).substring(2, 10).toUpperCase()}`

        // ----- Save to db
        const order = orderSchema({
            user,
            items: existingCart.items,
            payment: {
                method: paymentMethod
            },
            totalPrice,
            shippingAddress,
            division,
            insideDhaka,
            deliveryCharge,
            orderId
        })

        order.save()


        // ---------- Success 
        resHandler.success(res, 200, "Order placed successfully")
    } catch (error) {
        console.log(error)
        resHandler.error(res, 500, "Internal server error")
    }
}


module.exports = { checkout }