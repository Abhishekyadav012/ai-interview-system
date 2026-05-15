const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

require("dotenv").config()
const app = require("./src/app")
const connectToDB = require("./src/config/database")

const port = process.env.PORT || 3000;

connectToDB()





app.listen(3000, () => {
    console.log("Server is running on port 3000")
})