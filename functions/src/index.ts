import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express';
import * as bodyParser from "body-parser";

//Initialize Firebase
admin.initializeApp(functions.config().firebase);

//Initialize Express.js server
const app = express();
const main = express();

//Server configuration
//Set PATH
//Set JSON as main parser
main.use('/api/v1',app);
main.use(bodyParser.json());

//Expose endpoint
export const datesApi = functions.https.onRequest(main);

//Introduction endpoint
app.get('/intro',(req, res) => {
    res.json({
        status: true,
        message:"This will return all dates"})

    res.status(200)
})

//CRUD OPS
//CREATE
//Initialize DB
const db = admin.firestore();

class SingleDate {
    static date_of:string;
    static location_lat:number;
    static location_lon:number;
    static my_comment:string;
    static her_comment:string;

}

//POST in /dates endpoint
app.post('/dates', async (request, response) => {
    try {
        const singleDate: SingleDate = {
            date_of: request.body['date_of'],
            location_lat: request.body['location_lat'],
            location_lon: request.body['location_lon'],
            my_comment: request.body['my_comment'],
            her_comment: request.body['her_comment']
        }
        //Save in 'dates' collection
        const newDocRef = await db.collection('dates').add(singleDate);

        //Reference to created doc to get ID
        const doc = await newDocRef.get();

        //Success status
        response.status(201).json({
            status: true,
            message: "Record created successfully",
            data: {id: newDocRef.id, data: doc.data}})
    }
    catch (error) {
        response.status(400).json({
            status: false,
            message: "A Date should contain date, location, my comment and her comment"})
    }
})

//GET in /dates endpoint
//View all Dates
app.get('/dates',async (request, response) => {
    try {
        //Get a Query Snapshot
        const datesSnapshot = await db.collection('dates').get();

        //Placeholder Array to be returned as data
        const dates:any = [];

        //Iterate through querysnapshot and append items to dates Array
        datesSnapshot.forEach(
            (doc) => {
                dates.push({
                    id: doc.id,
                    data: doc.data()
                });
            }
        );

        //Success
        response.status(200).json({
            status: true,
            message: "Dates retrieved successfully",
            data: dates});
    }
    catch (error) {
        response.status(400).json({
            status: false,
            message: error
        })
    }
})

//GET a single date record
app.get('/dates/:id', async (request, response) => {
    try {
        const dateId =  request.params.id;

        //Id date is not supplied
        if (!dateId) {
            response.status(400).json({
                status: false,
                message: 'The Date ID is required'
            })

        }

        //Document Snapshot
        const date = await db.collection('dates').doc(dateId).get();

        //What if date doesn't exist
        if (!date.exists) {
            response.status(400).json({
                status: false,
                message: 'This Date does not exist'
            })
        }
        //Single Date retrieved successfully
        response.status(200).json({
            status: true,
            message: 'Date retrieved successfully',
            data: {id: date.id, data: date.data()}
        })
    }
    catch (error) {
        response.status(400).json({
            status: false,
            message: error
        })
    }
})

//Update a date
//PUT
app.put('/dates/:id', async (request, response) => {
   try {
    const dateId = request.params.id;
    const my_comment = request.body.my_comment;
    //Check if ID has been supplied
    if (!dateId) {
        response.status(400).json({
            status: false,
            message: 'You have not supplied an ID'
        })
    }
    //Check if a comment has been supplied
    if (!my_comment) {
        response.status(400).json({
            status: false,
            message: 'You comment is required'
        })
    }

    const data = {
        my_comment
    }
    //Document snapshot
    const docRef = await db.collection('dates')
        .doc(dateId)
        .get();
        //Check for existence of document  
    if (!docRef.exists) {
        response.status(400).json({
            status: false,
            message: 'This Date does not exist'
        })
    }
    else {
        await db.collection('dates')
        .doc(dateId)
        .set(data, {merge: true})

        //Success
        response.status(200).json({
            status: true,
            message: 'The date has been updated successfully'
    })
    }

   }
   catch (error) {
       response.status(400).json({
           status: false,
           message: error
       })
   }
})

//Delete a date
app.delete('/dates/:id', async (request, response) => {
    try {
        const dateId = request.params.id;

        if (!dateId) {
            response.status(400).json({
                status: false,
                message: 'You have not supplied an ID'
            })
        }

        //Document snapshot
        const docRef = await db.collection('dates')
        .doc(dateId)
        .get();
        
        //Check for existence of document
        if (!docRef.exists) {
            response.status(400).json({
                status: false,
                message: 'This Date does not exist'
            })
        } 
        else {

            await db.collection('dates')
            .doc(dateId)
            .delete();
            //Successfully deleted
            response.status(204)
        }

    }
    catch (error) {
        response.status(400).json({
            status: false,
            message: error
        })
    }
})

