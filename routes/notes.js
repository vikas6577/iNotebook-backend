const express=require('express');
const router=express.Router();
var fetchuser=require('../middleware/fetchuser');
const Note=require('../models/Note');
const { body, validationResult } = require("express-validator");


//ROUTE 1:Get all the notes using :GET "/api/auth/getuser" .Login required


router.get('/fetchallnotes',fetchuser,async(req,res)=>{

    try {
        const notes=await Note.find({user:req.user.id})
        res.json(notes)
    } catch (error) {
        console.error(error.message);
      res.status(500).send("Some error occured");
    }
    
}) 


//ROUTE 2:Add a new note using :POST "/api/auth/addnote" .Login required


router.post('/addnote',fetchuser,[
    body("title", "Enter title of minimum length 3").isLength({ min: 3 }),
    body("discription", "Enter discription with minimum length 5").isLength({
      min: 5,
    }),
],async(req,res)=>{

    try {
        const {title,discription,tag}=req.body;
        //if there  are error, return Bad request and the error
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
        const note=new Note({
            title,discription,tag,user:req.user.id
        })
        const savedNote=await note.save()
    
        res.json(savedNote) 
        
    } catch (error) {
        console.error(error.message);
      res.status(500).send("Some error occured");
    }

   
}) 

module.exports=router