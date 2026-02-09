/**
 * Task Flow - 工作日志管理系统
 * 公共JavaScript模块及Mock数据
 */

// ========================================
// Mock Data
// ========================================

const STATUS_MAP = {
  pending: { label: '待处理', class: 'status-pending' },
  design: { label: '设计中', class: 'status-design' },
  develop: { label: '开发中', class: 'status-develop' },
  test: { label: '测试中', class: 'status-test' },
  delivery: { label: '交付中', class: 'status-delivery' },
  done: { label: '已完成', class: 'status-done' }
};

const STATUS_OPTIONS = [
  { value: 'pending', label: '待处理' },
  { value: 'design', label: '设计中' },
  { value: 'develop', label: '开发中' },
  { value: 'test', label: '测试中' },
  { value: 'delivery', label: '交付中' },
  { value: 'done', label: '已完成' }
];

// 工作项数据
let workItems = [
  {
    id: 1,
    title: '用户管理系统重构',
    content: '对现有用户管理系统进行全面重构，包括前端界面优化、后端API重构、数据库优化等工作。\n\n主要目标：\n1. 提升系统性能\n2. 优化用户体验\n3. 支持更多认证方式',
    status: 'develop',
    startTime: '2026-02-01 09:00',
    endTime: '2026-02-15 18:00',
    createdAt: '2026-01-28 10:30:00',
    updatedAt: '2026-02-08 14:20:00',
    subItems: [
      {
        id: 101,
        parentId: 1,
        title: '需求分析与设计',
        content: '完成用户管理系统的需求分析和技术设计文档',
        status: 'done',
        startTime: '2026-02-01 09:00',
        endTime: '2026-02-03 18:00',
        createdAt: '2026-02-01 09:00:00',
        subItems: []
      },
      {
        id: 102,
        parentId: 1,
        title: '前端界面重构',
        content: '使用Vue3重构用户管理前端界面',
        status: 'develop',
        startTime: '2026-02-04 09:00',
        endTime: '2026-02-10 18:00',
        createdAt: '2026-02-04 09:00:00',
        subItems: [
          {
            id: 1021,
            parentId: 102,
            title: '用户列表页面',
            content: '重构用户列表页面，支持分页、搜索、筛选',
            status: 'done',
            startTime: '2026-02-04 09:00',
            endTime: '2026-02-05 18:00',
            createdAt: '2026-02-04 09:00:00',
            subItems: []
          },
          {
            id: 1022,
            parentId: 102,
            title: '用户详情页面',
            content: '重构用户详情页面',
            status: 'develop',
            startTime: '2026-02-06 09:00',
            endTime: '2026-02-07 18:00',
            createdAt: '2026-02-06 09:00:00',
            subItems: []
          }
        ]
      },
      {
        id: 103,
        parentId: 1,
        title: '后端API重构',
        content: '优化后端API接口设计',
        status: 'pending',
        startTime: '2026-02-11 09:00',
        endTime: '2026-02-14 18:00',
        createdAt: '2026-02-01 10:00:00',
        subItems: []
      }
    ],
    comments: [
      {
        id: 1001,
        content: '今天开始进行需求分析，主要与产品经理和技术负责人确认了重构范围',
        createdAt: '2026-02-01 17:30:00',
        updatedAt: null
      },
      {
        id: 1002,
        content: '完成了技术设计文档的初稿，准备明天进行评审',
        createdAt: '2026-02-02 18:00:00',
        updatedAt: null
      },
      {
        id: 1003,
        content: '前端界面重构进展顺利，用户列表页面已完成开发和测试',
        createdAt: '2026-02-05 17:45:00',
        updatedAt: null
      }
    ]
  },
  {
    id: 2,
    title: '数据分析报表功能开发',
    content: '开发新的数据分析报表模块，支持多维度数据可视化展示，包含日报、周报、月报等多种报表类型。',
    status: 'design',
    startTime: '2026-02-05 09:00',
    endTime: '2026-02-20 18:00',
    createdAt: '2026-02-03 14:00:00',
    updatedAt: '2026-02-07 10:15:00',
    subItems: [
      {
        id: 201,
        parentId: 2,
        title: '报表需求整理',
        content: '整理各业务方的报表需求',
        status: 'done',
        startTime: '2026-02-05 09:00',
        endTime: '2026-02-06 18:00',
        createdAt: '2026-02-05 09:00:00',
        subItems: []
      },
      {
        id: 202,
        parentId: 2,
        title: '数据可视化设计',
        content: '设计图表展示方案和交互方式',
        status: 'design',
        startTime: '2026-02-07 09:00',
        endTime: '2026-02-09 18:00',
        createdAt: '2026-02-07 09:00:00',
        subItems: []
      }
    ],
    comments: [
      {
        id: 2001,
        content: '与业务方开会确认了报表的核心需求，主要需要支持销售数据和用户行为数据的分析',
        createdAt: '2026-02-05 16:00:00',
        updatedAt: null
      }
    ]
  },
  {
    id: 3,
    title: 'API网关性能优化',
    content: '对API网关进行性能优化，解决高并发场景下的响应延迟问题',
    status: 'test',
    startTime: '2026-01-20 09:00',
    endTime: '2026-02-10 18:00',
    createdAt: '2026-01-18 11:00:00',
    updatedAt: '2026-02-08 09:30:00',
    subItems: [
      {
        id: 301,
        parentId: 3,
        title: '性能瓶颈分析',
        content: '分析当前系统的性能瓶颈',
        status: 'done',
        startTime: '2026-01-20 09:00',
        endTime: '2026-01-22 18:00',
        createdAt: '2026-01-20 09:00:00',
        subItems: []
      },
      {
        id: 302,
        parentId: 3,
        title: '缓存方案实施',
        content: '实施Redis缓存方案',
        status: 'done',
        startTime: '2026-01-23 09:00',
        endTime: '2026-01-28 18:00',
        createdAt: '2026-01-23 09:00:00',
        subItems: []
      },
      {
        id: 303,
        parentId: 3,
        title: '压力测试',
        content: '进行压力测试验证优化效果',
        status: 'test',
        startTime: '2026-02-05 09:00',
        endTime: '2026-02-10 18:00',
        createdAt: '2026-02-05 09:00:00',
        subItems: []
      }
    ],
    comments: [
      {
        id: 3001,
        content: '压力测试结果显示，QPS已从之前的3000提升到8000，优化效果显著',
        createdAt: '2026-02-08 16:30:00',
        updatedAt: null
      }
    ]
  },
  {
    id: 4,
    title: '移动端App V2.0版本发布',
    content: '完成移动端App V2.0版本的开发和发布工作',
    status: 'delivery',
    startTime: '2026-01-10 09:00',
    endTime: '2026-02-09 18:00',
    createdAt: '2026-01-08 10:00:00',
    updatedAt: '2026-02-09 11:00:00',
    subItems: [],
    comments: [
      {
        id: 4001,
        content: '已提交App Store和Google Play审核，等待审核通过',
        createdAt: '2026-02-09 11:00:00',
        updatedAt: null
      }
    ]
  },
  {
    id: 5,
    title: '新员工培训材料准备',
    content: '准备技术部门新员工入职培训材料，包括技术栈介绍、开发规范、系统架构等内容',
    status: 'done',
    startTime: '2026-01-25 09:00',
    endTime: '2026-02-01 18:00',
    createdAt: '2026-01-24 14:00:00',
    updatedAt: '2026-02-01 17:00:00',
    subItems: [],
    comments: []
  },
  {
    id: 6,
    title: '数据库迁移方案制定',
    content: '制定从MySQL迁移到PostgreSQL的技术方案',
    status: 'pending',
    startTime: '2026-02-15 09:00',
    endTime: '2026-03-01 18:00',
    createdAt: '2026-02-08 15:00:00',
    updatedAt: '2026-02-08 15:00:00',
    subItems: [],
    comments: []
  }
];

