import express from "express"
import cors from "cors"
import path from "path"

const app = express()
app.use(cors())

app.get('/', (req, res) => {
  res.sendFile(path.resolve('./tasks.json'));
})

app.listen(8080, () => {
  console.log('app is listening')
})