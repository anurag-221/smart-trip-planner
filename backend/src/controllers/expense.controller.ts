import { FastifyRequest, FastifyReply } from "fastify";
import {
  addExpense,
  calculateBalances,
  calculateSettlements,
} from "../expenses/expense.service";
import { AuthenticatedRequest } from "../auth/authenticated-request";

export async function addExpenseHandler(
  req: FastifyRequest,
  reply: FastifyReply
) {
  const authReq = req as AuthenticatedRequest;
  const { tripId } = authReq.params as any;
  const { title, amount, splits } = authReq.body as any;

  const expense = addExpense({
    tripId,
    title,
    amount,
    paidBy: authReq.user.id,
    splits,
  });

  return reply.send(expense);
}

export async function getBalancesHandler(
  req: FastifyRequest,
  reply: FastifyReply
) {
  const { tripId } = req.params as any;
  return reply.send(calculateBalances(tripId));
}

export async function getSettlementsHandler(
  req: FastifyRequest,
  reply: FastifyReply
) {
  const { tripId } = req.params as any;
  return reply.send(calculateSettlements(tripId));
}