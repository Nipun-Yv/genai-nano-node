import express from "express"
import NanoApi from "./routes/nano-banana.js"
import ProductApi from "./routes/products.js"
import AttractionsApi from "./routes/explore.js"
import cors from "cors"
import { connectDB } from "./config/db.js"

const port=process.env.PORT||4000
const app=express()

app.use(cors({origin:"*"}))
app.use(express.json())
app.use("/image-gen",NanoApi)
app.use("/products",ProductApi)
app.use("/explore",AttractionsApi)

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