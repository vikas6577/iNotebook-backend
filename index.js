const connnectToMongo=require('./db');
const express = require('express')
connnectToMongo();


const app = express()
const port = 5000

// app.get('/', (req, res) => {
//   res.send('Hello Vikas!')
// })
app.use(express.json())
//available routes
app.use('/api/auth',require('./routes/auth'))
app.use('/api/notes',require('./routes/notes'))

app.listen(port, () => {
  console.log(`Example app listening on port  http://localhost:${port}`)
})