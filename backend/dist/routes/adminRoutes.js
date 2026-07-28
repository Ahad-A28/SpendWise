import { Router } from 'express';
import { getAdminUsers, updateUserAdminSettings, getCreditLogs } from '../controllers/adminController.js';
const router = Router();
// Middleware: Standard HTTP Basic Auth from env
const adminAuth = (req, res, next) => {
    const validUser = process.env.ADMIN_USERNAME;
    const validPass = process.env.ADMIN_PASSWORD;
    if (!validUser || !validPass) {
        return res.status(503).json({ error: 'Admin credentials not configured on server.' });
    }
    const authHeader = req.headers['authorization'] || '';
    if (!authHeader.startsWith('Basic ')) {
        return res.status(401).json({ error: 'Invalid admin credentials.' });
    }
    // Decode base64 "username:password"
    const base64 = authHeader.slice(6);
    const decoded = Buffer.from(base64, 'base64').toString('utf-8');
    const colonIndex = decoded.indexOf(':');
    const username = decoded.substring(0, colonIndex);
    const password = decoded.substring(colonIndex + 1);
    if (username !== validUser || password !== validPass) {
        return res.status(401).json({ error: 'Invalid admin credentials.' });
    }
    next();
};
router.get('/users', adminAuth, getAdminUsers);
router.get('/users/:userId/credit-logs', adminAuth, getCreditLogs);
router.post('/users/:userId', adminAuth, updateUserAdminSettings);
export default router;
//# sourceMappingURL=adminRoutes.js.map