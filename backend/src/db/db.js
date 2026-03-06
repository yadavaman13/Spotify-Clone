const mongoose = require("mongoose");

async function connectDB() {
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log("DB connected");
    }
    catch(err){
        console.log("DB not connected");
    }
}


module.exports = connectDB;