import { NextFunction, Request, Response } from "express";
import { ContextRunner } from "express-validator";

/**
 * Validate the request body using express-validator
 * @param validations list of validation chains
 * @returns middleware function that validates the request
 */
function validate(validations: ContextRunner[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    for (const validation of validations) {
      const result = await validation.run(req);
      if (!result.isEmpty()) {
        res.status(400).json({ errors: result.array() });
        return;
      }
    }

    next();
  };
}

export default validate;
