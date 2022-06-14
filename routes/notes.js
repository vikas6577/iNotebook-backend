const express=require('express');
const router=express.Router();
var fetchuser=require('../middleware/fetchuser');
const Note=require('../models/Note');
const { body, validationResult } = require("express-validator");


//ROUTE 1:Get all the notes using :GET "/api/notes/getuser" .Login required


router.get('/fetchallnotes',fetchuser,async(req,res)=>{

    try {
        const notes=await Note.find({user:req.user.id})
        res.json(notes)
    } catch (error) {
        console.error(error.message);
      res.status(500).send("Some error occured");
    }
    
}) 


//ROUTE 2:Add a new note using :POST "/api/notes/addnote" .Login required


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

//ROUTE 3:Update an existing note :PUT "/api/notes/updatenote" .Login required


router.put('/updatenote/:id',fetchuser,async(req,res)=>{
 
    try {
        const {title,discription,tag}=req.body;
        //create a newnote object
        const newNote={};
        if(title){newNote.title=title};
        if(discription){newNote.discription=discription};
        if(tag){newNote.tag=tag};
    
        //Find the note to be updated and updade it
        let note=await Note.findById(req.params.id);
        if(!note){return res.status(404).send("Not Found")};
    
        //check if the user who is editing the note is the same user that is logged in(or the user whose notes it is, not any other person/hacker is editing it)
    
        if(note.user.toString()!==req.user.id){
            return res.status(401).send("Not allowed");
        }
        note= await Note.findByIdAndUpdate(req.params.id,{$set:newNote},{new:true})
        res.json({note})
    } 

    catch (error) {
        console.error(error.message);
      res.status(500).send("Some error occured");
    }
})



//ROUTE 4:Delete an existing note :DELETE "/api/notes/deletenote" .Login required


router.delete('/deletenote/:id',fetchuser,async(req,res)=>{

    try {

        //Find the note to be deleted and delete it
        let note=await Note.findById(req.params.id);
        if(!note){return res.status(404).send("Not Found")};
    
        //check if the user who is deleting the note is the same user that is logged in(or the user whose notes it is, not any other person/hacker is deleting it)
    
        if(note.user.toString()!==req.user.id){
            return res.status(401).send("Not allowed");
        }
        note= await Note.findByIdAndDelete(req.params.id)
        res.json({"Success":"Note has been deleted successfully",note:note})
    } 


    catch (error) {
        console.error(error.message);
      res.status(500).send("Some error occured");
    }
})

module.exports=router