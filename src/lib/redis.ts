type PresenceData = {
  status: "ONLINE" | "IN_TEST" | "OFFLINE";
  testTitle?: string;
  timestamp: number;
};

type NotificationPayload = {
  id: string;
  type: string;
  title: string;
  message: string;
  linkUrl?: string;
  read: boolean;
  createdAt: string;
};

const PRESENCE_PREFIX = "presence:";
const NOTIFICATION_PREFIX = "notify:";

const store = new Map<string, string>();

const subscribers = new Map<string, Set<(data: string) => void>>();

export const redis = {
  async setex(key: string, _ttl: number, value: string) {
    store.set(key, value);
  },

  async get(key: string): Promise<string | null> {
    return store.get(key) ?? null;
  },

  async mget(...keys: string[]): Promise<(string | null)[]> {
    return keys.map((k) => store.get(k) ?? null);
  },

  async keys(pattern: string): Promise<string[]> {
    const prefix = pattern.replace("*", "");
    return Array.from(store.keys()).filter((k) => k.startsWith(prefix));
  },

  async publish(channel: string, message: string) {
    const subs = subscribers.get(channel);
    if (subs) {
      for (const cb of subs) {
        cb(message);
      }
    }
  },

  subscribe(channel: string, callback: (message: string) => void) {
    if (!subscribers.has(channel)) {
      subscribers.set(channel, new Set());
    }
    subscribers.get(channel)!.add(callback);
    return { unsub: () => subscribers.get(channel)?.delete(callback) };
  },

  duplicate() {
    return redis;
  },

  async connect() {},
};

export async function setStudentPresence(
  _tenantId: string,
  studentId: string,
  status: "ONLINE" | "IN_TEST" | "OFFLINE",
  testTitle?: string
) {
  const key = `${PRESENCE_PREFIX}${_tenantId}:${studentId}`;
  const payload: PresenceData = { status, testTitle, timestamp: Date.now() };
  await redis.setex(key, 30, JSON.stringify(payload));
  await redis.publish(
    `channel:presence:${_tenantId}`,
    JSON.stringify(payload)
  );
}

export async function getStudentPresence(
  tenantId: string,
  studentId: string
): Promise<PresenceData> {
  const raw = await redis.get(`${PRESENCE_PREFIX}${tenantId}:${studentId}`);
  if (!raw) return { status: "OFFLINE", timestamp: Date.now() };
  return JSON.parse(raw);
}

export async function getAllStudentPresences(tenantId: string) {
  const keys = await redis.keys(`${PRESENCE_PREFIX}${tenantId}:*`);
  if (keys.length === 0) return {};
  const values = await redis.mget(...keys);
  const result: Record<string, PresenceData> = {};
  keys.forEach((key, i) => {
    const studentId = key.replace(`${PRESENCE_PREFIX}${tenantId}:`, "");
    result[studentId] = values[i]
      ? JSON.parse(values[i])
      : { status: "OFFLINE", timestamp: Date.now() };
  });
  return result;
}

export async function getUnreadNotifications(userId: string) {
  const raw = await redis.get(`${NOTIFICATION_PREFIX}${userId}`);
  if (!raw) return [];
  return JSON.parse(raw);
}

export async function setUnreadNotifications(
  userId: string,
  notifications: NotificationPayload[]
) {
  await redis.setex(
    `${NOTIFICATION_PREFIX}${userId}`,
    86400,
    JSON.stringify(notifications)
  );
}

export type { PresenceData, NotificationPayload };
