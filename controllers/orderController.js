const cartSchema = require("../models/cartSchema")
const resHandler = require("../utils/resHandler")

const checkout = async (req, res) => {
    try {
        const { paymentType, cartId, shippingAddress, division, insideDhaka, } = req.body

        // ------- Validation
        if (!paymentType) return resHandler.error(res, 400, "Payment type is required")
        if (!cartId) return resHandler.error(res, 400, "Unauthorized request")
        if (!shippingAddress) return resHandler.error(res, 400, "Shipping address is required")
        if (!division) return resHandler.error(res, 400, "Division is required")
        if (!insideDhaka) return resHandler.error(res, 400, "Must choose it is inside dhaka or outside dhaka")
        // ----- Find from db
        const existingCart = cartSchema.find({ _id: cartId })
        if (!existingCart) return resHandler.error(res, 404, "Product doesn't exist")


        // ---------- Success 
        resHandler.success(res, 200, "Order created successfully")
    } catch (error) {
        resHandler.error(res, 500, "Internal server error")
    }
}


module.exports = { checkout }