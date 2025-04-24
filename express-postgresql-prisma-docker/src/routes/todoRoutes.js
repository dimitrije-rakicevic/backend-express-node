import express, { Router } from 'express'
import prisma from '../prismaClient.js'

const router = express.Router()

// get all todos for logged in user
router.get('/', async (req,res) => {
    const todos = await prisma.todo.findMany({
        where: {
            userId: req.userId
        }
    })
    res.json(todos)
})

// create new todo
router.post('/', async (req,res) => {
    const { task } = req.body
    
    const todo = await prisma.todo.create({
        data: {
            task,
            userId: req.userId
        }
    })

    res.json(todo)
})

// update todo 
router.put('/:id', async (req,res) => {
    const { completed } = req.body
    const { id } =  req.params
    // const { page } = req.query e.g. /2?page=4  page has value of 4

    const updatedTodo = await prisma.todo.update({
        where: {
            id: parseInt(id),
            userId: req.userId
        },
        data: {
            completed: !!completed
        }
    })

    res.json({message:"Todo completed!"})
})

// delete todo
router.delete('/:id', async (req,res) => {
    const { id } = req.params
    const userId = req.userId
    await prisma.todo.delete({
        where: {
            id: parseInt(id),
            userId
        }
    })
    deleteTodo.run(id, userId)
    
    res.send({message: "deleted"})
})

export default router