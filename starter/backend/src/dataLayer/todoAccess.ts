import AWSXRay from 'aws-xray-sdk';
import AWS from 'aws-sdk';
import { DocumentClient } from 'aws-sdk/clients/dynamodb.js';
import { TodoItem, TodoUpdate } from '../lambda/models/Todo.js';
import { createLogger } from '../utils/logger.js';

const XAWS = AWSXRay.captureAWS(AWS);
const logger = createLogger('todoAccess');

export class TodoAccess {
    constructor(
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly todosTable = process.env.TODOS_TABLE || '',
        private readonly todosIndex = process.env.TODOS_USER_INDEX || ''
    ) {
        if (!todosTable || !todosIndex) {
            throw new Error('Missing required environment variables');
        }
    }

    async getTodoItem(todoId: string, userId: string): Promise<TodoItem> {
        const result = await this.docClient.query({
            TableName: this.todosTable,
            KeyConditionExpression: 'userId = :userId AND todoId = :todoId',
            ExpressionAttributeValues: {
                ':userId': userId,
                ':todoId': todoId
            }
        }).promise();

        const item = result.Items[0];
        return item as TodoItem;
    }


    async getAllTodos(userId: string): Promise<TodoItem[]> {
        const result = await this.docClient.query({
            TableName: this.todosTable,
            IndexName: this.todosIndex,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise()
        return result.Items as TodoItem[]
    }

    async createTodo(todo: TodoItem): Promise<TodoItem> {
        await this.docClient.put({
            TableName: this.todosTable,
            Item: todo
        }).promise()
        return todo
    }

    async updateTodo(userId: string, todoId: string, update: TodoUpdate): Promise<void> {
        await this.docClient.update({
            TableName: this.todosTable,
            Key: {
                "userId": userId,
                "todoId": todoId // sử dụng đúng sort key là todoId
            },
            UpdateExpression: 'set #n = :name, done = :done, dueDate = :dueDate',
            ExpressionAttributeValues: {
                ':name': update.name,
                ':done': update.done,
                ':dueDate': update.dueDate,
            },
            ExpressionAttributeNames: {
                '#n': 'name'
            }
        }).promise()
    }

    async deleteTodo(userId: string, todoId: string): Promise<void> {
        await this.docClient
            .delete({
                TableName: this.todosTable,
                Key: { userId, todoId }
            })
            .promise();
    }

    async setItemUrl(todoId: string, createdAt: string, itemUrl: string): Promise<void> {
        var params = {
            TableName: this.todosTable,
            Key: {
                todoId,
                createdAt
            },
            UpdateExpression: 'set attachmentUrl = :attachmentUrl',
            ExpressionAttributeValues: {
                ':attachmentUrl': itemUrl
            },
            ReturnValues: 'UPDATED_NEW'
        }

        await this.docClient.update(params).promise();
    }
}
