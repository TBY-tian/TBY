const { reportAPI } = require('../../utils/api.js');

Page({
  data: {
    reportHistory: []
  },

  onLoad: function() {
    this.loadReportHistory();
  },

  onShow: function() {
    this.loadReportHistory();
  },

  async loadReportHistory() {
    try {
      const history = await reportAPI.getList({});
      if (history) {
        this.setData({ reportHistory: history });
      }
    } catch (e) {
      console.log('获取举报历史失败');
    }
  },

  callPolice: function() {
    wx.showModal({
      title: '提示',
      content: '即将拨打110报警电话，是否继续？',
      success: function(res) {
        if (res.confirm) {
          wx.makePhoneCall({
            phoneNumber: '110',
            fail: function() {
              wx.showToast({
                title: '拨打电话失败',
                icon: 'none'
              });
            }
          });
        }
      }
    });
  },

  call96110: function() {
    wx.showModal({
      title: '提示',
      content: '即将拨打全国反诈热线96110，是否继续？',
      success: function(res) {
        if (res.confirm) {
          wx.makePhoneCall({
            phoneNumber: '96110',
            fail: function() {
              wx.showToast({
                title: '拨打电话失败',
                icon: 'none'
              });
            }
          });
        }
      }
    });
  },

  downloadApp: function() {
    wx.showModal({
      title: '国家反诈中心APP',
      content: '请在手机应用商店搜索"国家反诈中心"进行下载安装。该APP由公安部推出，提供来电预警、诈骗举报、身份验真等功能，是您的反诈好帮手！',
      showCancel: false,
      confirmText: '知道了',
      confirmColor: '#1a73e8'
    });
  },

  open12321: function() {
    this.copyLink('https://www.12321.cn/', '12321举报中心');
  },

  openCrimeReport: function() {
    this.copyLink('https://www.cyberpolice.cn/', '网络违法犯罪举报网站');
  },

  copyLink: function(url, name) {
    wx.setClipboardData({
      data: url,
      success: function() {
        wx.showModal({
          title: name,
          content: '链接已复制到剪贴板，请在浏览器中粘贴访问。\n\n网址：' + url,
          showCancel: false,
          confirmText: '知道了',
          confirmColor: '#1a73e8'
        });
      },
      fail: function() {
        wx.showModal({
          title: name,
          content: '请在浏览器中访问：\n' + url,
          showCancel: false,
          confirmText: '知道了',
          confirmColor: '#1a73e8'
        });
      }
    });
  },

  submitReport: function(e) {
    const formData = e.detail.value;
    
    if (!formData.type) {
      wx.showToast({ title: '请选择举报类型', icon: 'none' });
      return;
    }
    
    if (!formData.content.trim()) {
      wx.showToast({ title: '请输入举报内容', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '提交中...' });
    
    reportAPI.submit({
      type: formData.type,
      content: formData.content,
      detail: formData.detail || '',
      contact: formData.contact || ''
    }).then(res => {
      wx.hideLoading();
      wx.showToast({ title: '举报提交成功', icon: 'success' });
      this.loadReportHistory();
    }).catch(err => {
      wx.hideLoading();
      wx.showToast({ title: '提交失败，请重试', icon: 'none' });
    });
  }
});