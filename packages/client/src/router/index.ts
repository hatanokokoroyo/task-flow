import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'WorkItemList',
      component: () => import('@/views/WorkItemList.vue'),
      meta: { title: '工作项管理' }
    },
    {
      path: '/work-item/:id',
      name: 'WorkItemDetail',
      component: () => import('@/views/WorkItemDetail.vue'),
      meta: { title: '工作项详情' }
    },
    {
      path: '/daily-log',
      name: 'DailyLog',
      component: () => import('@/views/DailyLog.vue'),
      meta: { title: '日志查看' }
    },
    {
      path: '/recycle-bin',
      name: 'RecycleBin',
      component: () => import('@/views/RecycleBin.vue'),
      meta: { title: '回收站' }
    }
  ]
})

export default router
