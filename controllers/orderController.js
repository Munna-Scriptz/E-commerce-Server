const cartSchema = require("../models/cartSchema");
const orderSchema = require("../models/orderSchema");
const resHandler = require("../utils/resHandler")
const { ObjectId } = require('mongodb');

const checkout = async (req, res) => {
    try {
        const { paymentType, cartId, shippingAddress, division, insideDhaka, } = req.body

        // ------- Validation
        if (!paymentType) return resHandler.error(res, 400, "Payment type is required")
        if (!cartId) return resHandler.error(res, 400, "Unauthorized request")
        if (!ObjectId.isValid(cartId)) return resHandler.error(res, 400, "Invalid order request")
        if (!shippingAddress) return resHandler.error(res, 400, "Shipping address is required")
        if (!division) return resHandler.error(res, 400, "Division is required")

        // ----- Find from db
        const existingCart = await cartSchema.findOne({ _id: cartId })
        if (!existingCart) return resHandler.error(res, 404, "Product doesn't exist")

        // ----- Price and charges
        const deliveryCharge = insideDhaka ? 80 : 120

        const totalPrice = existingCart.items.reduce((charge, current) => {
            return charge + current.subTotal
        }, deliveryCharge)

        // ----- Save to db
        const order = orderSchema({
            user: req.user._id,
            items: existingCart.items,
            totalPrice,
            shippingAddress,
            division,
            insideDhaka,
            deliveryCharge,
            

        })




        // ---------- Success 
        resHandler.success(res, 200, "Order created successfully", existingCart)
    } catch (error) {
        console.log(error)
        resHandler.error(res, 500, "Internal server error")
    }
}


module.exports = { checkout }