import express from "express";

import {
  addExpense,
  getBudgetDetails,
} from "./budget.controller.js";

import { protect } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.post(
  "/:orgId/add-expense",
  protect,
  addExpense
);

router.get(
  "/:orgId",
  protect,
  getBudgetDetails
);

export default router;