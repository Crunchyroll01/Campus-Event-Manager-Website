const express = require('express');
const sql = require('mssql');
const cors = require('cors');

const app = express();
app.use(express.json()); 
app.use(cors());        

const dbConfig = {
    user: 'sa',
    password: 'CodyServerPass',
    server: 'localhost',               
    database: 'CodysWebsite',
    options: {
        encrypt: false,                
        trustServerCertificate: true   
    }
};
app.post('/api/events', async (req, res) => {
    try {
        const { eventName, hostName, eventDate, eventTime, eventLocation, eventDescription } = req.body;
        
        let formattedTime = eventTime;
        if (eventTime && !eventTime.includes(':00')) {
            const parts = eventTime.split(':');
            const hour = parts[0].padStart(2, '0');
            const minute = parts[1] ? parts[1].substring(0, 2).padStart(2, '0') : '00';
            formattedTime = `${hour}:${minute}:00`;
        }
        let pool = await sql.connect(dbConfig);
        
        await pool.request()
            .input('EventName', sql.VarChar, eventName)
            .input('HostName', sql.VarChar, hostName)
            .input('EventDate', sql.Date, eventDate)
            .input('EventTime', sql.VarChar, formattedTime) 
            .input('EventLocation', sql.VarChar, eventLocation)
            .input('EventDescription', sql.Text, eventDescription)
            .query(`
                INSERT INTO Events (EventName, HostName, EventDate, EventTime, EventLocation, EventDescription) 
                VALUES (@EventName, @HostName, @EventDate, CAST(@EventTime AS TIME), @EventLocation, @EventDescription)
            `);
        res.status(200).json({ message: 'Event successfully saved to SQL Express!' });
    } catch (err) {
        console.error('Database error:', err.message);
        res.status(500).json({ error: err.message });
    }
});
app.get('/api/events', async (req, res) => {
    try {
        let pool = await sql.connect(dbConfig);
        
        let result = await pool.request()
            .query('SELECT * FROM Events ORDER BY EventDate ASC, EventTime ASC');

        res.status(200).json(result.recordset);
    } catch (err) {
        console.error('Database error:', err.message);
        res.status(500).json({ error: 'Failed to retrieve events from database.' });
    }
});

app.post('/api/register', async (req, res) => {
    try {
        const { eventId, userName, userEmail } = req.body;
        let pool = await sql.connect(dbConfig);
        
        await pool.request()
            .input('EventId', sql.Int, eventId)
            .input('UserName', sql.VarChar, userName)
            .input('UserEmail', sql.VarChar, userEmail)
            .execute('RegisterForEvent');

        res.status(200).json({ message: 'Successfully registered for this event!' });
    } catch (err) {
        console.error('Database error:', err.message);
        res.status(400).json({ error: err.message });
    }
});
app.listen(3000, () => {
    console.log('Server is running locally on http://localhost:3000');
});
