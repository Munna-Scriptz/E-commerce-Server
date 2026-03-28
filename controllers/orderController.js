const resHandler = require("../utils/resHandler")

const checkout = async (req, res) => {
    try {


        // ---------- Success 
        resHandler.success(res, 200, "Order created successfully")
    } catch (error) {
        resHandler.error(res, 500, "Internal server error")
    }
}


module.exports = { checkout }