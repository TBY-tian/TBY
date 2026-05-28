const fraudData = require('../../data/fraud.js');
const { warningAPI, userAPI, caseAPI } = require('../../utils/api.js');

Page({
  data: {
    warnings: [],
    showModal: false,
    showDetail: false,
    currentWarning: {},
    userInfo: null,
    hotCases: []
  },

  onLoad: function() {
    this.initApp();
  },

  onShow: function() {
    this.checkUserLogin();
  },

  initApp: function() {
    this.setData({
      warnings: fraudData.warnings
    });
    this.loadLatestWarnings();
    this.loadHotCases();
  },

  checkUserLogin: function() {
    const token = wx.getStorageSync('token');
    if (token) {
      this.getUserProfile();
    }
  },

  async getUserProfile() {
    try {
      const userInfo = await userAPI.getProfile();
      this.setData({ userInfo });
    } catch (e) {
      console.log('获取用户信息失败', e);
    }
  },

  async loadLatestWarnings() {
    try {
      const warnings = await warningAPI.getLatest();
      if (warnings && warnings.length > 0) {
        // 转换字段名称
        const formattedWarnings = warnings.map(item => ({
          id: item.id,
          title: item.title,
          content: item.content,
          detail: item.detail || '',
          level: item.level,
          date: this.formatDate(item.publish_time),
          sourceUrl: item.url || ''
        }));
        this.setData({ warnings: formattedWarnings });
      }
    } catch (e) {
      console.log('加载预警信息失败，使用本地数据');
      this.setData({ warnings: fraudData.warnings });
    }
  },

  formatDate: function(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hour}:${minute}`;
  },

  async loadHotCases() {
    try {
      const hotCases = await caseAPI.getHot();
      if (hotCases && hotCases.length > 0) {
        this.setData({ hotCases });
      }
    } catch (e) {
      console.log('加载热门案例失败');
    }
  },

  goToNews: function() {
    wx.switchTab({
      url: '/pages/news/news'
    });
  },

  goToCheck: function() {
    wx.switchTab({
      url: '/pages/check/check'
    });
  },

  goToTest: function() {
    wx.switchTab({
      url: '/pages/test/test'
    });
  },

  goToReport: function() {
    wx.switchTab({
      url: '/pages/report/report'
    });
  },

  showWarningDetail: function(e) {
    const warningId = parseInt(e.currentTarget.dataset.id);
    const warning = this.data.warnings.find(item => item.id === warningId);
    
    if (warning) {
      this.setData({
        showModal: true,
        showDetail: false,
        currentWarning: warning
      });
    }
  },

  toggleDetail: function() {
    this.setData({
      showDetail: !this.data.showDetail
    });
  },

  hideModal: function() {
    this.setData({
      showModal: false,
      currentWarning: {}
    });
  },

  stopPropagation: function() {
  },

  openUrl: function(e) {
    const url = e.currentTarget.dataset.url;
    wx.setClipboardData({
      data: url,
      success: function() {
        wx.showToast({
          title: '链接已复制',
          icon: 'success'
        });
      }
    });
  },

  onShareAppMessage: function() {
    return {
      title: '预防电信诈骗 - 守护你的钱袋子',
      path: '/pages/index/index',
      imageUrl: '/images/share.png'
    };
  }
});