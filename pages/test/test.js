const questionsData = require('../../data/questions.js');
const { testAPI, userAPI } = require('../../utils/api.js');

Page({
  data: {
    allQuestions: [],
    currentIndex: 0,
    currentQuestion: {},
    totalQuestions: 0,
    selectedAnswer: '',
    score: 0,
    answers: [],
    showResult: false,
    showFinish: false,
    showExplanation: false,
    resultLevel: '',
    resultLevelText: '',
    resultMessage: '',
    currentCorrect: false,
    currentExplanation: '',
    correctAnswer: '',
    startTime: null,
    answersData: []
  },

  onLoad: function() {
    this.initQuestions();
  },

  async initQuestions() {
    try {
      const questions = await testAPI.getQuestions({ count: 20, type: 'judge' });
      if (questions && questions.length > 0) {
        const formattedQuestions = questions.map(q => ({
          ...q,
          isTrue: q.is_true !== undefined ? q.is_true : q.isTrue
        }));
        this.setData({
          allQuestions: formattedQuestions,
          currentIndex: 0,
          currentQuestion: formattedQuestions[0],
          totalQuestions: formattedQuestions.length,
          selectedAnswer: '',
          score: 0,
          answers: [],
          answersData: [],
          showResult: false,
          showFinish: false,
          showExplanation: false,
          startTime: Date.now()
        });
        return;
      }
    } catch (e) {
      console.log('从后端获取题目失败，使用本地数据');
    }
    
    this.loadLocalQuestions();
  },

  loadLocalQuestions: function() {
    const allQuestions = questionsData.trueFalse;
    const shuffled = this.shuffleArray([...allQuestions]).slice(0, 20);
    
    shuffled.forEach((q, index) => {
      q.id = index + 1;
    });

    this.setData({
      allQuestions: shuffled,
      currentIndex: 0,
      currentQuestion: shuffled[0],
      totalQuestions: shuffled.length,
      selectedAnswer: '',
      score: 0,
      answers: [],
      answersData: [],
      showResult: false,
      showFinish: false,
      showExplanation: false,
      startTime: Date.now()
    });
  },

  shuffleArray: function(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  },

  selectOption: function(e) {
    if (this.data.showExplanation) {
      return;
    }
    
    const label = e.currentTarget.dataset.label;
    this.setData({
      selectedAnswer: label
    });
  },

  async submitAnswer() {
    const { currentIndex, totalQuestions, selectedAnswer, currentQuestion, allQuestions } = this.data;
    
    if (!selectedAnswer) {
      wx.showToast({
        title: '请选择答案',
        icon: 'none'
      });
      return;
    }

    let correct = false;
    let userAnswer = selectedAnswer === 'true' ? '正确' : '错误';
    
    const isTrueValue = currentQuestion.isTrue === true || currentQuestion.isTrue === 1;
    let correctAnswer = isTrueValue ? '正确' : '错误';

    correct = (selectedAnswer === 'true') === isTrueValue;

    const newAnswer = {
      id: currentIndex + 1,
      question: currentQuestion.question,
      userAnswer: userAnswer,
      correct: correct,
      correctAnswer: correctAnswer,
      explanation: currentQuestion.explanation
    };

    const answers = [...this.data.answers, newAnswer];
    const score = this.data.score + (correct ? 10 : 0);
    const answersData = [...this.data.answersData, {
      questionId: currentQuestion.id,
      userAnswer: selectedAnswer,
      correct: correct
    }];

    this.setData({
      answers: answers,
      answersData: answersData,
      score: score,
      currentCorrect: correct,
      currentExplanation: currentQuestion.explanation,
      correctAnswer: correctAnswer,
      showExplanation: true
    });

    try {
      await testAPI.submitAnswer({
        questionId: currentQuestion.id,
        userAnswer: selectedAnswer,
        timeSpent: 0
      });
    } catch (e) {
      console.log('提交答案失败', e);
    }
  },

  nextQuestion: function() {
    const { currentIndex, totalQuestions, allQuestions } = this.data;

    if (currentIndex < totalQuestions - 1) {
      const nextIndex = currentIndex + 1;
      this.setData({
        currentIndex: nextIndex,
        currentQuestion: allQuestions[nextIndex],
        selectedAnswer: '',
        showExplanation: false,
        currentCorrect: false,
        currentExplanation: '',
        correctAnswer: ''
      });
    } else {
      this.setData({
        showFinish: true
      });

      setTimeout(() => {
        this.showTestResult();
      }, 1500);
    }
  },

  async showTestResult() {
    const { score, totalQuestions, answersData, startTime } = this.data;
    const percentage = (score / (totalQuestions * 10)) * 100;
    const duration = Math.round((Date.now() - startTime) / 1000);
    const correctCount = Math.round(score / 10);

    let resultLevel = '';
    let resultLevelText = '';
    let resultMessage = '';

    if (percentage >= 90) {
      resultLevel = 'excellent';
      resultLevelText = '反诈达人';
      resultMessage = '恭喜您！您的防骗意识非常强，已经掌握了基本的防诈知识，请继续保持警惕！';
    } else if (percentage >= 70) {
      resultLevel = 'good';
      resultLevelText = '防骗能手';
      resultMessage = '您的防骗意识不错！但还有一些地方需要加强，建议您再学习一下骗局百科。';
    } else if (percentage >= 50) {
      resultLevel = 'pass';
      resultLevelText = '防骗新手';
      resultMessage = '您的防骗意识一般，建议您多学习反诈知识，提高警惕，避免上当受骗。';
    } else {
      resultLevel = 'fail';
      resultLevelText = '需要加强';
      resultMessage = '您的防骗意识较弱，建议您认真学习骗局百科和诈骗案例，提高防骗能力！';
    }

    this.setData({
      showFinish: false,
      showResult: true,
      resultLevel: resultLevel,
      resultLevelText: resultLevelText,
      resultMessage: resultMessage
    });

    try {
      await testAPI.saveRecord({
        totalQuestions: totalQuestions,
        correctCount: correctCount,
        score: score,
        duration: duration,
        answers: answersData
      });
    } catch (e) {
      console.log('保存测试记录失败', e);
    }

    try {
      await userAPI.addLearningRecord({
        action: 'finish',
        categoryId: 0
      });
    } catch (e) {
      console.log('添加学习记录失败', e);
    }
  },

  restartTest: function() {
    this.initQuestions();
  }
});