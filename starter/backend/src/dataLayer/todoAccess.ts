import * as AWS from 'aws-sdk';
import * as AWSXRay from 'aws-xray-sdk';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { createLogger } from '../utils/logger.mjs';
import { TodoItem, TodoUpdate } from '../lambda/models/Todo';

const XAWS = AWSXRay.captureAWS(AWS);
const logger = createLogger('todoAccess');

export class TodoAccess {
    constructor(
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly todosTable = process.env.TODOS_TABLE || '',
        private readonly todosIndex = process.env.INDEX_NAME || ''
    ) {
        if (!todosTable || !todosIndex) {
            throw new Error('Missing required environment variables');
        }
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

    async updateTodo(userId: string, todoId: string, updateData: TodoUpdate): Promise<void> {
        logger.info(`Updating a todo item: ${todoId}`);
        await this.docClient
            .update({
                TableName: this.todosTable,
                Key: { userId, todoId },
                ConditionExpression: 'attribute_exists(todoId)',
                UpdateExpression: 'set #n = :n, dueDate = :due, done = :dn',
                ExpressionAttributeNames: { '#n': 'name' },
                ExpressionAttributeValues: {
                    ':n': updateData.name,
                    ':due': updateData.dueDate,
                    ':dn': updateData.done
                }
            })
            .promise();
    }

    async deleteTodo(userId: string, todoId: string): Promise<void> {
        await this.docClient
            .delete({
                TableName: this.todosTable,
                Key: { userId, todoId }
            })
            .promise();
    }

    async saveImgUrl(userId: string, todoId: string, bucketName: string): Promise<void> {
        await this.docClient
            .update({
                TableName: this.todosTable,
                Key: { userId, todoId },
                ConditionExpression: 'attribute_exists(todoId)',
                UpdateExpression: 'set attachmentUrl = :attachmentUrl',
                ExpressionAttributeValues: {
                    ':attachmentUrl': `https://${bucketName}.s3.amazonaws.com/${todoId}`
                }
            })
            .promise();
    }
}
