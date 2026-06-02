import cron from 'node-cron';
import Delivery from '../models/Delivery';

// Run every 15 minutes to auto-confirm deliveries that have passed their complaint window
export const startCronJobs = () => {
  cron.schedule('*/15 * * * *', async () => {
    try {
      console.log('[Cron] Running auto-confirm delivery job...');
      const now = new Date();
      
      const result = await Delivery.updateMany(
        {
          status: 'delivered',
          isAutoConfirmed: false,
          complaintWindowEndsAt: { $lt: now }
        },
        {
          $set: { isAutoConfirmed: true }
        }
      );
      
      if (result.modifiedCount > 0) {
        console.log(`[Cron] Auto-confirmed ${result.modifiedCount} deliveries.`);
      }
    } catch (error) {
      console.error('[Cron Error] Failed to auto-confirm deliveries:', error);
    }
  });
  // Run every night at midnight to generate deliveries for active subscriptions for the upcoming day
  cron.schedule('0 0 * * *', async () => {
    try {
      console.log('[Cron] Running daily delivery generation job...');
      const Subscription = (await import('../models/Subscription')).default;
      const Customer = (await import('../models/Customer')).default;
      
      const activeSubscriptions = await Subscription.find({ status: 'active', vacationMode: false });
      
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      const tomorrowDay = tomorrow.getDay(); // 0 (Sun) to 6 (Sat)
      
      let createdCount = 0;
      
      for (const sub of activeSubscriptions) {
        // Determine if delivery should happen tomorrow
        let shouldDeliver = false;
        if (sub.frequency === 'daily') {
          shouldDeliver = true;
        } else if (sub.frequency === 'weekly' || sub.frequency === 'custom') {
          if (sub.deliveryDays && sub.deliveryDays.includes(tomorrowDay)) {
            shouldDeliver = true;
          }
        } else if (sub.frequency === 'alternate_day') {
          // Simple alternate day logic: check if difference in days since start is even
          shouldDeliver = tomorrow.getDate() % 2 === 0; // naive implementation
        }
        
        if (shouldDeliver) {
          const customer = await Customer.findById(sub.customerId);
          if (customer && customer.routeId) {
            await Delivery.create({
              farmerId: customer.farmerId,
              customerId: customer._id,
              routeId: customer.routeId,
              date: tomorrow,
              shift: 'morning',
              quantity: sub.quantity,
              status: 'pending'
            });
            createdCount++;
          }
        }
      }
      
      console.log(`[Cron] Generated ${createdCount} deliveries for ${tomorrow.toDateString()}.`);
    } catch (error) {
      console.error('[Cron Error] Failed to generate daily deliveries:', error);
    }
  });

  console.log('[Cron] Background jobs initialized.');
};
