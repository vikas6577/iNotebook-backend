const mongoose=require('mongoose');
const mongoURI="mongodb://localhost:27017"

const connnectToMongo=()=>{
    mongoose.connect(mongoURI, ()=>{
        console.log("Connected to Mongo Successfully")
    })
}

module.exports=connnectToMongo;