const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')

const path = require('path')
const PORT = process.env.PORT || 5000

express()
  .use(cors({origin: "*"}))
  .use(express.static(path.join(__dirname, 'public')))
  .use(bodyParser.json())     // to support JSON-encoded bodies
  .use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
  }))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .get('/posts', async (req, res) => {
    try {
      const client = await pool.connect();
      const result = await client.query('SELECT * FROM posts ORDER BY date DESC');
      const results = { 'results': (result) ? result.rows : null};
      // res.render('pages/db', results );
      res.json(results);
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  })
  .post('/posts', async (req, res) => {
    try {
      const client = await pool.connect();
      const result = await client.query(`INSERT INTO posts (username, message) VALUES ('${req.body.username}', '${req.body.message}');`);
      res.json({status: "ok"});
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))