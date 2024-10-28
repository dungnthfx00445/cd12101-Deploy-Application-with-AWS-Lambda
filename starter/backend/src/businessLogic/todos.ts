import { TodoAccess } from '../dataLayer/todoAccess.js';
import { v4 as uuid } from 'uuid';
import { createLogger } from '../utils/logger.js';
import { AttachmentUtils } from '../helper/attchmentUtils.js';
import { TodoItem, TodoUpdate } from '../lambda/models/Todo.js';
import { validateCreateTodo } from '../lambda/http/validateCreateTodo.js';
import { validateUpdateTodo } from '../lambda/http/valicateUpdateTodo.js';

const logger = createLogger('todos');
const todoAccess = new TodoAccess();
const attachmentUtils = new AttachmentUtils();

export async function createTodo(newTodo: any, userId: string): Promise<TodoItem> {
    if (!validateCreateTodo(newTodo)) {
        throw new Error("Invalid todo request data");
    }

    logger.info('Creating todo', { newTodo, userId });

    const todoId = uuid();
    const createdAt = new Date().toISOString();
    const attachmentUrl = attachmentUtils.getAttachmentUrl(todoId);

    const newItem: TodoItem = {
        ...newTodo,
        userId,
        todoId,
        createdAt,
        done: false,
        attachmentUrl
    };

    return await todoAccess.createTodo(newItem);
}

export async function getTodos(userId: string): Promise<TodoItem[]> {
    return todoAccess.getAllTodos(userId);
}

export async function updateTodo(
    todoId: string,
    updateTodoRequest: TodoUpdate,
    userId: string
): Promise<void> {
    if (!validateUpdateTodo(updateTodoRequest)) {
        throw new Error("Invalid todo request data");
    }

    logger.info('Updating todo', { updateTodoRequest, userId });

    await todoAccess.updateTodo(
        userId,
        todoId,
        {
            name: updateTodoRequest.name,
            done: updateTodoRequest.done,
            dueDate: updateTodoRequest.dueDate,
        }
    );
}

export async function deleteTodo(
    todoId: string,
    userId: string
): Promise<void> {
    await todoAccess.deleteTodo(userId, todoId)
}

export async function setItemUrl(todoId: string, userId: string): Promise<string> {
    logger.info('Upload url', { todoId, userId });
    return attachmentUtils.getUploadUrl(todoId)
}