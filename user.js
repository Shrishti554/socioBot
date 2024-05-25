import mongoose from "mongoose";

import { Completions } from "openai/resources/completions.mjs";
const userSchema=mongoose.Schema({

    tgId : { 
        type : String , 
        required: true,
        unique : true,
        

    },
    
    firstName:{
        type : String,
        required : true,
    },
    lastName:{
        type : String,
        required : true,
    },
    isBot:{
        type : Boolean,
        required : true,
    },
    userName:{
        type : String,
        required : true,
        unique : true,
    },
    promptTokens:{
        type : Number,
        required : false,
    },
    completionTokens:{
        type : Number,
        required : false,
    },
}, {timestamps:true});
export default mongoose.model("user", userSchema);