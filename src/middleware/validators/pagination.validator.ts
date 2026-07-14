import { query, ValidationChain } from "express-validator";

export const validatePagination: ValidationChain[] = [
    query("limit").custom(value => {
        if (value > 20) {
            throw new Error("Limit should not exceed to 20 items")
        }
        return true;
    })
]
