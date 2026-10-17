import { demoUsers, getUser } from '../data/seedData';

const STORAGE_KEY = 'collabbase-demo-user';

export const demoAuthService = {
  async getCurrentUser() {
    const savedId = window.localStorage.getItem(STORAGE_KEY);
    return getUser(savedId) || null;
  },
  async signIn({ userId }) {
    const user = getUser(userId) || demoUsers[0];
    window.localStorage.setItem(STORAGE_KEY, user.id);
    return user;
  },
  async signOut() {
    window.localStorage.removeItem(STORAGE_KEY);
  },
  async switchProfile(userId) {
    return this.signIn({ userId });
  },
};