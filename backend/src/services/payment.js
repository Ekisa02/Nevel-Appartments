// Payment abstraction. Add providers (mpesa, card, paypal) by registering them here;
// the booking service only talks to this interface.
const providers = {
  manual: {
    async createPayment(booking) { return { provider: 'manual', status: 'unpaid', reference: booking.id }; },
    async verifyPayment() { return { status: 'unpaid' }; },
  },
};
export const registerProvider = (name, impl) => { providers[name] = impl; };
export const getProvider = (name = 'manual') => {
  if (!providers[name]) throw Object.assign(new Error('Payment method not available.'), { status: 400 });
  return providers[name];
};
