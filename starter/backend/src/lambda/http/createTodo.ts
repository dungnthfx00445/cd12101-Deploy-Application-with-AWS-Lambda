import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { createTodo } from '../../businessLogic/todos.js'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getUserId } from '../utils.js'

export const handler = middy<APIGatewayProxyEvent, APIGatewayProxyResult>()
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
  .handler(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Invalid request body'
        })
      }
    }


    try {
      const newTodo = JSON.parse(event.body)
      const userId = getUserId(event) as string

      const item = await createTodo(newTodo, userId)

      return {
        statusCode: 201,
        body: JSON.stringify({
          item
        })
      }
    } catch (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error })
      };
    }
  })
