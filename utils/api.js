const API_BASE_URL = 'https://3ed08375.r3.cpolar.cn/api';

function request(url, method, data = null, needAuth = false) {
  return new Promise((resolve, reject) => {
    const header = {
      'Content-Type': 'application/json'
    };

    if (needAuth) {
      const token = wx.getStorageSync('token');
      if (token) {
        header['Authorization'] = 'Bearer ' + token;
      }
    }

    wx.request({
      url: API_BASE_URL + url,
      method: method,
      data: data,
      header: header,
      success: (res) => {
        if (res.data.success) {
          resolve(res.data.data);
        } else {
          wx.showToast({
            title: res.data.message || '请求失败',
            icon: 'none'
          });
          reject(res.data.message);
        }
      },
      fail: (err) => {
        wx.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
        reject(err);
      }
    });
  });
}

const userAPI = {
  login: (code) => request('/user/login', 'POST', { code }),
  getProfile: () => request('/user/profile', 'GET', null, true),
  updateProfile: (data) => request('/user/profile', 'PUT', data, true),
  getStats: () => request('/user/stats', 'GET', null, true),
  getLearningRecord: (type) => request('/user/learning-record', 'GET', { type }, true),
  addLearningRecord: (data) => request('/user/learning-record', 'POST', data)
};

const caseAPI = {
  getCategories: () => request('/cases/categories', 'GET'),
  getList: (params) => request('/cases/list', 'GET', params),
  getDetail: (id) => request('/cases/detail/' + id, 'GET'),
  getHot: () => request('/cases/hot', 'GET'),
  recordView: (id) => request('/cases/view/' + id, 'POST', null)
};

const warningAPI = {
  getList: (params) => request('/warnings/list', 'GET', params),
  getDetail: (id) => request('/warnings/detail/' + id, 'GET'),
  getLatest: () => request('/warnings/latest', 'GET')
};

const testAPI = {
  getQuestions: (params) => request('/test/questions', 'GET', params),
  submitAnswer: (data) => request('/test/submit', 'POST', data),
  saveRecord: (data) => request('/test/record', 'POST', data),
  getHistory: () => request('/test/history', 'GET', null, true),
  getReview: (id) => request('/test/review/' + id, 'GET', null, true)
};

const reportAPI = {
  submit: (data) => request('/report/submit', 'POST', data, true),
  getList: (params) => request('/report/list', 'GET', params, true),
  getDetail: (id) => request('/report/detail/' + id, 'GET', null, true)
};

const riskAPI = {
  check: (data) => request('/risk/check', 'POST', data),
  getKeywords: (type) => request('/risk/keywords', 'GET', { type })
};

module.exports = {
  API_BASE_URL,
  userAPI,
  caseAPI,
  warningAPI,
  testAPI,
  reportAPI,
  riskAPI
};