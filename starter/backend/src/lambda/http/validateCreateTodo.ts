import Ajv from "ajv";
import createTodoSchema from "../../request/create-todo-request.json";
import { TodoItem } from "../models/Todo";

const ajv = new Ajv();
const validate = ajv.compile(createTodoSchema);

export function validateCreateTodo(data: any): data is TodoItem {
    const isValid = validate(data);
    if (!isValid) {
        console.error("Validation errors:", validate.errors);
    }
    return isValid as boolean;
}