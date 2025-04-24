import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../prismaClient.js'

const router = express.Router()

router.post('/register', async (req,res) => {
    const { username, password } = req.body

    // encrypt password
    const hashedPassword = bcrypt.hashSync(password, 8)

    // save new hashedPassword
    try {
        const user = await prisma.user.create({
            data: {
                username,
                password: hashedPassword
            }
        })

        //add default(first) todo to user
        const defaultTodo = 'Hello :) Add your first todo!'
        await prisma.todo.create({
            data: {
                task: defaultTodo,
                userId: user.id
            }
        })

        // create a token it gives permission just for their todos to manage
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' })
        res.json({ token })

        
        res.sendStatus(201)
    } catch(err) {
        console.log(err.message)
        res.sendStatus(503)
    }
    
})

router.post('/login', async (req,res) => {
    const { username, password } = req.body
    try {
        const user = await prisma.user.findUnique({
            where: {
                username: username
            }
        })// putting username in place of ?

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