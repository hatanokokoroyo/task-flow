import api from './api';

export const workItemService = {
  getWorkItems(params) {
    return api.get('/work-items/', { params });
  },
  getWorkItem(id) {
    return api.get(`/work-items/${id}`);
  },
  createWorkItem(data) {
    return api.post('/work-items/', data);
  },
  updateStatus(id, status) {
    return api.patch(`/work-items/${id}/status`, { status });
  },
  deleteWorkItem(id) {
    return api.delete(`/work-items/${id}`);
  },
  addComment(id, content) {
    return api.post(`/work-items/${id}/comments`, { content });
  }
};

export const logService = {
  getLogs(params) {
    return api.get('/logs/', { params });
  }
};

export const recycleBinService = {
  getDeletedItems() {
    return api.get('/recycle-bin/');
  },
  restoreItem(id) {
    return api.post(`/recycle-bin/${id}/restore`);
  },
  permanentlyDeleteItem(id) {
    return api.delete(`/recycle-bin/${id}`);
  }
};
