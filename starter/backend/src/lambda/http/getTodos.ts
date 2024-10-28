import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda';
import { createLogger } from '../../utils/logger.js';
import { TodoItem } from '../models/Todo'
import { getTodos } from '../../businessLogic/todos.js'
import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler';
import { getUserId } from '../utils.js';

const logger = createLogger('getTodos');

export const handler = middy<APIGatewayProxyEvent, APIGatewayProxyResult>()
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
  .handler(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing GetTodos event...');
    const userId = getUserId(event) as string
    try {
      const todoList: TodoItem[] = await getTodos(userId);
      logger.info('Successfully retrieved todolist');
      return {
        statusCode: 200,
        body: JSON.stringify({ todoList })
      };
    } catch (error) {
      logger.error(`Error: ${(error as Error).message}`);
      return {
        statusCode: 500,
        body: JSON.stringify({ error })
      };
    }
  })
