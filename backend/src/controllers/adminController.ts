import type { Request, Response } from 'express';
import AppSetting from '../models/AppSetting.js';
import CreditLog from '../models/CreditLog.js';
import { createClerkClient } from '@clerk/express';

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

interface CreditConfig {
  credits: number;
  requestCount: number;
  windowStart: number;
  blockedUntil: number | null;
  isLocked?: boolean;
  chatCost?: number;
  agentCost?: number;
  fileCost?: number;
}

export const getAdminUsers = async (req: Request, res: Response) => {
  try {
    // Fetch all AI credit configs
    const settings = await AppSetting.find({ key: 'aiCreditConfig' });
    const now = Date.now();
    
    // Fetch users from Clerk
    const userIds = settings.map(s => s.userId).filter(Boolean);
    let clerkUsers: any[] = [];
    if (userIds.length > 0) {
      try {
        const clerkRes = await clerkClient.users.getUserList({ userId: userIds, limit: 100 });
        clerkUsers = clerkRes.data;
      } catch (clerkErr) {
        console.error('Error fetching clerk users:', clerkErr);
      }
    }

    const clerkUserMap = new Map();
    clerkUsers.forEach(u => clerkUserMap.set(u.id, u));

    const usersData = settings.map(setting => {
      const data: CreditConfig = typeof setting.value === 'object' ? setting.value : {
        credits: Number(setting.value) || 0,
        requestCount: 0,
        windowStart: Date.now(),
        blockedUntil: null,
        isLocked: false,
      };

      const isRateLimited = !!(data.blockedUntil && now < data.blockedUntil);
      const rateLimitRemainingMinutes = isRateLimited
        ? Math.ceil((data.blockedUntil! - now) / (1000 * 60))
        : 0;

      const clerkUser = setting.userId ? clerkUserMap.get(setting.userId) : null;
      const primaryEmailObj = clerkUser?.emailAddresses?.find((e: any) => e.id === clerkUser.primaryEmailAddressId);
      
      let email = 'Unknown Email';
      let name = 'Unknown User';
      
      if (clerkUser) {
        email = primaryEmailObj?.emailAddress || 'Unknown Email';
        name = clerkUser.firstName ? `${clerkUser.firstName} ${clerkUser.lastName || ''}`.trim() : 'Unknown User';
      } else if (!setting.userId) {
        name = 'Legacy Global Config';
        email = 'No Clerk ID';
      }

      const imageUrl = clerkUser?.imageUrl;
      const finalUserId = setting.userId || `legacy_${setting._id.toString()}`;

      return {
        userId: finalUserId,
        name,
        email,
        imageUrl,
        credits: data.credits,
        requestCount: data.requestCount,
        isLocked: data.isLocked ?? false,
        isRateLimited,
        rateLimitRemainingMinutes,
        chatCost: data.chatCost ?? 1,
        agentCost: data.agentCost ?? 5,
        fileCost: data.fileCost ?? 10,
      };
    });

    res.json(usersData);
  } catch (error) {
    console.error('Admin get users error:', error);
    res.status(500).json({ error: 'Failed to fetch admin users' });
  }
};

export const updateUserAdminSettings = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { action, value } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    let setting = await AppSetting.findOne({ key: 'aiCreditConfig', userId });
    
    if (!setting) {
      // Create if it doesn't exist
      const initialData: CreditConfig = {
        credits: 10000,
        requestCount: 0,
        windowStart: Date.now(),
        blockedUntil: null,
        isLocked: false,
      };
      setting = new AppSetting({ key: 'aiCreditConfig', value: initialData, userId });
    }

    let data: CreditConfig = typeof setting.value === 'object' ? setting.value : {
      credits: Number(setting.value) || 10000,
      requestCount: 0,
      windowStart: Date.now(),
      blockedUntil: null,
      isLocked: false,
    };

    if (action === 'setLocked') {
      data.isLocked = Boolean(value);
    } else if (action === 'addCredits') {
      data.credits = (data.credits || 0) + Number(value);
    } else if (action === 'setCredits') {
      data.credits = Number(value);
    } else if (action === 'setChatCost') {
      data.chatCost = Number(value);
    } else if (action === 'setAgentCost') {
      data.agentCost = Number(value);
    } else if (action === 'setFileCost') {
      data.fileCost = Number(value);
    } else if (action === 'resetRateLimit') {
      data.blockedUntil = null;
      data.requestCount = 0;
      data.windowStart = Date.now();
    }

    setting.value = data;
    setting.markModified('value');
    await setting.save();

    let details = '';
    if (action === 'setLocked') details = `Locked status set to ${value}`;
    else if (action === 'addCredits') details = `Added ${value} credits`;
    else if (action === 'setCredits') details = `Set credits to ${value}`;
    else if (action === 'setChatCost') details = `Set Chat Cost to ${value}`;
    else if (action === 'setAgentCost') details = `Set Agent Cost to ${value}`;
    else if (action === 'setFileCost') details = `Set File Cost to ${value}`;
    else if (action === 'resetRateLimit') details = `Reset rate limit`;

    await CreditLog.create({
      userId,
      action: 'Admin Update',
      amount: action.toLowerCase().includes('credit') ? Number(value) : 0,
      details,
    });

    res.json({ success: true, data });
  } catch (error) {
    console.error('Admin update settings error:', error);
    res.status(500).json({ error: 'Failed to update admin settings' });
  }
};

export const getCreditLogs = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const logs = await CreditLog.find({ userId }).sort({ createdAt: -1 }).limit(100);
    res.json(logs);
  } catch (error) {
    console.error('Admin get credit logs error:', error);
    res.status(500).json({ error: 'Failed to fetch credit logs' });
  }
};
