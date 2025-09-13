import express from "express"
import pg from "pg"
import { pool } from "../config/db.js"
const router=express.Router()

router.get("/fetch-products",async(req,res)=>{
    try{
        const result=await pool.query(`SELECT a.id as id, a.name as title, a.price as price, a.img_url
            as img_url, a.description as description, a.customisable as customisable, CONCAT(s.name,', ', s.state,', ', s.city,', ', s.pincode) as seller from artisan_products as a inner join sellers as s on s.id=a.seller_id`)
        return res.json(result.rows)
    }
    catch(err){
        console.log(err.message)
        res.status(500).json({
            success:false,
            message:"Internal server error, unable to process your request at the moment"
        })
    }
})

router.get("/product-details/:id",async(req,res)=>{
    const {id}=req.params
    if(!id){
        return res.status(400).json
        ({
            message:"Invalid request",
            success:false
        })
    }
    try{
        const result=await pool.query(`SELECT a.id as id, a.name as title, a.price as price, a.img_url
            as img_url,a.description as description, a.customisable as customisable, CONCAT(s.name,', ', s.state,', ', s.city,', ', s.pincode) as seller from artisan_products as a inner join sellers as s on s.id=a.seller_id where
            a.id=$1`,[id])
        if(!result.rowCount){
            return res.status(404).json({
                message:"Unable to find the given product",
                success:false
            })
        }
        return res.status(200).json(result.rows[0])
    }
    catch(err){
        console.log(err.message)
        return res.status(500).json({
            success:false,
            message:"Internal server error"
        })
    }
})

export default router