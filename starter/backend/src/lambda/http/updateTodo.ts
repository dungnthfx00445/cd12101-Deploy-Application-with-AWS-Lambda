import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { createLogger } from '../../utils/logger.js';
import { TodoUpdate } from '../models/Todo'
import { updateTodo } from '../../businessLogic/todos.js'
import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler';
import { getUserId } from '../utils.js';


const logger = createLogger('updateTodo');


export const handler = middy<APIGatewayProxyEvent, APIGatewayProxyResult>()
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
  .handler(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing UpdateTodos event...');

    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Invalid request body'
        })
      }
    }

    try {
      const userId = getUserId(event) as string
      const todoId = event.pathParameters.todoId
      const updatedTodo: TodoUpdate = JSON.parse(event.body)

      await updateTodo(todoId, updatedTodo, userId);

      return {
        statusCode: 200,
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
