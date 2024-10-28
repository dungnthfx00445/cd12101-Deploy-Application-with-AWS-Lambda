import Ajv from "ajv-draft-04";
import createTodoSchema from '../../request/create-todo-request.json' assert { type: "json" };
import { TodoItem } from "../models/Todo";

const ajv = new Ajv();

const validate = ajv.compile(createTodoSchema);

export const validateCreateTodo = (data: TodoItem) => {
    const isValid = validate(data);
    if (!isValid) {
        console.error("Validation errors:", validate.errors);
    }
    return isValid as boolean;
}
