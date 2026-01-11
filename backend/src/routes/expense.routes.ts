import { FastifyInstance } from "fastify";
import { authenticate } from "../middleware/authenticate";
import { authorizeTripRole } from "../middleware/authorizeTripRole";
import {
  addExpenseHandler,
  getBalancesHandler,
  getSettlementsHandler,
} from "../controllers/expense.controller";

export async function expenseRoutes(app: FastifyInstance) {
  app.post(
    "/trips/:tripId/expenses",
    {
      preHandler: [
        authenticate,
        authorizeTripRole("collaborator"),
      ],
    },
    addExpenseHandler
  );

  app.get(
    "/trips/:tripId/expenses/balances",
    { preHandler: authenticate },
    getBalancesHandler
  );

  app.get(
    "/trips/:tripId/expenses/settlements",
    { preHandler: authenticate },
    getSettlementsHandler
  );
}