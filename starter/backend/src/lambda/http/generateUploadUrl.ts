import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { setItemUrl } from '../../businessLogic/todos.js'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getUserId } from '../utils.js'
import { createLogger } from '../../utils/logger.js';

const logger = createLogger('generateUploadUrl');

export const handler = middy<APIGatewayProxyEvent, APIGatewayProxyResult>()
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
  .handler(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      const todoId = event.pathParameters.todoId
      const userId = getUserId(event) as string;

      const url = await setItemUrl(todoId, userId);
      logger.info("Url ", url)
      return {
        statusCode: 200,
        body: JSON.stringify({
          uploadUrl: url
        })
      }
    } catch (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error })
      };
    }
  })
