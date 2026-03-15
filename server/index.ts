import express from 'express';

const PORT = 3000
const SERVER = "localhost"

const app = express()

app.get('/', (req, res) => {
    res.send('Hello World!')
}).get("/fitness", (req, res) => {
    res.send('Fitness is important!')
})

app.listen(PORT, () => {
    console.log(`Server is running at http://${SERVER}:${PORT}`)
})