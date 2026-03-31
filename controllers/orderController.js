const cartSchema = require("../models/cartSchema");
const orderSchema = require("../models/orderSchema");
const resHandler = require("../utils/resHandler")
const { ObjectId } = require('mongodb');
const stripe = require('stripe')(process.env.STRIPE_SEC_KEY);

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
        const existingCart = await cartSchema.findOne({ _id: cartId }).populate("items.product")
        if (!existingCart) return resHandler.error(res, 404, "Product doesn't exist")
        if (!user) return resHandler.error(res, 404, "user not found")
            console.log(existingCart)
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

        // ---------- Cod Success 
        if (paymentMethod === "cod") return resHandler.success(res, 200, "Order placed successfully")

        // ---------- Handle stripe payment 
        if (paymentMethod === "stripe") {
            const session = await stripe.checkout.sessions.create({
                mode: 'payment',
                line_items: [
                    {
                        price_data: {
                            currency: 'bdt',
                            product_data: {
                                name: 'T-Shirt',
                                description: `Blue T-Shirt with chest print`,
                            },
                            unit_amount: 1000 * 100,
                        },
                        quantity: 1,
                    }
                ],
                customer_email: `${req.user.email}`,
                success_url: `https://rexifyshop.vercel.app/checkout/complete`,
                cancel_url: `https://rexifyshop.vercel.app/checkout/error`,
            });
            // res.redirect(303, session.url);

            // ------------- Success 
            resHandler.success(res, 200, "Please complete the checkout", session.url)
        }

    } catch (error) {
        console.log(error)
        resHandler.error(res, 500, "Internal server error")
    }
}


module.exports = { checkout }