// 回收站数据
let recycledItems = [
  {
    id: 99,
    title: '旧版本功能清理',
    status: 'done',
    deletedAt: '2026-02-07 10:00:00',
    expiresAt: '2026-02-14 10:00:00'
  },
  {
    id: 98,
    title: '临时测试任务',
    status: 'pending',
    deletedAt: '2026-02-06 15:30:00',
    expiresAt: '2026-02-13 15:30:00'
  }
];

// 活动日志数据
let activityLogs = [
  {
    id: 1,
    type: 'status',
    workItemId: 1,
    workItemTitle: '用户管理系统重构',
    description: '状态从"设计中"变更为"开发中"',
    oldValue: 'design',
    newValue: 'develop',
    createdAt: '2026-02-09 09:30:00'
  },
  {
    id: 2,
    type: 'comment',
    workItemId: 3,
    workItemTitle: 'API网关性能优化',
    description: '添加了新评论',
    createdAt: '2026-02-08 16:30:00'
  },
  {
    id: 3,
    type: 'status',
    workItemId: 3,
    workItemTitle: 'API网关性能优化',
    description: '子工作项"压力测试"状态变更为"测试中"',
    oldValue: 'develop',
    newValue: 'test',
    createdAt: '2026-02-08 10:00:00'
  },
  {
    id: 4,
    type: 'create',
    workItemId: 6,
    workItemTitle: '数据库迁移方案制定',
    description: '创建了新工作项',
    createdAt: '2026-02-08 15:00:00'
  },
  {
    id: 5,
    type: 'update',
    workItemId: 2,
    workItemTitle: '数据分析报表功能开发',
    description: '更新了工作项内容',
    createdAt: '2026-02-07 10:15:00'
  },
  {
    id: 6,
    type: 'delete',
    workItemId: 99,
    workItemTitle: '旧版本功能清理',
    description: '工作项被删除到回收站',
    createdAt: '2026-02-07 10:00:00'
  },
  {
    id: 7,
    type: 'status',
    workItemId: 102,
    workItemTitle: '前端界面重构',
    description: '子工作项"用户列表页面"状态变更为"已完成"',
    oldValue: 'develop',
    newValue: 'done',
    createdAt: '2026-02-05 17:30:00'
  },
  {
    id: 8,
    type: 'comment',
    workItemId: 1,
    workItemTitle: '用户管理系统重构',
    description: '添加了新评论',
    createdAt: '2026-02-05 17:45:00'
  },
  {
    id: 9,
    type: 'create',
    workItemId: 1022,
    workItemTitle: '用户详情页面',
    description: '创建了子工作项',
    createdAt: '2026-02-06 09:00:00'
  },
  {
    id: 10,
    type: 'status',
    workItemId: 5,
    workItemTitle: '新员工培训材料准备',
    description: '状态变更为"已完成"',
    oldValue: 'develop',
    newValue: 'done',
    createdAt: '2026-02-01 17:00:00'
  }
];

