import { TodoAccess } from '../dataLayer/todoAccess';
import { v4 as uuid } from 'uuid';
import { createLogger } from '../utils/logger.mjs';
import { AttachmentUtils } from '../helper/attchmentUtils';
import { TodoItem } from '../lambda/models/Todo';
import { validateCreateTodo } from '../lambda/http/validateCreateTodo';

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
    const s3AttachmentUrl = attachmentUtils.getAttachmentUrl(todoId);

    const newItem: TodoItem = {
        userId,
        todoId,
        createdAt,
        done: false,
        attachmentUrl: s3AttachmentUrl,
        ...newTodo
    };

    return await todoAccess.createTodo(newItem);
}
