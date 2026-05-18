import Budget from "./budget.model.js";
import Organization from "../organizations/organization.model.js";

export const addExpenseService = async (
  orgId,
  itemName,
  quantity,
  costPerItem,
  userId
) => {

  const org = await Organization.findById(orgId);

  if (!org) {
    throw new Error("Organization not found");
  }

  const totalCost = quantity * costPerItem;

  if (org.remainingBudget < totalCost) {
    throw new Error("Insufficient budget");
  }

  const expense = await Budget.create({
    organization: orgId,
    itemName,
    quantity,
    costPerItem,
    totalCost,
    addedBy: userId,
  });

  org.remainingBudget -= totalCost;

  await org.save();

  return expense;
};

export const getBudgetDetailsService = async (orgId) => {

  const org = await Organization.findById(orgId);

  const expenses = await Budget.find({
    organization: orgId,
  }).sort({ createdAt: -1 });

  return {
    organization: org.name,
    totalBudget: org.totalBudget,
    remainingBudget: org.remainingBudget,
    spentBudget: org.totalBudget - org.remainingBudget,
    expenses,
  };
};