// ========================================
// Utility Functions
// ========================================

/**
 * 格式化日期时间
 */
function formatDateTime(dateStr, format = 'full') {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  if (format === 'date') {
    return `${year}-${month}-${day}`;
  } else if (format === 'time') {
    return `${hours}:${minutes}`;
  } else if (format === 'datetime') {
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  }
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * 相对时间显示
 */
function relativeTime(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = now - date;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 7) {
    return formatDateTime(dateStr, 'datetime');
  } else if (days > 0) {
    return `${days}天前`;
  } else if (hours > 0) {
    return `${hours}小时前`;
  } else if (minutes > 0) {
    return `${minutes}分钟前`;
  } else {
    return '刚刚';
  }
}

/**
 * 生成唯一ID
 */
function generateId() {
  return Date.now() + Math.floor(Math.random() * 1000);
}

/**
 * 获取状态标签HTML
 */
function getStatusTag(status) {
  const statusInfo = STATUS_MAP[status] || STATUS_MAP.pending;
  return `<span class="status-tag ${statusInfo.class}">${statusInfo.label}</span>`;
}

/**
 * 计算子工作项统计
 */
function calculateSubItemStats(subItems) {
  const total = subItems.length;
  if (total === 0) return null;
  
  const stats = { total, done: 0, inProgress: 0, pending: 0 };
  
  function countItems(items) {
    items.forEach(item => {
      if (item.status === 'done') {
        stats.done++;
      } else if (item.status === 'pending') {
        stats.pending++;
      } else {
        stats.inProgress++;
      }
      if (item.subItems && item.subItems.length > 0) {
        countItems(item.subItems);
      }
    });
  }
  
  countItems(subItems);
  stats.percentage = Math.round((stats.done / stats.total) * 100);
  return stats;
}

/**
 * 获取工作项数量统计
 */
