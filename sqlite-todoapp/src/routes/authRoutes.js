import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import db from '../db.js'

const router = express.Router()

router.post('/register', (req,res) => {
    const { username, password } = req.body

    // encrypt password
    const hashedPassword = bcrypt.hashSync(password, 8)

    // save new hashedPassword
    try {
        const insertUser = db.prepare(`INSERT INTO users (username, password) VALUES (?, ?)`)
        const result = insertUser.run(username, hashedPassword)

        //add default(first) todo to user
        const defaultTodo = 'Hello :) Add your first todo!'
        const insertTodo = db.prepare(`INSERT INTO todos (user_id, task) VALUES (?, ?)`)
        insertTodo.run(result.lastInsertRowid, defaultTodo)

        // create a token it gives permission just for their todos to manage
        const token = jwt.sign({id: result.lastInsertRowid}, process.env.JWT_SECRET, { expiresIn: '24h' })
        res.json({ token })

        
        res.sendStatus(201)
    } catch(err) {
        console.log(err.message)
        res.sendStatus(503)
    }
    
})

router.post('/login', (req,res) => {
    const { username, password } = req.body
    try {
        const getUser = db.prepare(`SELECT * FROM users WHERE username = ?`) 
        const user = getUser.get(username) // putting username in place of ?

        // not found user with that email
        if(!user) return res.status(404).send({message: "User not found!"})

        const validPassword = bcrypt.compareSync(password, user.password)

        // wrong password
        if(!validPassword) { return res.status(401).send({ message:"Invalid password!" })}

        console.log(user)

        const token = jwt.sign({id: user.id}, process.env.JWT_SECRET, { expiresIn: '24h' })

        res.json({ token })
    } catch(err) {
        console.log(err.message)
        res.sendStatus(503)
    }
})

export default router 