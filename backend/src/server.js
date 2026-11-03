import express from 'express'

// import brandsRouter from "./routes/brand-route.js"

import {errorHandler} from "./middlewares/error-handler.js";
import {queryParser} from "./middlewares/pagination-middleware.js";

const ID = '67130500004';
const app = express()
app.use(express.json())
app.use(queryParser())
// Test queryParser
app.get('/', (req, res) => {
    console.log(req.pagination)
    res.json(req.pagination)
})
app.get(`/api/v1/health`, (req, res) => {
    res.status(200).json({
    "status": "ok",
    "team": "ip26-line"
})
})

app.listen(3000, () => {
    console.log('server listening on port 3000')
})

app.use(errorHandler)