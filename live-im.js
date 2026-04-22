(function (global) {
  function createDeferred() {
    var resolveFn;
    var rejectFn;
    var promise = new Promise(function (resolve, reject) {
      resolveFn = resolve;
      rejectFn = reject;
    });

    return {
      promise: promise,
      resolve: resolveFn,
      reject: rejectFn
    };
  }

  function hashString(input) {
    var value = String(input || '');
    var hash = 0;
    var index;

    for (index = 0; index < value.length; index += 1) {
      hash = (hash << 5) - hash + value.charCodeAt(index);
      hash |= 0;
    }

    return Math.abs(hash);
  }

  function pickEmoji(userID, preferredEmoji) {
    var emojiPool = ['😊', '😄', '🙂', '😁', '🥰', '😎', '😍', '🤩'];
    if (preferredEmoji) {
      return preferredEmoji;
    }
    return emojiPool[hashString(userID) % emojiPool.length];
  }

  function mergeObjects(base, extra) {
    return Object.assign({}, base || {}, extra || {});
  }

  function safeParseJSON(value) {
    if (!value || typeof value !== 'string') {
      return null;
    }
    try {
      return JSON.parse(value);
    } catch (error) {
      return null;
    }
  }

  function normalizeProfile(userID, profile) {
    var merged = mergeObjects({
      nick: userID,
      emoji: null,
      roleKey: 'viewer',
      roleLabel: '观众',
      roleTone: 'viewer',
      level: 1,
      levelLabel: 'Lv.1'
    }, profile);

    if (typeof merged.level !== 'number' || !isFinite(merged.level)) {
      merged.level = parseInt(merged.level, 10) || 1;
    }
    if (!merged.levelLabel) {
      merged.levelLabel = 'Lv.' + merged.level;
    }
    if (!merged.roleTone) {
      merged.roleTone = merged.roleKey || 'viewer';
    }
    if (!merged.roleLabel) {
      merged.roleLabel = '观众';
    }

    merged.emoji = pickEmoji(userID, merged.emoji);
    return merged;
  }

  function getKnownProfile(config, userID) {
    var knownUsers = (config && config.knownUsers) || {};
    var roleKeys = Object.keys((config && config.roles) || {});
    var idx;
    var roleConfig;

    if (knownUsers[userID]) {
      return knownUsers[userID];
    }

    for (idx = 0; idx < roleKeys.length; idx += 1) {
      roleConfig = config.roles[roleKeys[idx]];
      if (roleConfig && roleConfig.userID === userID) {
        return roleConfig.profile || {};
      }
    }

    return {};
  }

  function getProfileFromMessage(config, userID, message) {
    var knownProfile = getKnownProfile(config, userID);
    var customData = safeParseJSON(message && message.cloudCustomData);
    var customProfile = customData && customData.profile;

    return normalizeProfile(userID, mergeObjects(knownProfile, customProfile));
  }

  function buildOutboundProfile(profile) {
    var normalized = normalizeProfile(profile && profile.userID, profile);
    return {
      nick: normalized.nick,
      emoji: normalized.emoji,
      roleKey: normalized.roleKey,
      roleLabel: normalized.roleLabel,
      roleTone: normalized.roleTone,
      level: normalized.level,
      levelLabel: normalized.levelLabel
    };
  }

  function normalizeError(error) {
    if (!error) {
      return '未知错误';
    }
    if (typeof error === 'string') {
      return error;
    }
    return error.message || error.msg || error.errorInfo || JSON.stringify(error);
  }

  function extractOnlineCount(response) {
    var data = response && response.data;
    if (typeof data === 'number') {
      return data;
    }
    if (!data) {
      return null;
    }
    if (typeof data.count === 'number') {
      return data.count;
    }
    if (typeof data.memberCount === 'number') {
      return data.memberCount;
    }
    if (typeof data.onlineMemberCount === 'number') {
      return data.onlineMemberCount;
    }
    return null;
  }

  function resolveConfig(roomId) {
    var config = global.LIVE_IM_CONFIG;
    if (config && typeof config.getRoomConfig === 'function') {
      return config.getRoomConfig(roomId);
    }
    return config;
  }

  function createClient(role, hooks, options) {
    var config;
    var roleConfig = config && config.roles && config.roles[role];
    var sdk = global.TencentCloudChat;
    var conversationID;
    var readyDeferred;
    var joinDeferred;
    var state;
    var chat;
    var handlers;

    hooks = hooks || {};
    options = options || {};
    config = resolveConfig(options.roomId);
    roleConfig = config && config.roles && config.roles[role];

    if (!config || !roleConfig) {
      throw new Error('LIVE_IM_CONFIG 未配置完整');
    }
    if (!sdk || typeof sdk.create !== 'function') {
      throw new Error('TencentCloudChat SDK 未加载');
    }

    conversationID = 'GROUP' + config.groupID;
    readyDeferred = createDeferred();
    joinDeferred = createDeferred();
    state = {
      loginPromise: null,
      ready: false,
      joined: false,
      joinStarted: false,
      joinError: null,
      joinNoticeSent: false,
      profileApplied: false,
      seenMessageIDs: new Set(),
      onlineTimer: null
    };
    handlers = {};

    chat = sdk.create({ SDKAppID: config.SDKAppID });

    function log(message, type) {
      if (typeof hooks.log === 'function') {
        hooks.log(message, type || 'info');
      }
    }

    function rememberMessage(message) {
      var messageID = message && (message.ID || message.id || (message.from || 'unknown') + ':' + (message.time || Date.now()) + ':' + (message.seq || message.random || Math.random()));
      if (!messageID) {
        return true;
      }
      if (state.seenMessageIDs.has(messageID)) {
        return false;
      }
      state.seenMessageIDs.add(messageID);
      if (state.seenMessageIDs.size > 200) {
        state.seenMessageIDs.delete(state.seenMessageIDs.values().next().value);
      }
      return true;
    }

    function emitTextMessage(message) {
      var from;
      var profile;
      var normalized;

      if (!message || !message.payload || typeof message.payload.text !== 'string') {
        return;
      }
      if (!rememberMessage(message)) {
        return;
      }

      from = message.from || roleConfig.userID;
      profile = getProfileFromMessage(config, from, message);
      normalized = {
        id: message.ID || message.id || null,
        from: from,
        nick: message.nick || message.nameCard || profile.nick || from,
        text: message.payload.text,
        avatarEmoji: profile.emoji,
        isSelf: from === roleConfig.userID,
        profile: profile
      };

      if (typeof hooks.onTextMessage === 'function') {
        hooks.onTextMessage(normalized, message);
      }
    }

    function emitLikeMessage(message) {
      var payloadData;
      var from;
      var profile;
      var normalized;

      if (!message || !message.payload) {
        return;
      }
      if (!rememberMessage(message)) {
        return;
      }

      payloadData = safeParseJSON(message.payload.data);
      if (!payloadData || payloadData.action !== 'like') {
        return;
      }

      from = message.from || roleConfig.userID;
      profile = normalizeProfile(from, mergeObjects(getKnownProfile(config, from), payloadData.profile));
      normalized = {
        id: message.ID || message.id || null,
        from: from,
        nick: profile.nick || from,
        count: Math.max(1, parseInt(payloadData.count, 10) || 1),
        avatarEmoji: profile.emoji,
        isSelf: from === roleConfig.userID,
        profile: profile
      };

      if (typeof hooks.onLike === 'function') {
        hooks.onLike(normalized, message);
      }
    }

    function emitJoinMessage(message) {
      var payloadData;
      var from;
      var profile;
      var normalized;

      if (!message || !message.payload) {
        return;
      }

      payloadData = safeParseJSON(message.payload.data);
      if (!payloadData || payloadData.action !== 'join') {
        return;
      }
      if (!rememberMessage(message)) {
        return;
      }

      from = message.from || roleConfig.userID;
      profile = normalizeProfile(from, mergeObjects(getKnownProfile(config, from), payloadData.profile));
      normalized = {
        id: message.ID || message.id || null,
        from: from,
        nick: profile.nick || from,
        text: payloadData.text || ((profile.nick || from) + ' 进入直播间'),
        profile: profile,
        isSelf: from === roleConfig.userID
      };

      if (typeof hooks.onJoinNotice === 'function') {
        hooks.onJoinNotice(normalized, message);
      }
    }

    function emitAnnouncement(payload, message) {
      var text = payload && typeof payload.text === 'string' ? payload.text.trim() : '';
      var normalized;

      if (!text) {
        return;
      }

      normalized = {
        id: (message && (message.ID || message.id)) || ('announcement-' + Date.now()),
        text: text,
        from: message && message.from ? message.from : roleConfig.userID,
        profile: payload && payload.profile ? payload.profile : null
      };

      if (typeof hooks.onAnnouncement === 'function') {
        hooks.onAnnouncement(normalized, message);
      }
    }

    function emitAnnouncementMessage(message) {
      var payloadData;

      if (!message || !message.payload) {
        return;
      }

      payloadData = safeParseJSON(message.payload.data);
      if (!payloadData || payloadData.action !== 'announcement') {
        return;
      }
      if (!rememberMessage(message)) {
        return;
      }

      emitAnnouncement(payloadData, message);
    }

    function startOnlinePolling() {
      if (state.onlineTimer || typeof hooks.onOnlineCount !== 'function') {
        return;
      }
      state.onlineTimer = global.setInterval(function () {
        refreshOnlineCount().catch(function () {
          return null;
        });
      }, config.onlineCountPollMs || 10000);
    }

    function ensureProfile() {
      var profile = roleConfig.profile || {};
      var payload = {};

      if (state.profileApplied) {
        return Promise.resolve();
      }

      if (profile.nick) {
        payload.nick = profile.nick;
      }
      if (profile.avatar) {
        payload.avatar = profile.avatar;
      }

      state.profileApplied = true;

      if (!payload.nick && !payload.avatar) {
        return Promise.resolve();
      }

      return chat.updateMyProfile(payload).catch(function (error) {
        log('同步资料失败：' + normalizeError(error), 'warn');
      });
    }

    function ensureJoin() {
      if (state.joined) {
        return Promise.resolve();
      }
      if (state.joinStarted) {
        return joinDeferred.promise;
      }

      state.joinStarted = true;

      Promise.resolve()
        .then(ensureProfile)
        .then(function () {
          return chat.joinGroup({
            groupID: config.groupID,
            type: sdk.TYPES.GRP_AVCHATROOM,
            applyMessage: ((roleConfig.profile && roleConfig.profile.nick) || roleConfig.userID) + ' 进入直播间'
          });
        })
        .then(function () {
          state.joined = true;
          state.joinError = null;
          log('已加入直播群 ' + config.groupID, 'ok');
          if (config.announcement) {
            emitAnnouncement({
              text: config.announcement
            }, null);
          }
          if (typeof hooks.onJoined === 'function') {
            hooks.onJoined(config.groupID);
          }
          joinDeferred.resolve();
          if (!state.joinNoticeSent) {
            state.joinNoticeSent = true;
            return sendJoinNotice().catch(function (error) {
              log('进房提示发送失败：' + normalizeError(error), 'warn');
            });
          }
          return null;
        })
        .then(function () {
          return refreshOnlineCount();
        })
        .then(function () {
          startOnlinePolling();
        })
        .catch(function (error) {
          state.joinError = error;
          log('加入直播群失败：' + normalizeError(error), 'err');
          joinDeferred.resolve(false);
        });

      return joinDeferred.promise;
    }

    async function refreshOnlineCount() {
      var response;
      var count;

      await connect();
      response = await chat.getGroupOnlineMemberCount(config.groupID);
      count = extractOnlineCount(response);

      if (typeof count === 'number' && typeof hooks.onOnlineCount === 'function') {
        hooks.onOnlineCount(count, response);
      }

      return count;
    }

    async function connect() {
      if (!state.loginPromise) {
        log('使用 ' + roleConfig.userID + ' 登录 IM...', 'info');
        state.loginPromise = chat.login({
          userID: roleConfig.userID,
          userSig: roleConfig.userSig
        }).then(function (response) {
          if (response && response.data && response.data.repeatLogin) {
            log('检测到重复登录，当前会话已接管登录态', 'warn');
          }
          return response;
        }).catch(function (error) {
          state.loginPromise = null;
          throw error;
        });
      }

      await state.loginPromise;
      await readyDeferred.promise;
      await ensureJoin();
      if (state.joinError) {
        throw state.joinError;
      }
    }

    async function sendText(text, options) {
      var payloadText = String(text || '').trim();
      var outboundProfile;
      var priority;
      var message;
      var response;
      var localMessage;

      options = options || {};

      if (!payloadText) {
        throw new Error('消息不能为空');
      }

      await connect();
      outboundProfile = buildOutboundProfile(mergeObjects(roleConfig.profile, { userID: roleConfig.userID }));

      priority = sdk.TYPES.MSG_PRIORITY_NORMAL;
      if (options.priority === 'high') {
        priority = sdk.TYPES.MSG_PRIORITY_HIGH;
      } else if (options.priority === 'low') {
        priority = sdk.TYPES.MSG_PRIORITY_LOW;
      }

      message = chat.createTextMessage({
        to: config.groupID,
        conversationType: sdk.TYPES.CONV_GROUP,
        priority: priority,
        payload: {
          text: payloadText
        },
        cloudCustomData: JSON.stringify({
          action: 'text',
          profile: outboundProfile
        })
      });

      response = await chat.sendMessage(message);
      localMessage = (response && response.data && response.data.message) || {
        ID: 'local-' + Date.now(),
        from: roleConfig.userID,
        payload: { text: payloadText },
        cloudCustomData: JSON.stringify({
          action: 'text',
          profile: outboundProfile
        })
      };
      emitTextMessage(localMessage);
      return response;
    }

    async function sendLike(count, options) {
      var likeCount = Math.max(1, parseInt(count, 10) || 1);
      var outboundProfile;
      var message;
      var response;
      var localMessage;

      options = options || {};

      await connect();
      outboundProfile = buildOutboundProfile(mergeObjects(roleConfig.profile, { userID: roleConfig.userID }));

      message = chat.createCustomMessage({
        to: config.groupID,
        conversationType: sdk.TYPES.CONV_GROUP,
        priority: sdk.TYPES.MSG_PRIORITY_LOW,
        payload: {
          data: JSON.stringify({
            action: 'like',
            count: likeCount,
            profile: outboundProfile
          }),
          description: 'live-like',
          extension: 'live-demo'
        }
      });

      response = await chat.sendMessage(message, options);
      localMessage = (response && response.data && response.data.message) || {
        ID: 'local-like-' + Date.now(),
        from: roleConfig.userID,
        payload: {
          data: JSON.stringify({
            action: 'like',
            count: likeCount,
            profile: outboundProfile
          })
        }
      };
      emitLikeMessage(localMessage);
      return response;
    }

    async function sendJoinNotice() {
      var outboundProfile;
      var message;

      await connect();
      outboundProfile = buildOutboundProfile(mergeObjects(roleConfig.profile, { userID: roleConfig.userID }));

      message = chat.createCustomMessage({
        to: config.groupID,
        conversationType: sdk.TYPES.CONV_GROUP,
        priority: sdk.TYPES.MSG_PRIORITY_LOW,
        payload: {
          data: JSON.stringify({
            action: 'join',
            text: (outboundProfile.nick || roleConfig.userID) + ' 进入直播间',
            profile: outboundProfile
          }),
          description: 'live-join',
          extension: 'live-demo'
        }
      });

      return chat.sendMessage(message);
    }

    async function sendAnnouncement(text, options) {
      var announcementText = String(text || '').trim();
      var outboundProfile;
      var message;
      var response;

      options = options || {};

      if (!announcementText) {
        throw new Error('公告不能为空');
      }

      await connect();
      outboundProfile = buildOutboundProfile(mergeObjects(roleConfig.profile, { userID: roleConfig.userID }));

      message = chat.createCustomMessage({
        to: config.groupID,
        conversationType: sdk.TYPES.CONV_GROUP,
        priority: sdk.TYPES.MSG_PRIORITY_HIGH,
        payload: {
          data: JSON.stringify({
            action: 'announcement',
            text: announcementText,
            profile: outboundProfile
          }),
          description: 'live-announcement',
          extension: 'live-demo'
        }
      });

      response = await chat.sendMessage(message, options);
      emitAnnouncement({
        text: announcementText,
        profile: outboundProfile
      }, null);
      return response;
    }

    async function destroy() {
      if (state.onlineTimer) {
        global.clearInterval(state.onlineTimer);
        state.onlineTimer = null;
      }
      state.joined = false;
      state.joinStarted = false;
      state.joinError = null;
      state.seenMessageIDs.clear();
      try {
        if (typeof chat.destroy === 'function') {
          await chat.destroy();
        } else if (typeof chat.logout === 'function' && state.loginPromise) {
          await chat.logout();
        }
      } catch (error) {
        log('IM 销毁失败：' + normalizeError(error), 'warn');
      }
    }

    handlers.ready = function () {
      state.ready = true;
      readyDeferred.resolve();
      log('IM SDK 已就绪', 'ok');
      ensureJoin();
    };
    chat.on(sdk.EVENT.SDK_READY, handlers.ready);

    handlers.messageReceived = function (event) {
      (event.data || []).forEach(function (message) {
        var sameConversation = message.conversationID === conversationID || message.to === config.groupID || message.groupID === config.groupID;
        if (!sameConversation) {
          return;
        }
        if (message.type === sdk.TYPES.MSG_TEXT) {
          emitTextMessage(message);
        } else if (message.type === sdk.TYPES.MSG_CUSTOM) {
          emitLikeMessage(message);
          emitJoinMessage(message);
          emitAnnouncementMessage(message);
        }
      });
    };
    chat.on(sdk.EVENT.MESSAGE_RECEIVED, handlers.messageReceived);

    handlers.kickedOut = function (event) {
      log('IM 被踢下线：' + normalizeError(event && event.data), 'warn');
      if (typeof hooks.onKickedOut === 'function') {
        hooks.onKickedOut(event && event.data);
      }
    };
    chat.on(sdk.EVENT.KICKED_OUT, handlers.kickedOut);

    handlers.error = function (event) {
      var error = event && event.data ? event.data : event;
      if (error && error.code) {
        log('IM 错误 ' + error.code + '：' + normalizeError(error), 'warn');
      }
    };
    chat.on(sdk.EVENT.ERROR, handlers.error);

    handlers.netStateChange = function (event) {
      var data = event && event.data ? event.data : {};
      if (!data.state) {
        return;
      }
      if (data.state === 'connected') {
        log('IM 网络已连接', 'ok');
      } else if (data.state !== 'closed') {
        log('IM 网络状态：' + data.state, 'info');
      }
    };
    chat.on(sdk.EVENT.NET_STATE_CHANGE, handlers.netStateChange);

    return {
      connect: connect,
      sendText: sendText,
      sendLike: sendLike,
      sendAnnouncement: sendAnnouncement,
      refreshOnlineCount: refreshOnlineCount,
      destroy: destroy,
      getConfig: function () {
        return config;
      }
    };
  }

  global.LiveIM = {
    createClient: createClient,
    pickEmoji: pickEmoji,
    normalizeError: normalizeError
  };
})(window);
