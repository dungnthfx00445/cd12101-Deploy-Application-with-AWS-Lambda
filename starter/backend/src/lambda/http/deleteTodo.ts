import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { createLogger } from '../../utils/logger.js';
import { deleteTodo } from '../../businessLogic/todos.js'
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

    try {
      const todoId = event.pathParameters.todoId;
      const userId = getUserId(event) as string;
      await deleteTodo(todoId, userId);

      return {
        statusCode: 204,
        body: ''
      };
    } catch (error) {
      logger.error(`Error: ${(error as Error).message}`);
      return {
        statusCode: 500,
        body: JSON.stringify({ error })
      };
    }
  })
