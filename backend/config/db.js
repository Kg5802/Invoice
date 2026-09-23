import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const mongo_url = process.env.MONGO_URL;

const connectDB = ()=>{
    mongoose.connect(mongo_url)
    .then(()=>{
        console.log('Mongodb Connected');
    })
    .catch((err)=>{
        console.log("MongoDB Connect Error :",err);
    })
}

export default connectDB;
