import express from "express"

import { pool } from "../config/db.js"
import format from "pg-format"
const router=express.Router()

router.get("/attractions",async(req,res)=>{
    try{
        const result=await pool.query(`select id, name, description, "imageUrl", category,
            rating, duration, price from attractions where "locationId"='jharkhand_india' and "isActive"=TRUE`)
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

router.post("/finalize-itinerary/:id", async (req, res) => {
  const { id } = req.params;
  const { activities } = req.body;

  if (!id || !Array.isArray(activities) || activities.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid request: Missing ID or activities",
    });
  }

  try {
    var items=""

    for (var i=0;i<activities.length-1;i++){
        items+=`ROW('${activities[i].activity_id}','${activities[i].title}',
            '${activities[i].start}','${activities[i].end}',
            '${activities[i].color}','${activities[i].activity_type}'
        ),`
    }
    items+=`ROW('${activities[i].activity_id}','${activities[i].title}',
            '${activities[i].start}','${activities[i].end}',
            '${activities[i].color}','${activities[i].activity_type}'
        )`

    // await pool.query("delete from user_itineraries where user_id=$1",[id])
    const queryText = 
      `INSERT INTO user_itineraries (user_id, stored_at, activities)
       VALUES ($1, NOW(),ARRAY[${items}]::calendar_activity_type[])`

    // 3. Execute the formatted query.
    await pool.query(queryText,[id]);

    // 4. Insert individual activity IDs (no change here).
//     await pool.query(`DELETE FROM user_activities
// WHERE user_id = $1
// AND booking_date = NOW();`,[id])
    const insertIdsQuery = `
      INSERT INTO user_activities (user_id, activity_id, booking_date)
      VALUES ($1, $2, NOW()) ON CONFLICT DO NOTHING
    `;
    const activity_ids = activities.map((act)=>act.activity_id).filter((id)=>!(id.includes("rest") || id.includes("commute")))
    await Promise.all(
      activity_ids.map((aid) => pool.query(insertIdsQuery, [id, aid]))
    );

    // 5. Respond with success.
    console.log("Successful")
    return res.status(200).json({
        success:true,message:"Update successful"
    })

  } catch (err) {
    console.error("Error finalizing itinerary:", err.stack);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.get("/my-itinerary/:id",async(req,res)=>{
    const {id}=req.params

    if(!id){
        return res.status(400).json({
            success:false,
            message:"Invalid request"
        })
    }
    try{
        const result=await pool.query(`SELECT
  (
    SELECT json_agg(row_to_json(activity))
    FROM unnest(activities) AS activity
  ) AS activities
FROM
  user_itineraries where user_id =$1 order by stored_at limit 1`,[id])
        if(!result.rowCount || !result.rows[0].activities){
            return res.status(500).json({
                success:false,
                message:"Could not fetch the activity list"
            })
        }
        return res.json({calendar_events:result.rows[0].activities})
    }
    catch(err){
        console.log(err.message)
        return res.status(500).json({
            success:false,
            message:"Internal Server Error"
        })
    }
})
router.get("/my-activities/:id", async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({
      success: false,
      message: "Invalid request",
    });
  }

  try {
    const result = await pool.query(
      `SELECT 
          a.id AS id,
          a.name AS name,
          a.description AS description,
          a.price AS price,
          a.duration AS duration,
          a.category AS category,
          a.latitude,
          a.longitude,
          att.name AS attraction,
          ua.booking_date
        FROM user_activities AS ua
        JOIN activities AS a ON ua.activity_id = a.id
        JOIN attractions AS att ON a."attractionId" = att.id
        WHERE ua.user_id = $1
          AND ua.booking_date = (
            SELECT MAX(booking_date)
            FROM user_activities
            WHERE user_id = $1
          )`,
      [id]
    );

    if (!result.rowCount) {
      return res.status(404).json({
        success: false,
        message: "No activities found for the most recent booking date",
      });
    }

    console.log(result.rows[0]);
    return res.json({ selectedActivities: result.rows });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});


export default router