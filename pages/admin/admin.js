const { API_BASE_URL } = require('../../utils/api.js');

const ADMIN_API = 'http://localhost:3000/api/admin';

function adminRequest(url, method, data = null) {
  return new Promise((resolve, reject) => {
    const token = wx.getStorageSync('adminToken');
    if (!token) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      reject('未登录');
      return;
    }

    wx.request({
      url: url,
      method: method,
      data: data,
      header: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      success: (res) => {
        if (res.data.success) {
          resolve(res.data.data);
        } else {
          wx.showToast({ title: res.data.message || '请求失败', icon: 'none' });
          reject(res.data.message);
        }
      },
      fail: (err) => {
        wx.showToast({ title: '网络请求失败', icon: 'none' });
        reject(err);
      }
    });
  });
}

Page({
  data: {
    stats: {
      totalUsers: 0,
      totalCases: 0,
      totalWarnings: 0,
      pendingReports: 0,
      todayUsers: 0,
      todayReports: 0
    }
  },

  onLoad: function() {
    this.checkAdminLogin();
  },

  onShow: function() {
    this.checkAdminLogin();
  },

  checkAdminLogin: function() {
    const adminToken = wx.getStorageSync('adminToken');
    if (adminToken) {
      this.loadDashboard();
    } else {
      this.adminLogin();
    }
  },

  adminLogin: function() {
    wx.showModal({
      title: '管理员登录',
      content: '请输入管理员密码',
      editable: true,
      placeholderText: '请输入密码',
      success: (res) => {
        if (res.confirm && res.content) {
          if (res.content === 'admin123') {
            wx.setStorageSync('adminToken', 'admin_token_' + Date.now());
            wx.showToast({ title: '登录成功', icon: 'success' });
            this.loadDashboard();
          } else {
            wx.showToast({ title: '密码错误', icon: 'none' });
          }
        }
      }
    });
  },

  async loadDashboard() {
    try {
      const stats = await adminRequest(ADMIN_API + '/dashboard', 'GET');
      this.setData({ stats });
    } catch (e) {
      console.log('加载仪表盘失败', e);
    }
  },

  goToUsers: function() {
    wx.navigateTo({
      url: '/pages/admin/users/users'
    });
  },

  goToReports: function() {
    wx.navigateTo({
      url: '/pages/admin/reports/reports'
    });
  },

  goToCases: function() {
    wx.navigateTo({
      url: '/pages/admin/cases/cases'
    });
  },

  goToWarnings: function() {
    wx.navigateTo({
      url: '/pages/admin/warnings/warnings'
    });
  },

  goToQuestions: function() {
    wx.navigateTo({
      url: '/pages/admin/questions/questions'
    });
  },

  goToKeywords: function() {
    wx.navigateTo({
      url: '/pages/admin/keywords/keywords'
    });
  },

  goToStats: function() {
    wx.navigateTo({
      url: '/pages/admin/stats/stats'
    });
  },

  runCrawler: function() {
    wx.showModal({
      title: '执行爬虫',
      content: '确定要立即执行爬虫任务吗？',
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '执行中...' });
          try {
            await adminRequest('http://localhost:3000/crawler/run', 'GET');
            wx.hideLoading();
            wx.showToast({ title: '爬虫执行成功', icon: 'success' });
            this.loadDashboard();
          } catch (e) {
            wx.hideLoading();
            wx.showToast({ title: '爬虫执行失败', icon: 'none' });
          }
        }
      }
    });
  }
});