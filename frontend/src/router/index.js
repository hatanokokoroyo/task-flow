import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from '../views/Dashboard.vue';
import DailyLog from '../views/DailyLog.vue';
import RecycleBin from '../views/RecycleBin.vue';

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard,
  },
  {
    path: '/daily-log',
    name: 'DailyLog',
    component: DailyLog,
  },
  {
    path: '/recycle-bin',
    name: 'RecycleBin',
    component: RecycleBin,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
