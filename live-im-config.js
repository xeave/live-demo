window.LIVE_IM_CONFIG = (function () {
  var defaultRoomId = 'orchard';

  var baseConfig = {
    SDKAppID: 1600138526,
    onlineCountPollMs: 10000,
    roles: {
      anchor: {
        userID: 'anchor_test_001',
        userSig: 'eJyrVgrxCdYrSy1SslIy0jNQ0gHzM1NS80oy0zLBwol5yRn5RfElqcUl8QYGhlAlxSnZiQUFmSlKVoZmQFFjC1MjM4hMakVBZlEqUNzU1NTIwMAAIlqSmQsSMzc3szAyNzSGqi3OTAfaEJRo4hqj7xFqVOXsXhXp5G*Z5*NR6J2TEZZTEuxfXKbtF*JWkhJV6uQcEmhiq1QLAKqvNSU_',
        profile: {
          nick: '冷丰主播',
          emoji: '🐱',
          roleKey: 'anchor',
          roleLabel: '主播',
          roleTone: 'anchor',
          level: 99,
          levelLabel: 'Lv.99'
        }
      },
      anchor2: {
        userID: 'viewer_test_002',
        userSig: 'eJwtzUELgkAQBeD-stdCxl1XF6GLIZRYhywQL6LsGoNoiy6aRP89U4-zvcebD7nHiTWojviEWkD2y41StQYrXHhANaouN6o3OQDdKr2sC61REt92AWwmOHXXRL01dmp2zjkFgFUNNn-zPFcwwRyxreBz-jCNsrBbx3u8ziaK6-JY8XS6ZEGSRg076etg6lsWjrsy7A-k*wOaUzWK',
        profile: {
          nick: '果园副播',
          emoji: '🧑‍🌾',
          roleKey: 'anchor',
          roleLabel: '主播',
          roleTone: 'anchor',
          level: 72,
          levelLabel: 'Lv.72'
        }
      },
      viewer: {
        userID: 'viewer_test_001',
        userSig: 'eJyrVgrxCdYrSy1SslIy0jNQ0gHzM1NS80oy0zLBwmWZqeWpRfElqcUl8QYGhlAlxSnZiQUFmSlKVoZmQFFjC1MjM4hMakVBZlEqUNzU1NTIwMAAIlqSmQsSMzc3szAyNzQ3hZqSmQ60wTCg0KmwIKM4L1A7vaIqMiA7SrswIq-S0cPEPDfH1S8-PdzfNzHT2TkyMtJWqRYAoX01rQ__',
        profile: {
          nick: '冷丰观众',
          emoji: '😊',
          roleKey: 'vip',
          roleLabel: '铁粉',
          roleTone: 'vip',
          level: 18,
          levelLabel: 'Lv.18'
        }
      },
      viewer2: {
        userID: 'viewer_test_002',
        userSig: 'eJwtzUELgkAQBeD-stdCxl1XF6GLIZRYhywQL6LsGoNoiy6aRP89U4-zvcebD7nHiTWojviEWkD2y41StQYrXHhANaouN6o3OQDdKr2sC61REt92AWwmOHXXRL01dmp2zjkFgFUNNn-zPFcwwRyxreBz-jCNsrBbx3u8ziaK6-JY8XS6ZEGSRg076etg6lsWjrsy7A-k*wOaUzWK',
        profile: {
          nick: '冷丰观众2',
          emoji: '😄',
          roleKey: 'viewer',
          roleLabel: '观众',
          roleTone: 'viewer',
          level: 6,
          levelLabel: 'Lv.6'
        }
      }
    }
  };

  var roomCatalog = {
    orchard: {
      roomId: 'orchard',
      title: '冷丰特选',
      subtitle: '车厘子专场',
      anchorRoomTitle: '冷丰直播间',
      anchorDisplayName: '冷丰',
      announcement: '今晚主推车厘子和牛腱子肉，下单前记得领券，坏果包退。',
      groupID: '@TGS#a5I2QZLTL',
      recommendedAnchorRole: 'anchor',
      pushUrl: 'webrtc://229319.push.tlivecloud.com/live/1?txSecret=cf9c27bc3ffb73bdf139d70c2de0c076&txTime=69F2B02F',
      pullUrl: 'webrtc://newlive.lengfenghl.org.cn/live/1',
      defaultViewerCount: 117,
      timers: {
        claim: 345,
        checkin: 345,
        luckyBag: 247
      },
      goods: [
        { id: 1, emoji: '🍒', name: '冷丰优选3J智利车厘子 鲜嫩多汁 坏了包退', tag: '坏了包退 三天内到货', price: '128.8', sold: '', category: '水果', onAir: true, soldOut: false },
        { id: 2, emoji: '🥩', name: '精选金钱牛腱子肉 软烂入味 已售188份', tag: '已售188', price: '96.8', sold: '188', category: '生鲜', onAir: false, soldOut: false },
        { id: 3, emoji: '🦀', name: '阳澄湖大闸蟹 膏脂肥美 坏了包退', tag: '坏了包退', price: '128.8', sold: '', category: '生鲜', onAir: false, soldOut: false },
        { id: 4, emoji: '🍊', name: '冷丰优选赣南脐橙 自然成熟 爆甜速发', tag: '坏果包退 三天内到货', price: '38.8', sold: '', category: '水果', onAir: false, soldOut: true },
        { id: 5, emoji: '🥜', name: '原味腰果仁 大颗粒饱满 每日坚果首选', tag: '坏了包退', price: '59.9', sold: '326', category: '坚果', onAir: false, soldOut: false }
      ]
    },
    ranch: {
      roomId: 'ranch',
      title: '鲜肉专场',
      subtitle: '牛羊肉专场',
      anchorRoomTitle: '鲜肉专场直播间',
      anchorDisplayName: '阿泽',
      announcement: '今天主打牛腱子、羊排和熟食半成品，满 199 送冰袋运费险。',
      groupID: '@TGS#a5I2QZLTL',
      recommendedAnchorRole: 'anchor2',
      pushUrl: 'webrtc://229319.push.tlivecloud.com/live/2?txSecret=70dfe22937e52f0e80adcd3f9c291205&txTime=69F3139A',
      pullUrl: 'webrtc://newlive.lengfenghl.org.cn/live/2',
      defaultViewerCount: 86,
      timers: {
        claim: 480,
        checkin: 520,
        luckyBag: 300
      },
      goods: [
        { id: 101, emoji: '🥩', name: '草饲金钱牛腱子 5斤家庭装', tag: '直播专享 48小时内发货', price: '168.0', sold: '82', category: '生鲜', onAir: true, soldOut: false },
        { id: 102, emoji: '🍖', name: '小羔羊法切羊排 火锅烧烤都合适', tag: '坏了包退', price: '199.0', sold: '33', category: '生鲜', onAir: false, soldOut: false },
        { id: 103, emoji: '🍲', name: '秘制酱牛肉 即食冷切 送礼装', tag: '直播间加赠蘸料', price: '88.0', sold: '140', category: '生鲜', onAir: false, soldOut: false },
        { id: 104, emoji: '🥟', name: '牛肉水饺 皮薄馅大 冷链到家', tag: '今晚下单次日发车', price: '49.9', sold: '201', category: '生鲜', onAir: false, soldOut: false }
      ]
    },
    pantry: {
      roomId: 'pantry',
      title: '囤货厨房',
      subtitle: '干货零食专场',
      anchorRoomTitle: '囤货厨房直播间',
      anchorDisplayName: '小岚',
      announcement: '今天做坚果零食和厨房囤货组合，拍两件自动参与抽福袋。',
      groupID: '@TGS#a5I2QZLTL',
      recommendedAnchorRole: 'anchor',
      pushUrl: '',
      pullUrl: '',
      defaultViewerCount: 63,
      timers: {
        claim: 420,
        checkin: 390,
        luckyBag: 180
      },
      goods: [
        { id: 201, emoji: '🥜', name: '每日坚果礼盒 30包便携装', tag: '直播间第 2 件半价', price: '79.9', sold: '316', category: '坚果', onAir: true, soldOut: false },
        { id: 202, emoji: '🍯', name: '百花蜂蜜 玻璃瓶礼盒装', tag: '拍两件送木勺', price: '59.0', sold: '58', category: '坚果', onAir: false, soldOut: false },
        { id: 203, emoji: '🍜', name: '手工拌面 6袋组合装', tag: '囤货专场', price: '39.9', sold: '211', category: '坚果', onAir: false, soldOut: false },
        { id: 204, emoji: '🍪', name: '黄油曲奇 下午茶分享装', tag: '限时包邮', price: '29.9', sold: '97', category: '坚果', onAir: false, soldOut: false }
      ]
    }
  };

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function getRoomIdFromLocation(search) {
    var params = new URLSearchParams(search || window.location.search);
    var roomId = params.get('room');
    return roomCatalog[roomId] ? roomId : defaultRoomId;
  }

  function getRoomConfig(roomId) {
    var safeRoomId = roomCatalog[roomId] ? roomId : defaultRoomId;
    var room = clone(roomCatalog[safeRoomId]);
    var merged = Object.assign({}, clone(baseConfig), room);
    merged.roomId = safeRoomId;
    return merged;
  }

  function getRoomList() {
    return Object.keys(roomCatalog).map(function (roomId) {
      var room = roomCatalog[roomId];
      return {
        roomId: roomId,
        title: room.title,
        subtitle: room.subtitle,
        anchorDisplayName: room.anchorDisplayName,
        hasPushUrl: !!room.pushUrl,
        hasPullUrl: !!room.pullUrl,
        recommendedAnchorRole: room.recommendedAnchorRole
      };
    });
  }

  return Object.assign({}, getRoomConfig(getRoomIdFromLocation()), {
    defaultRoomId: defaultRoomId,
    rooms: roomCatalog,
    getRoomConfig: getRoomConfig,
    getRoomIdFromLocation: getRoomIdFromLocation,
    getRoomList: getRoomList
  });
})();
