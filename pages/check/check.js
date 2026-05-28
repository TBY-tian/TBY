const fraudData = require('../../data/fraud.js');
const { riskAPI } = require('../../utils/api.js');

Page({
  data: {
    currentTab: 'number',
    inputPlaceholder: '请输入要检测的电话号码',
    inputValue: '',
    showResult: false,
    resultLevel: '',
    resultIcon: '',
    resultStatus: '',
    resultMessage: '',
    matchedKeywords: [],
    tips: [],
    emergencyNumbers: ['110', '119', '120', '122', '114', '12345', '96110', '1100'],
    safePrefixes: ['130', '131', '132', '133', '134', '135', '136', '137', '138', '139', 
                  '150', '151', '152', '153', '155', '156', '157', '158', '159', 
                  '180', '181', '182', '183', '184', '185', '186', '187', '188', '189',
                  '172', '176', '177', '178', '198', '199'],
    virtualPrefixes: ['170', '171', '162', '165', '167', '173', '175'],
    suspiciousPrefixes: ['95', '96', '400', '800'],
    countryCodes: {
      '+86': '中国',
      '+1': '美国/加拿大',
      '+852': '香港',
      '+886': '台湾',
      '+65': '新加坡',
      '+81': '日本',
      '+82': '韩国',
      '+61': '澳大利亚',
      '+44': '英国',
      '+33': '法国',
      '+49': '德国',
      '+60': '马来西亚',
      '+62': '印度尼西亚',
      '+853': '澳门',
      '+63': '菲律宾',
      '+880': '孟加拉国',
      '+91': '印度',
      '+66': '泰国'
    }
  },

  onLoad: function() {
    this.setData({
      dangerKeywords: fraudData.riskKeywords.danger,
      warningKeywords: fraudData.riskKeywords.warning
    });
    this.loadKeywords();
  },

  async loadKeywords() {
    try {
      const keywords = await riskAPI.getKeywords();
      if (keywords && keywords.length > 0) {
        const danger = keywords.filter(k => k.type === 'danger').map(k => k.keyword);
        const warning = keywords.filter(k => k.type === 'warning').map(k => k.keyword);
        this.setData({
          dangerKeywords: danger.length > 0 ? danger : fraudData.riskKeywords.danger,
          warningKeywords: warning.length > 0 ? warning : fraudData.riskKeywords.warning
        });
      }
    } catch (e) {
      console.log('加载关键词失败，使用本地数据');
    }
  },

  switchTab: function(e) {
    const tab = e.currentTarget.dataset.tab;
    let placeholder = '';
    
    switch(tab) {
      case 'number':
        placeholder = '请输入要检测的电话号码';
        break;
      case 'link':
        placeholder = '请输入要检测的网址链接';
        break;
      case 'text':
        placeholder = '请输入可疑的话术内容';
        break;
    }
    
    this.setData({
      currentTab: tab,
      inputPlaceholder: placeholder,
      inputValue: '',
      showResult: false
    });
  },

  onInput: function(e) {
    this.setData({
      inputValue: e.detail.value,
      showResult: false
    });
  },

  async doCheck() {
    const input = this.data.inputValue.trim();
    
    if (!input) {
      wx.showToast({
        title: '请输入内容',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({ title: '检测中...' });

    try {
      let apiType = this.data.currentTab;
      if (apiType === 'number') apiType = 'phone';
      
      const result = await riskAPI.check({
        type: apiType,
        content: input
      });

      wx.hideLoading();

      let level = result.level;
      if (level === 'danger') level = 'high';
      if (level === 'warning') level = 'medium';
      
      let keywords = result.matchedKeywords || [];
      if (keywords.length > 0 && typeof keywords[0] === 'object') {
        keywords = keywords.map(k => k.keyword || k);
      }
      
      this.setData({
        showResult: true,
        resultLevel: level,
        resultIcon: level === 'high' ? '🚨' : level === 'medium' ? '⚠️' : '✅',
        resultStatus: level === 'high' ? '高风险' : level === 'medium' ? '中等风险' : '低风险',
        resultMessage: result.suggestion,
        matchedKeywords: keywords,
        tips: this.getTipsByLevel(level)
      });
    } catch (e) {
      wx.hideLoading();
      this.localCheck();
    }
  },
  
  checkText: function(text) {
    const lowerText = text.toLowerCase();
    let level = 'low';
    let matchedKeywords = [];
    let tips = [
      '保持冷静，不要被对方话术影响',
      '不要向任何人透露验证码',
      '如有疑问拨打96110咨询'
    ];

    if (!text) {
      return this.getResult('low', [], '✅', '低风险', '请输入话术内容', tips);
    }

    const dangerWords = this.data.dangerKeywords || fraudData.riskKeywords.danger;
    const warningWords = this.data.warningKeywords || fraudData.riskKeywords.warning;

    let dangerCount = 0;
    let warningCount = 0;

    for (const word of dangerWords) {
      if (lowerText.includes(word.toLowerCase())) {
        matchedKeywords.push(word);
        dangerCount++;
      }
    }

    for (const word of warningWords) {
      if (lowerText.includes(word.toLowerCase())) {
        matchedKeywords.push(word);
        warningCount++;
      }
    }

    const criticalKeywords = ['安全账户', '清查资金', '资金核查', '转账汇款', '验证码', '共享屏幕', '远程操控', '远程控制', '涉嫌违法', '涉嫌犯罪', '通缉令', '逮捕令', '传票', '配合调查', '刷单', '返利', '解冻资金', '验资', '保证金'];
    const hasCritical = criticalKeywords.some(keyword => lowerText.includes(keyword.toLowerCase()));

    if (hasCritical || dangerCount >= 1) {
      level = 'high';
    } else if (warningCount >= 2) {
      level = 'medium';
    } else if (warningCount >= 1) {
      level = 'medium';
    }

    let result = this.getResult(level, matchedKeywords);
    
    if (level === 'high') {
      result.tips = [
        '立即终止通话或聊天',
        '不要按照对方要求进行任何操作',
        '保存聊天记录并拨打110报警'
      ];
    } else if (level === 'medium') {
      result.tips = [
        '不要轻信对方身份',
        '不要向对方透露任何个人信息',
        '核实情况后再做判断'
      ];
    }
    
    return result;
  },

  localCheck: function() {
    let result = { level: 'low', matchedKeywords: [] };

    switch(this.data.currentTab) {
      case 'number':
        result = this.checkNumber(this.data.inputValue);
        break;
      case 'link':
        result = this.checkLink(this.data.inputValue);
        break;
      case 'text':
        result = this.checkText(this.data.inputValue);
        break;
    }

    this.setData({
      showResult: true,
      resultLevel: result.level,
      resultIcon: result.icon,
      resultStatus: result.status,
      resultMessage: result.message,
      matchedKeywords: result.matchedKeywords,
      tips: result.tips
    });
  },

  getTipsByLevel: function(level) {
    if (level === 'high') {
      return [
        '立即终止通话或聊天',
        '不要按照对方要求进行任何操作',
        '保存聊天记录并拨打110报警'
      ];
    } else if (level === 'warning') {
      return [
        '不要轻信对方身份',
        '不要向对方透露任何个人信息',
        '核实情况后再做判断'
      ];
    }
    return [
      '保持冷静，不要被对方话术影响',
      '不要向任何人透露验证码',
      '如有疑问拨打96110咨询'
    ];
  },

  checkNumber: function(number) {
    const cleanNumber = number.replace(/[\s\-()]/g, '');
    let level = 'low';
    let matchedKeywords = [];
    let tips = [
      '不要向陌生人转账汇款',
      '不要透露个人银行信息和验证码',
      '遇到可疑情况及时拨打110报警'
    ];

    if (!cleanNumber) {
      return this.getResult('low', [], '✅', '低风险', '请输入有效的电话号码', tips);
    }

    if (this.data.emergencyNumbers.includes(cleanNumber)) {
      level = 'low';
      matchedKeywords.push('紧急呼叫号码');
      return this.getResult(level, matchedKeywords, '✅', '安全', '这是官方紧急呼叫号码，请放心拨打', [
        '这是官方紧急呼叫号码，可放心使用',
        '建议在紧急情况下拨打',
        '注意区分真实报警电话与冒充来电'
      ]);
    }

    if (/^(\+?86)?1[3-9]\d{9}$/.test(cleanNumber)) {
      const pureNumber = cleanNumber.replace(/^(\+?86)?/, '');
      const prefix = pureNumber.substring(0, 3);
      
      if (this.data.suspiciousPrefixes.some(p => pureNumber.startsWith(p))) {
        level = 'medium';
        matchedKeywords.push('服务号码');
      } else if (this.data.virtualPrefixes.includes(prefix)) {
        level = 'medium';
        matchedKeywords.push('虚拟运营商号码');
      } else if (this.data.safePrefixes.includes(prefix)) {
        level = 'low';
      } else {
        level = 'medium';
        matchedKeywords.push('未知号段');
      }
    } else if (/^\+\d{2,3}\d{8,15}$/.test(cleanNumber)) {
      const countryCode = cleanNumber.match(/^\+\d{2,3}/)[0];
      const countryName = this.data.countryCodes[countryCode] || '境外';
      
      if (countryCode === '+86') {
        level = 'low';
      } else {
        level = 'medium';
        matchedKeywords.push(`${countryName}号码`);
        
        if (['+63', '+880', '+91', '+62', '+60'].includes(countryCode)) {
          level = 'high';
          matchedKeywords.push('高风险地区号码');
        }
      }
    } else if (/^\d{7,8}$/.test(cleanNumber)) {
      level = 'low';
      matchedKeywords.push('固定电话');
    } else if (/^\d{3,4}-\d{7,8}$/.test(cleanNumber)) {
      level = 'low';
      matchedKeywords.push('固定电话');
    } else {
      level = 'medium';
      matchedKeywords.push('号码格式异常');
    }

    let result = this.getResult(level, matchedKeywords);
    
    if (level === 'high') {
      result.tips = [
        '立即挂断电话，不要与对方交流',
        '不要向任何人转账或提供个人信息',
        '可拨打96110进行咨询举报'
      ];
    } else if (level === 'medium') {
      result.tips = [
        '保持警惕，不要轻易相信对方',
        '不要向对方透露任何敏感信息',
        '必要时可挂断后通过官方渠道核实'
      ];
    }
    
    return result;
  },

  checkLink: function(link) {
    let level = 'low';
    let matchedKeywords = [];
    let tips = [
      '不要点击未知来源的链接',
      '不要在陌生网站输入个人信息',
      '访问网站前核实网址真实性'
    ];

    if (!link) {
      return this.getResult('low', [], '✅', '低风险', '请输入有效的链接', tips);
    }

    let url = link.toLowerCase();
    
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'http://' + url;
    }

    try {
      const urlObj = this.parseUrl(url);
      
      if (!urlObj.hostname) {
        level = 'medium';
        matchedKeywords.push('无效链接格式');
      } else {
        const hostname = urlObj.hostname;
        
        if (hostname.includes('gov.cn')) {
          level = 'low';
          matchedKeywords.push('政府官方网站');
        } else if (hostname.includes('.gov')) {
          level = 'low';
          matchedKeywords.push('政府网站');
        } else if (hostname.match(/(baidu|qq|weixin|wechat|taobao|jd|alipay|163|sina)\.com/)) {
          level = 'low';
          matchedKeywords.push('知名网站');
        } else if (hostname.includes('bank') && !hostname.includes('gov')) {
          level = 'high';
          matchedKeywords.push('仿冒银行网站');
        } else if (hostname.includes('110') || hostname.includes('police') && !hostname.includes('gov')) {
          level = 'high';
          matchedKeywords.push('仿冒公安网站');
        } else if (hostname.includes('pay') || hostname.includes('payment') || hostname.includes('wallet')) {
          level = 'medium';
          matchedKeywords.push('支付相关网站');
        } else if (hostname.includes('login') || hostname.includes('account') || hostname.includes('verify')) {
          level = 'medium';
          matchedKeywords.push('登录验证页面');
        } else if (['tinyurl.com', 'bit.ly', 't.cn', 'url.cn', 'weibo.cn', 'douyin.com'].some(d => hostname.includes(d))) {
          level = 'medium';
          matchedKeywords.push('短链接');
        } else if (hostname.match(/^\d+\.\d+\.\d+\.\d+$/)) {
          level = 'high';
          matchedKeywords.push('IP地址形式');
        } else if (hostname.includes('vip') || hostname.includes('vip.') || hostname.includes('admin')) {
          level = 'medium';
          matchedKeywords.push('可疑域名');
        }
        
        if (urlObj.pathname && (urlObj.pathname.includes('login') || 
            urlObj.pathname.includes('register') || 
            urlObj.pathname.includes('verify') ||
            urlObj.pathname.includes('captcha'))) {
          level = Math.max(level === 'low' ? 1 : level === 'medium' ? 2 : level === 'high' ? 3 : 1, 
                          level === 'low' ? 2 : level === 'medium' ? 2 : 3);
          if (level === 'low') level = 'medium';
          if (!matchedKeywords.includes('登录验证路径')) {
            matchedKeywords.push('登录验证路径');
          }
        }
      }
    } catch(e) {
      level = 'medium';
      matchedKeywords.push('链接解析异常');
    }

    let result = this.getResult(level, matchedKeywords);
    
    if (level === 'high') {
      result.tips = [
        '立即关闭页面，不要继续操作',
        '不要输入任何账号密码信息',
        '如有财产损失立即报警'
      ];
    } else if (level === 'medium') {
      result.tips = [
        '不要在页面中输入任何个人信息',
        '核实链接来源后再操作',
        '建议通过官方渠道访问'
      ];
    }
    
    return result;
  },

  checkText: function(text) {
    const lowerText = text.toLowerCase();
    let level = 'low';
    let matchedKeywords = [];
    let tips = [
      '保持冷静，不要被对方话术影响',
      '不要向任何人透露验证码',
      '如有疑问拨打96110咨询'
    ];

    if (!text) {
      return this.getResult('low', [], '✅', '低风险', '请输入话术内容', tips);
    }

    const dangerWords = this.data.dangerKeywords;
    const warningWords = this.data.warningKeywords;

    let dangerCount = 0;
    let warningCount = 0;
    let highRiskKeywords = [];

    for (const word of dangerWords) {
      if (lowerText.includes(word)) {
        matchedKeywords.push(word);
        dangerCount++;
        highRiskKeywords.push(word);
      }
    }

    for (const word of warningWords) {
      if (lowerText.includes(word)) {
        matchedKeywords.push(word);
        warningCount++;
      }
    }

    const criticalKeywords = ['安全账户', '清查资金', '资金核查', '转账汇款', '验证码', '共享屏幕', '远程操控', '远程控制', '涉嫌违法', '涉嫌犯罪', '通缉令', '逮捕令', '传票', '配合调查'];
    const hasCritical = criticalKeywords.some(keyword => lowerText.includes(keyword));

    if (hasCritical || dangerCount >= 2) {
      level = 'high';
    } else if (dangerCount >= 1 || warningCount >= 2) {
      level = 'medium';
    } else if (warningCount >= 1) {
      level = 'low';
    }

    let result = this.getResult(level, matchedKeywords);
    
    if (level === 'high') {
      result.tips = [
        '立即终止通话或聊天',
        '不要按照对方要求进行任何操作',
        '保存聊天记录并拨打110报警'
      ];
    } else if (level === 'medium') {
      result.tips = [
        '不要轻信对方身份',
        '不要向对方透露任何个人信息',
        '核实情况后再做判断'
      ];
    }
    
    return result;
  },

  getResult: function(level, matchedKeywords, icon, status, message, tips) {
    if (!icon) {
      switch(level) {
        case 'high':
          icon = '🚨';
          status = '高风险';
          message = '检测到高风险特征，请注意防范！';
          break;
        case 'medium':
          icon = '⚠️';
          status = '中等风险';
          message = '检测到可疑特征，请保持警惕！';
          break;
        default:
          icon = '✅';
          status = '低风险';
          message = '暂未发现明显风险特征，但仍需保持警惕。';
          break;
      }
    }

    return { level, matchedKeywords, icon, status, message, tips: tips || [] };
  },

  parseUrl: function(url) {
    try {
      const match = url.match(/^(https?:\/\/)?([^\/\?:]+)([^\?]*)/);
      return {
        protocol: match[1] || '',
        hostname: match[2] || '',
        pathname: match[3] || '',
        search: ''
      };
    } catch(e) {
      return { protocol: '', hostname: '', pathname: '', search: '' };
    }
  }
});