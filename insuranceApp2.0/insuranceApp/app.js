const express = require('express');
const {Pool, Client} = require('pg');
const app = express();
const port = 3001;
app.set('view engine', 'ejs');

//connecting to the postgresql database
const postG = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'myFakeDatabase',
    password: '1234',
    port: 5432,
});

//middleware
const methodOverride = require('method-override');
app.use(methodOverride('_method'));
app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));

//rendering the clients page
app.get('/clients', async(req, res) => {
    try{
        const result = await postG.query('Select * FROM "Clients"');
        //res.json(result.rows);
        res.render('clientsFile',{clients: result.rows, title: "Clients"} );
    }
    catch(err){
        console.error(err);
        res.status(500).send('Could not retrieve data from the database');
    }
})

app.get('/clients/update/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await postG.query('SELECT * FROM "Clients" WHERE "CliendID" = $1', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).send('Client not found');
        }

        console.log("Client found");
        res.render('updateClient', { clients: result.rows[0], title: "Update Client" });
    } catch (err) {
        console.error(err);
        res.status(500).send('Could not retrieve data from the database');
    }
});

//rendering the claims page
app.get('/claims', async(req, res) => {
    try{
        
        res.render('claimsFile',{ title: "Claims"} );
    }
    catch(err){
        console.error(err);
        res.status(500).send('Could not retrieve data from the database');
    }
})

//rendering the dashboard page
app.get('/', async(req, res) => {
    try{
        
        res.render('dashboardFile',{ title: "Home"} );
    }
    catch(err){
        console.error(err);
        res.status(500).send('Could not retrieve data from the database');
    }
})

//rendering the tracking page
app.get('/tracking', async(req, res) => {
    try{
        
        res.render('trackingFile',{ title: "Track Drones"} );
    }
    catch(err){
        console.error(err);
        res.status(500).send('Could not retrieve data from the database');
    }
})

//takes us to the add client page
app.get('/clients/addClient', async(req, res) => {
    try{
        
        res.render('addClient',{ title: "Add Client"} );
    }
    catch(err){
        console.error(err);
        res.status(500).send('Could not add client to the database');
    }
})

//adding client
app.post('/clients', async(req,res) => {
    
    const {name, surname, dob, gender, email} = req.body;

    try{
        const result = await postG.query('INSERT INTO "Clients" ("Name", "Surname", "DateOfBirth", "Gender", "Email") VALUES ($1, $2, $3, $4, $5) RETURNING *', [name, surname, dob, gender, email]);
        console.log("client Added");
        res.redirect('/clients');
    }
    catch(err){
        console.error(err.message);
        res.status(500).send('Error inserting data');
    }
    
})

//updating client
app.post('/clients/update/:id', async (req, res) => {
    const { id } = req.params; // Get client ID from the URL parameter
    const { name, surname, dob, gender, email } = req.body; // Get the form data

    try {
        const result = await postG.query(
            'UPDATE "Clients" SET "Name" = $1, "Surname" = $2, "DateOfBirth" = $3, "Gender" = $4, "Email" = $5 WHERE "CliendID" = $6 RETURNING *',
            [name, surname, dob, gender, email, id]
        );

        // Check if a row was updated
        if (result.rows.length === 0) {
            return res.status(404).send('Client not found');
        }

        console.log("Client updated");
        res.redirect('/clients'); // Redirect to the clients list or another page after successful update
    } catch (err) {
        console.error(err);
        res.status(500).send('Error updating client');
    }
});



app.delete('/clients/:id', async(req,res) => {
    const {id} = req.params;

    try{
        const result = await postG.query('DELETE FROM "Clients" WHERE "CliendID" = $1', [id]);
        console.log(id);
        res.json({redirect: '/clients'})
    }
    catch(err){
        console.error(err.message);
        res.status(500).send('Error inserting data');
    }
})

app.listen(port, ()=>{
    console.log('Server is running....');
})
