import Ajv from "ajv-draft-04";
import updateTodoSchema from '../../request/update-todo-request.json' assert { type: "json" };
import { TodoUpdate } from "../models/Todo";

const ajv = new Ajv();

const validate = ajv.compile(updateTodoSchema);

export const validateUpdateTodo = (data: TodoUpdate) => {
    const isValid = validate(data);
    if (!isValid) {
        console.error("Validation errors:", validate.errors);
    }
    return isValid as boolean;
}
