const fraudData = require('../../data/fraud.js');
const { caseAPI, userAPI } = require('../../utils/api.js');

Page({
  data: {
    categories: [],
    currentCategory: '',
    currentCategoryDesc: '',
    currentCases: [],
    currentTactics: []
  },

  onLoad: function() {
    this.loadCategories();
  },

  async loadCategories() {
    try {
      const categories = await caseAPI.getCategories();
      if (categories && categories.length > 0) {
        const localCategories = fraudData.categories;
        const mergedCategories = categories.map(cat => {
          const localCat = localCategories.find(lc => lc.name === cat.name);
          return {
            ...cat,
            cases: localCat ? localCat.cases : [],
            commonTactics: localCat ? localCat.commonTactics : []
          };
        });
        
        if (mergedCategories.length === 0) {
          mergedCategories.push(...localCategories);
        }
        
        this.setData({
          categories: mergedCategories,
          currentCategory: mergedCategories[0].id,
          currentCategoryDesc: mergedCategories[0].description,
          currentCases: mergedCategories[0].cases || [],
          currentTactics: mergedCategories[0].commonTactics || []
        });
        return;
      }
    } catch (e) {
      console.log('从后端获取分类失败，使用本地数据');
    }
    
    this.loadLocalData();
  },

  loadLocalData: function() {
    const categories = fraudData.categories;
    this.setData({
      categories: categories,
      currentCategory: categories[0].id,
      currentCategoryDesc: categories[0].description,
      currentCases: categories[0].cases,
      currentTactics: categories[0].commonTactics || []
    });
  },

  async selectCategory(e) {
    const categoryId = e.currentTarget.dataset.id;
    const category = this.data.categories.find(item => item.id === categoryId);
    
    this.setData({
      currentCategory: categoryId,
      currentCategoryDesc: category.description,
      currentCases: category.cases || [],
      currentTactics: category.commonTactics || []
    });

    try {
      await caseAPI.getList({ categoryId: categoryId });
    } catch (e) {
      console.log('获取案例列表失败');
    }
  },

  async viewCase(e) {
    const caseId = e.currentTarget.dataset.id;
    try {
      await caseAPI.recordView(caseId);
      await userAPI.addLearningRecord({
        caseId: caseId,
        action: 'view'
      });
    } catch (e) {
      console.log('记录浏览失败');
    }
  },

  getIcon: function(icon) {
    const iconMap = {
      'customer': '👤',
      'brush': '📝',
      'police': '👮',
      'loan': '💰',
      'investment': '📈',
      'express': '📦',
      'friend': '👥',
      'tech': '💻'
    };
    return iconMap[icon] || '📋';
  },

  downloadApp: function() {
    wx.showModal({
      title: '国家反诈中心APP',
      content: '请在手机应用商店搜索"国家反诈中心"进行下载安装。',
      showCancel: false,
      confirmText: '知道了',
      confirmColor: '#1a73e8'
    });
  },

  open12321: function() {
    wx.setClipboardData({
      data: 'https://www.12321.cn/',
      success: function() {
        wx.showToast({
          title: '链接已复制',
          icon: 'success'
        });
      }
    });
  },

  openCrimeReport: function() {
    wx.setClipboardData({
      data: 'https://www.cyberpolice.cn/',
      success: function() {
        wx.showToast({
          title: '链接已复制',
          icon: 'success'
        });
      }
    });
  }
});