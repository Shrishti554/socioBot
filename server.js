import { Telegraf } from "telegraf";

import {message } from 'telegraf/filters';

import OpenAI from 'openai';

import eventModel from './src/models/Event.js'

import userModel from './src/models/user.js'

import connectDB from './config/db.js'

const bot = new Telegraf(process.env.BOT_TOKEN);


const openai = new OpenAI({
    apiKey: process.env['OPENAI_KEY'], // This is the default and can be omitted
  });
  

try{
connectDB();

console.log("database connected")
}catch(err){
     console.log(err);
     process.kill(process.pid,'SIGTERM');
}





bot.start(async(ctx)=>{
    const from =ctx.update.message.from;

    console.log("from", from);
     try{
        await userModel.findOneAndUpdate({tgId: from.id},{
            $setOnInsert:{
                firstName: from.firstName,
                lastName: from.lastName,
                
                isBot: from.is_bot,
                userName: from.userName
            }
        },{upsert:true , new:true})

            //store the user infomationin 
  await ctx.reply(
  `hey! ${from.first_name} , welcome lets shine insocial media together`
  );
     }catch(err){
       console.log(err);

       await ctx.reply("something went wrong ,  facing difficulties ")
     }
    }
    
)


bot.command('generate', async(ctx)=>{
    const from =ctx.update.message.from;

const startOfTheDay=new Date()
startOfTheDay.setHours(0, 0, 0, 0);

const endOfTheDay=new Date();
endOfTheDay.setHours(29 , 59 , 59 , 999)



    //get events for the users
    const events =   await eventModel.find({
        tgId:from.Id,
        createdAt:{
            $gte: startOfTheDay,
            $lte:endOfTheDay,
        }
    });

console.log("events",events);

    if(events.length===0){
        await ctx.reply("No events for today :(")
    return;
    };
    //make open ai api call

try{
    const chatCompletion = await openai.chat.completions.create({
        messages:[
           {
            role:"system",
            content:"You are a social media bot, I am a chatbot, I am here to generate posts for you"
           },
           {
            role:"user",
            content:`write like a human for human : ,${events.map(event=>event.text).join(",")}`
           },
        ],
        model:process.env.OPENAI_MODEL,
    })
    console.log("completion",chatCompletion);
    await ctx.reply("doing things ");
}catch(err){
console.log("facing erros")
}

    //store token count
    //send response

});


bot.on(message("text"), async(ctx)=>{
    const from =ctx.update.message.from;
    const message = ctx.update.message.text;
    

    try{
       await eventModel.create({
        text:message,
        tgId:from.id
       });
      await  ctx.reply(" noted keep texting me your thoughts to generate the post please enterthe command :/generate"); 
    }catch(err){
        console.log(err);
        await ctx.reply("Something went wrong,facimg some issues")
    }
    
})


bot.launch();
// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