function getWorkItemStats() {
  const stats = {
    total: workItems.length,
    pending: 0,
    inProgress: 0,
    done: 0
  };
  
  workItems.forEach(item => {
    if (item.status === 'done') {
      stats.done++;
    } else if (item.status === 'pending') {
      stats.pending++;
    } else {
      stats.inProgress++;
    }
  });
  
  return stats;
}

/**
 * 根据ID查找工作项
 */
function findWorkItemById(id) {
  return workItems.find(item => item.id === parseInt(id));
}

/**
 * 保存数据到LocalStorage
 */
function saveToLocalStorage() {
  localStorage.setItem('taskflow_workItems', JSON.stringify(workItems));
  localStorage.setItem('taskflow_recycledItems', JSON.stringify(recycledItems));
  localStorage.setItem('taskflow_activityLogs', JSON.stringify(activityLogs));
}

/**
 * 从LocalStorage加载数据
 */
function loadFromLocalStorage() {
  const savedWorkItems = localStorage.getItem('taskflow_workItems');
  const savedRecycledItems = localStorage.getItem('taskflow_recycledItems');
  const savedActivityLogs = localStorage.getItem('taskflow_activityLogs');
  
  if (savedWorkItems) {
    workItems = JSON.parse(savedWorkItems);
  }
  if (savedRecycledItems) {
    recycledItems = JSON.parse(savedRecycledItems);
  }
  if (savedActivityLogs) {
    activityLogs = JSON.parse(savedActivityLogs);
  }
}

/**
 * 添加活动日志
 */
function addActivityLog(type, workItemId, workItemTitle, description, oldValue = null, newValue = null) {
  const log = {
    id: generateId(),
    type,
    workItemId,
    workItemTitle,
    description,
    oldValue,
    newValue,
    createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
  };
  activityLogs.unshift(log);
  saveToLocalStorage();
}

/**
 * 显示Toast消息
 */
function showToast(message, type = 'success') {
  // 移除现有toast
  const existingToast = document.querySelector('.toast');
  if (existingToast) {
    existingToast.remove();
  }
  
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.style.cssText = `
    position: fixed;
    top: 80px;
    right: 24px;
    padding: 12px 20px;
    background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
    color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 9999;
    animation: slideIn 0.3s ease;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/**
 * 打开模态框
 */
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
  }
}

/**
 * 关闭模态框
 */
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
  }
}

/**
 * 确认对话框
 */
function confirmDialog(message) {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay active';
    overlay.innerHTML = `
      <div class="modal" style="max-width: 400px;">
        <div class="modal-header">
          <h3 class="modal-title">确认</h3>
        </div>
        <div class="modal-body">
          <p>${message}</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" id="confirmCancel">取消</button>
          <button class="btn btn-danger" id="confirmOk">确定</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    
    overlay.querySelector('#confirmCancel').addEventListener('click', () => {
      overlay.remove();
      resolve(false);
    });
    
    overlay.querySelector('#confirmOk').addEventListener('click', () => {
      overlay.remove();
      resolve(true);
    });
  });
}

/**
 * 获取URL参数
 */
function getUrlParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

/**
 * 生成日历数据
 */
function generateCalendarData(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDay = firstDay.getDay();
  const totalDays = lastDay.getDate();
  
  const days = [];
  
  // 前月天数
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startDay - 1; i >= 0; i--) {
    days.push({
      day: prevMonthLastDay - i,
      month: month - 1,
      isOtherMonth: true
    });
  }
  
  // 当月天数
  for (let i = 1; i <= totalDays; i++) {
    days.push({
      day: i,
      month: month,
      isOtherMonth: false,
      date: `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
    });
  }
  
  // 下月天数
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    days.push({
      day: i,
      month: month + 1,
      isOtherMonth: true
    });
  }
  
  return days;
}

/**
 * 获取某天的活动日志
 */
function getLogsByDate(dateStr) {
  return activityLogs.filter(log => {
    const logDate = log.createdAt.substring(0, 10);
    return logDate === dateStr;
  });
}

/**
 * 检查日期是否有活动
 */
function hasActivityOnDate(dateStr) {
  return activityLogs.some(log => {
    const logDate = log.createdAt.substring(0, 10);
    return logDate === dateStr;
  });
}

// ========================================
// 初始化
// ========================================

// 页面加载时从LocalStorage加载数据
document.addEventListener('DOMContentLoaded', function() {
  loadFromLocalStorage();
  
  // 添加toast动画样式
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
});
