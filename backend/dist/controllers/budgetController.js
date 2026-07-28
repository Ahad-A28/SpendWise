import Budget from '../models/Budget.js';
export const getBudgets = async (req, res) => {
    try {
        const userId = req.auth?.userId;
        if (!userId)
            return res.status(401).json({ error: 'Unauthorized' });
        const budgets = await Budget.find({ userId });
        const formatted = budgets.map((b) => {
            const obj = b.toObject();
            obj.id = obj._id.toString();
            delete obj._id;
            delete obj.__v;
            return obj;
        });
        if (formatted.length > 0) {
            res.json(formatted);
        }
        else {
            const defaults = [
                { category: 'Food & Dining', allocated: 10000 },
                { category: 'Housing & Rent', allocated: 25000 },
                { category: 'Shopping & Goods', allocated: 8000 },
                { category: 'Entertainment & Fun', allocated: 5000 },
                { category: 'Transportation', allocated: 4000 },
                { category: 'Utilities & Bills', allocated: 6000 },
                { category: 'Subscriptions', allocated: 2000 },
                { category: 'Healthcare & Fitness', allocated: 5000 },
                { category: 'Personal Care', allocated: 3000 },
                { category: 'Miscellaneous', allocated: 4000 }
            ];
            const defaultsWithUserId = defaults.map(d => ({ ...d, userId }));
            await Budget.insertMany(defaultsWithUserId);
            res.json(defaults);
        }
    }
    catch (error) {
        console.error('Failed to fetch budgets', error);
        res.status(500).json({ error: 'Failed to fetch budgets' });
    }
};
export const saveBudgets = async (req, res) => {
    try {
        const userId = req.auth?.userId;
        if (!userId)
            return res.status(401).json({ error: 'Unauthorized' });
        const data = req.body;
        await Budget.deleteMany({ userId });
        if (data && data.length > 0) {
            const dataWithUserId = data.map((d) => ({ ...d, userId }));
            await Budget.insertMany(dataWithUserId);
        }
        res.json({ success: true });
    }
    catch (error) {
        console.error('Failed to save budgets', error);
        res.status(500).json({ error: 'Failed to save budgets' });
    }
};
//# sourceMappingURL=budgetController.js.map