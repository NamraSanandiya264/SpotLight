import {
  addExpenseService,
  getBudgetDetailsService,
} from "./budget.service.js";

export const addExpense = async (req, res) => {
  try {

    const { orgId } = req.params;

    const { itemName, quantity, costPerItem } = req.body;

    const expense = await addExpenseService(
      orgId,
      itemName,
      quantity,
      costPerItem,
      req.user._id
    );

    res.status(201).json({
      success: true,
      expense,
    });

  } catch (error) {

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getBudgetDetails = async (req, res) => {
  try {

    const { orgId } = req.params;

    const data = await getBudgetDetailsService(orgId);

    res.status(200).json({
      success: true,
      data,
    });

  } catch (error) {

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};