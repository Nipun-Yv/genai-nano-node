import express from "express"
import nano from "./routes/nano-banana.js"
import products from "./routes/products.js"
import cors from "cors"
import { connectDB } from "./config/db.js"

const port=process.env.PORT||4000
const app=express()

app.use(cors({origin:"*"}))
app.use("/image-gen",nano)
app.use("/products",products)

app.get("/health",(req,res)=>{
    res.send("Server healthy")
})

connectDB()
    .then(()=>app.listen(port,()=>{
                console.log(`Server running successfully and receving requests from port ${port}`)
        }))
    .catch((err)=>{
        console.log("Error starting up the server")
    })