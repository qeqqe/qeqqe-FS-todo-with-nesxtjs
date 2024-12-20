import { Injectable, NotFoundException } from '@nestjs/common';
import * as TodoDto from './dto';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

@Injectable()
export class TodosService {
  async postTodos(todo: TodoDto.CreateTodoDto) {
    await prisma.todos.create({
      data: {
        title: todo.title,
        completed: false,
        userId: todo.userId,
      },
    });

    // Return all todos for this user
    return await prisma.todos.findMany({
      where: {
        userId: todo.userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getTodos(userId: number) {
    return await prisma.todos.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async updateTodos(todo: TodoDto.UpdateTodoDto) {
    const existingTodo = await prisma.todos.findUnique({
      where: { id: todo.id },
    });

    if (!existingTodo) {
      throw new NotFoundException(`Todo with ID ${todo.id} not found`);
    }

    return await prisma.todos.update({
      where: { id: todo.id },
      data: {
        title: todo.title,
        completed: todo.completed,
      },
    });
  }

  async deleteTodos(id: number) {
    const existingTodo = await prisma.todos.findUnique({
      where: { id },
    });

    if (!existingTodo) {
      throw new NotFoundException(`Todo with ID ${id} not found`);
    }

    await prisma.todos.delete({
      where: { id },
    });

    return { message: 'Todo deleted successfully' };
  }
}
