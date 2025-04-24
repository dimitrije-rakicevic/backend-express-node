import express from 'express'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
import authRoutes from './routes/authRoutes.js'
import todoRoutes from './routes/todoRoutes.js'
import authMiddleware from './middleware/authMiddleware.js'

const app = express()
const PORT = process.env.PORT || 5003

// get the file path from url to current module
const __filename = fileURLToPath(import.meta.url)
// get the directory name from file path
const __dirname = dirname(__filename)

//Middleware
app.use(express.json())
app.use(express.static(path.join(__dirname,'../public'))) // setting path from /src to /public

// serving html file from public dir
app.get('/', (req,res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

//ROUTES
app.use('/auth', authRoutes)
app.use('/todos', authMiddleware, todoRoutes) // first runs authmiddleware

app.listen(PORT, () => {
    console.log(`server has started on port: ${PORT}`)
})