// Replace these methods with the college email + OTP integration.
export const realAuthService = {
  async getCurrentUser() { return null; },
  async signIn() { throw new Error('Real authentication is not configured yet.'); },
  async signOut() {},
  async switchProfile() { throw new Error('Profile switching is only available in demo mode.'); },
};