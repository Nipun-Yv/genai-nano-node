import express from "express"

import { pool } from "../config/db.js"
const router=express.Router()

router.get("/attractions",async(req,res)=>{
    try{
        const result=await pool.query(`select id, name, description, "imageUrl", category,
            rating, duration, price from attractions where "locationId"='delhi_india' and "isActive"=TRUE`)
        if(!result.rowCount){
            return res.status(404).json({
                success:false,
                message:"Unable to fetch attractions for the given location"
            })
        }
        res.status(200).json(result.rows)
    }
    catch(err){
        console.log(err.message)
        res.status(500).json({
            success:false,
            message:"Unable to process your request, internal server error"
        })
    }
})

router.get("/attractions/:id",async(req,res)=>{
    const {id}=req.params
    if(!id){
        return res.status(400).json({
            success:false,
            message:"Invalid request"
        })
    }
    try{
        const result=await pool.query(`select id, name, description, "imageUrl", category,
            rating, duration, price from attractions where id=$1`,[id])
        if(!result.rowCount){
            return res.status(404).json({
                success:false,
                message:"Unable to fetch attractions for the given location"
            })
        }
        res.status(200).json(result.rows[0])
    }
    catch(err){
        console.log(err.message)
        res.status(500).json({
            success:false,
            message:"Unable to process your request, internal server error"
        })
    }
})

router.get("/attractions/:id/activities",async(req,res)=>{
    const {id}=req.params
    if(!id){
        return res.status(400).json({
            success:false,
            message:"Invalid request"
        })
    }
    try{
        const result=await pool.query(`select id,name,description,price,duration,
    category,latitude,longitude, "attractionId" from activities where "attractionId" =$1`,[id])
        if(!result.rowCount){
            return res.status(404).json({
                success:false,
                message:"Unable to fetch attractions for the given location"
            })
        }
        res.status(200).json(result.rows)
    }
    catch(err){
        console.log(err.message)
        res.status(500).json({
            success:false,
            message:"Unable to process your request, internal server error"
        })
    }
})

export default router