import express from "express"
import { GoogleGenAI, Modality } from "@google/genai";
import * as fs from "node:fs";
import multer from "multer"
import {configDotenv} from "dotenv";

configDotenv({path:"./.env"})


const router=express.Router()

router.get("/",async(req,res)=>{
    res.send("Howdy")
})
const upload = multer({ storage: multer.memoryStorage() });

router.post("/redesign",upload.array("images"),async(req,res)=>{
    try{
        const ai = new GoogleGenAI({apiKey:process.env.GEMINI_API_KEY});
        const imageFiles=req.files

        if(!req.body.prompt && !imageFiles || imageFiles.length==0){
        return res.status(400).json({
            success:false,
            message:"Invalid request"
        })
        };
        const promptText=`Please do the following and create a new image:
            1. The core style, colors, and cultural elements of Image #1’s traditional Indian artform/textile remain dominant and unmistakable.  
            2. The design extracted from Image #2 is harmoniously integrated so that it feels native to the original craft rather than an overlay.  
            3. Seamlessly Craft and recreate Image #2 in the style of Image #1, for example it may be a painting, so paint it the same way, or it might be a weave so recreate a weave in that design etc.
            Recreate the second image in the art style of the first image, make sure it's coherent 
            [User's added customisation: ${req.body.prompt}]`
        const imageParts = imageFiles.map((file) => ({
        inlineData: {
            mimeType: file.mimetype,
            data: file.buffer.toString("base64"),
        },
        }));

        const prompt= [
        ...imageParts, 
        { text: promptText }, 
        ];
        console.log(prompt)
        const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-image-preview",
        contents: prompt,
        });
        for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            const imageData = part.inlineData.data;
            const mimeType = part.inlineData.mimeType;
            const buffer = Buffer.from(imageData, "base64");
            res.setHeader('Content-Type', mimeType);
            return res.send(buffer);
        }
        }
        return res.status(400).json({
            success:false,
            message:"Sorry, there was something wrong with your request, please check and try again"})}
    catch(err){
        res.status(500).json({
            success:false,
            message:"Internal server, unable to process your request"
        })
        console.log(err.message)
    }
})

export default router
