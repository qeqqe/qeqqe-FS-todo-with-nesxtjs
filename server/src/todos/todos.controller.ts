import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TodosService } from './todos.service';
import * as TodoDto from './dto';
import { JwtAuthGuard } from '../auth/guard/jwt.guard';

@Controller('todos')
@UseGuards(JwtAuthGuard)
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Post()
  postTodos(@Request() req, @Body() todo: TodoDto.CreateTodoDto) {
    todo.userId = req.user.id;
    return this.todosService.postTodos(todo);
  }

  @Get()
  getTodos(@Request() req) {
    return this.todosService.getTodos(req.user.id);
  }

  @Patch(':id')
  updateTodos(@Param('id') id: string, @Body() todo: TodoDto.UpdateTodoDto) {
    todo.id = parseInt(id);
    return this.todosService.updateTodos(todo);
  }

  @Delete(':id')
  deleteTodos(@Param('id') id: string) {
    return this.todosService.deleteTodos(parseInt(id));
  }
}
