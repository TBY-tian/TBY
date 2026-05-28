const questionsData = {
  trueFalse: [
    {
      id: 1,
      type: 'judge',
      question: '公安机关不会通过电话办案，更不会要求公民将资金转入所谓的"安全账户"。',
      isTrue: true,
      explanation: '正确。公安机关不会通过电话办案，更不会要求公民将资金转入所谓的"安全账户"。这是典型的冒充公检法诈骗手段。'
    },
    {
      id: 2,
      type: 'judge',
      question: '刷单本身就是违法行为，高额返利一定是诈骗。',
      isTrue: true,
      explanation: '正确。刷单本身就是违法行为，高额返利一定是诈骗。任何刷单兼职都不要参与，以免上当受骗。'
    },
    {
      id: 3,
      type: 'judge',
      question: '正规电商退款会原路返回，不会通过链接或二维码索取信息。',
      isTrue: true,
      explanation: '正确。正规电商退款会原路返回，不会通过链接或二维码索取信息。如有退款问题，应在官方APP中核实订单状态。'
    },
    {
      id: 4,
      type: 'judge',
      question: 'AI技术可以伪造语音和视频，不能仅凭语音或视频确认对方身份。',
      isTrue: true,
      explanation: '正确。AI技术可以伪造语音和视频，诈骗分子常利用此技术冒充熟人借钱。遇到视频借钱时，应通过其他渠道二次核实身份。'
    },
    {
      id: 5,
      type: 'judge',
      question: '年化收益率超过6%就要打问号，超过10%就要准备损失全部本金。',
      isTrue: true,
      explanation: '正确。任何承诺"稳赚不赔"、"高收益低风险"的投资都是诈骗的典型特征。正规投资收益不会脱离市场规律。'
    },
    {
      id: 6,
      type: 'judge',
      question: '正规中奖不需要交任何手续费，中奖诈骗利用贪便宜心理诱人上当。',
      isTrue: true,
      explanation: '正确。正规中奖不需要交任何手续费，遇到要求交手续费的中奖信息一定是诈骗，应立即挂断并举报。'
    },
    {
      id: 7,
      type: 'judge',
      question: '没有任何正规业务需要转账验资，要求转账验资的都是诈骗。',
      isTrue: true,
      explanation: '正确。诈骗分子常利用"对公账户"的正规假象实施诈骗。任何要求转账验资的都是违法行为，应立即拒绝。'
    },
    {
      id: 8,
      type: 'judge',
      question: '验证码是账户安全的最后防线，任何索要验证码的行为都是诈骗。',
      isTrue: true,
      explanation: '正确。验证码是账户安全的最后防线，任何索要验证码的行为都是诈骗。正规机构不会索要你的验证码。'
    },
    {
      id: 9,
      type: 'judge',
      question: '运营商不会通过短信链接进行实名认证。',
      isTrue: true,
      explanation: '正确。运营商不会通过短信链接进行实名认证，收到此类短信应通过官方APP或拨打官方客服电话核实。'
    },
    {
      id: 10,
      type: 'judge',
      question: '所谓的"内幕消息"都是诈骗陷阱，非法荐股本身就是违法行为。',
      isTrue: true,
      explanation: '正确。所谓的"内幕消息"、"稳赚不赔"都是诈骗陷阱，非法荐股本身就是违法行为，发现后应立即举报。'
    },
    {
      id: 11,
      type: 'judge',
      question: '医保账户不会通过电话冻结，也不需要提供银行卡信息解冻。',
      isTrue: true,
      explanation: '正确。医保账户不会通过电话冻结，也不需要提供银行卡信息解冻。如有疑问应拨打官方热线12333核实。'
    },
    {
      id: 12,
      type: 'judge',
      question: '低价商品要求先付定金是常见的诈骗手段。',
      isTrue: true,
      explanation: '正确。低价商品要求先付定金是常见的诈骗手段，应通过正规渠道购买商品，不要轻信陌生人的低价诱惑。'
    },
    {
      id: 13,
      type: 'judge',
      question: '如果发现自己可能遭遇了诈骗，应该第一时间拨打110报警。',
      isTrue: true,
      explanation: '正确。发现被骗后应立即报警，越早报警越有可能挽回损失。同时要保存好相关证据。'
    },
    {
      id: 14,
      type: 'judge',
      question: '96110是全国反诈热线，接到这个电话意味着你可能成为诈骗目标。',
      isTrue: true,
      explanation: '正确。96110是反电信网络诈骗专用号码，用于预警劝阻、咨询和举报。接到这个电话应立即停止与可疑人员的联系。'
    },
    {
      id: 15,
      type: 'judge',
      question: '出租出借银行账户是违法行为，可能被诈骗分子利用进行洗钱等犯罪活动。',
      isTrue: true,
      explanation: '正确。出租出借银行账户是违法行为，不仅会被诈骗分子利用进行洗钱等犯罪活动，本人也会承担法律责任。'
    },
    {
      id: 16,
      type: 'judge',
      question: '网恋对象推荐的赚钱方法几乎都是诈骗。',
      isTrue: true,
      explanation: '正确。杀猪盘诈骗就是通过社交平台建立感情后，推荐虚假投资平台诈骗。网恋需谨慎，涉及金钱往来更要加倍小心。'
    },
    {
      id: 17,
      type: 'judge',
      question: '保护好支付密码和验证码是防诈的基本原则，正规机构不会索要你的验证码。',
      isTrue: true,
      explanation: '正确。保护好支付密码和验证码是防诈的基本原则。任何以各种理由索要验证码的行为都是诈骗。'
    },
    {
      id: 18,
      type: 'judge',
      question: '被骗后越快报警越好，警方可以通过紧急止付机制冻结涉案账户。',
      isTrue: true,
      explanation: '正确。被骗后越快报警越好，警方可以通过紧急止付机制冻结涉案账户，有机会挽回损失。'
    },
    {
      id: 19,
      type: 'judge',
      question: '安装国家反诈中心APP可以有效识别和拦截诈骗电话、短信和APP。',
      isTrue: true,
      explanation: '正确。国家反诈中心APP具备来电预警、短信识别、APP检测等功能，可以有效帮助用户防范电信诈骗。'
    },
    {
      id: 20,
      type: 'judge',
      question: '即使不向对方转账，泄露个人信息、验证码等也可能导致财产损失。',
      isTrue: true,
      explanation: '正确。防范诈骗需要全方位警惕，不仅要防转账，还要保护好个人信息、验证码等敏感信息。'
    },
    {
      id: 21,
      type: 'judge',
      question: '在ATM机等涉及资金操作的场合，不要接受陌生人的帮助。',
      isTrue: true,
      explanation: '正确。在ATM机等涉及资金操作的场合，不要接受陌生人的帮助，谨防被调包或窃取密码。'
    },
    {
      id: 22,
      type: 'judge',
      question: '发现被骗后立即删除与骗子的聊天记录，以免影响判断。',
      isTrue: false,
      explanation: '错误。发现被骗后应保存好与骗子的聊天记录等证据，这些证据对于报警和案件侦破非常重要，不要轻易删除。'
    },
    {
      id: 23,
      type: 'judge',
      question: '只要在正规平台进行的交易就是安全的。',
      isTrue: false,
      explanation: '错误。即使在正规平台，也可能遇到骗子发布的虚假信息。交易时要仔细核实对方身份和商品信息，谨慎判断。'
    },
    {
      id: 24,
      type: 'judge',
      question: '朋友通过微信发来的借钱消息，可以直接转账。',
      isTrue: false,
      explanation: '错误。朋友的微信可能被盗，或者是被AI换脸技术冒充。应通过电话或其他方式独立核实后再决定是否转账。'
    },
    {
      id: 25,
      type: 'judge',
      question: '诈骗分子只能骗取受害人的钱财，不会骗取个人信息。',
      isTrue: false,
      explanation: '错误。诈骗分子不仅会骗取钱财，还会骗取个人信息用于其他违法犯罪活动，或将信息出售给其他诈骗团伙。'
    }
  ]
};

module.exports = questionsData;