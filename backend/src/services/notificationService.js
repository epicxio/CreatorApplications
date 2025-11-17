const NotificationType = require('../models/NotificationType');
const Notification = require('../models/Notification');
const User = require('../models/User');

// Enhanced template rendering: supports {var} and warns if missing
function renderTemplate(template, context) {
  return template.replace(/{{(\w+)}}/g, (_, key) => {
    if (context[key] === undefined) {
      console.warn(`[Notification] Template variable {${key}} not found in context!`);
      return `{${key}}`;
    }
    return context[key];
  });
}

async function triggerNotification(eventType, context = {}) {
  console.log('[triggerNotification] Event:', eventType, 'Context:', context);

  // 1. Find all active notification types for this event
  const notificationTypes = await NotificationType.find({ eventType, isActive: true });
  console.log('[triggerNotification] Found notification types:', notificationTypes.map(nt => nt.title));

  for (const nt of notificationTypes) {
    // 2. Find all users with the relevant roles
    const users = await User.find({ role: { $in: nt.roles } });
    console.log(`[triggerNotification] For notification type "${nt.title}", found users:`, users.map(u => u.email));

    for (const user of users) {
      // --- DYNAMIC CONTEXT MERGE ---
      // Merge user fields into context, prefixed and unprefixed
      const userFields = user._doc || user;
      const userContext = {
        ...context,
        userName: context.userName || userFields.name,
        userEmail: context.userEmail || userFields.email,
        userRole: context.userRole || userFields.role,
        ...userFields // allow direct access to any user property
      };

      // 3. Render the message template with merged context
      const message = renderTemplate(nt.messageTemplate, userContext);
      const title = renderTemplate(nt.title, userContext);
      const channels = Object.entries(nt.channels)
        .filter(([k, v]) => v)
        .map(([k]) => k);

      // 4. Determine schedule
      let scheduledAt = null;
      if (nt.schedule && nt.schedule.enabled && nt.schedule.type === 'scheduled') {
        if (nt.schedule.date) {
          scheduledAt = new Date(nt.schedule.date);
          if (nt.schedule.time) {
            const [h, m] = nt.schedule.time.split(':');
            scheduledAt.setHours(Number(h), Number(m), 0, 0);
          }
        } else if (nt.schedule.time && nt.schedule.days && nt.schedule.days.length > 0) {
          const now = new Date();
          let nextDay = null;
          let minDiff = Infinity;
          for (const day of nt.schedule.days) {
            const dayIndex = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'].indexOf(day.toLowerCase());
            if (dayIndex === -1) continue;
            const candidate = new Date(now);
            candidate.setDate(now.getDate() + ((7 + dayIndex - now.getDay()) % 7));
            if (nt.schedule.time) {
              const [h, m] = nt.schedule.time.split(':');
              candidate.setHours(Number(h), Number(m), 0, 0);
            }
            if (candidate <= now) candidate.setDate(candidate.getDate() + 7);
            const diff = candidate - now;
            if (diff < minDiff) {
              minDiff = diff;
              nextDay = candidate;
            }
          }
          scheduledAt = nextDay;
        } else if (nt.schedule.cron) {
          scheduledAt = null;
        }
      }
      // 5. Create the notification
      const notification = await Notification.create({
        user: user._id,
        title,
        message,
        eventType: nt.eventType,
        read: false,
        delivered: false,
        scheduledAt,
        channels,
        meta: userContext
      });
      console.log('[triggerNotification] Created notification:', notification);
      // 6. If immediate, you may want to send email/push here (optional)
    }
  }
}

async function processScheduledNotifications() {
  const now = new Date();
  const notifications = await Notification.find({
    scheduledAt: { $lte: now },
    delivered: false
  });
  for (const notif of notifications) {
    notif.delivered = true;
    notif.sentAt = new Date();
    await notif.save();
  }
  return notifications.length;
}

module.exports = { triggerNotification, processScheduledNotifications }; 