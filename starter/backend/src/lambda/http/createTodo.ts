import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { createTodo } from '../../businessLogic/todos'
import { getUserId } from '../utils.mjs'
import { TodoItem } from '../models/Todo';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

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
    const newTodo = JSON.parse(event.body)
    const userId = getUserId(event)

    const item = await createTodo(newTodo, userId)

    return {
      statusCode: 201,
      body: JSON.stringify({
        item
      })
    }
  })

