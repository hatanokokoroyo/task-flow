import { defineStore } from 'pinia';
import { workItemService } from '../services/work-item';

export const useWorkItemStore = defineStore('workItem', {
  state: () => ({
    workItems: [],
    loading: false,
    currentWorkItem: null,
  }),
  actions: {
    async fetchWorkItems(params) {
      this.loading = true;
      try {
        this.workItems = await workItemService.getWorkItems(params);
      } finally {
        this.loading = false;
      }
    },
    async createWorkItem(data) {
      const newItem = await workItemService.createWorkItem(data);
      await this.fetchWorkItems();
      return newItem;
    },
    async updateStatus(id, status) {
      await workItemService.updateStatus(id, status);
      await this.fetchWorkItems();
    },
    async deleteWorkItem(id) {
      await workItemService.deleteWorkItem(id);
      await this.fetchWorkItems();
    }
  }
});
