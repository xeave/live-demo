# 多直播 Demo 使用说明

## 入口

- 总入口页：`/Users/zxx/work/leng_feng/live-demo/multi-room-demo.html`
- 观众页：`/Users/zxx/work/leng_feng/live-demo/viewer.html`
- 主播页：`/Users/zxx/work/leng_feng/live-demo/live-demo.html`

## 已做好的能力

- 支持多个 demo 房间：`orchard`、`ranch`、`pantry`
- 观众页支持房间切换
- 主播页支持选择 demo 房间
- 房间切换后会联动：
  - 播放地址
  - 公告
  - 商品列表
  - 右上角直播间名称
  - IM 直播群连接

## 最推荐的演示方式

1. 先打开 `multi-room-demo.html`
2. 从入口页打开一个主播控制台
3. 在主播页确认房间和推流地址
4. 再打开一个观众页
5. 在观众页右上角点击“切直播”
6. 切到另一个房间，演示观众侧可以换直播间

## 如果你要演示两个直播间同时开播

建议：

- 房间 1 用一个主播页
- 房间 2 再开一个主播页
- 最好用两个浏览器窗口或不同 Profile

原因：

- 腾讯云 IM 同一个账号重复登录会互相顶掉
- 当前 demo 主要是前端演示，不是正式账号体系

## 链接参数

- 观众页切到某个房间：`viewer.html?room=orchard`
- 主播页切到某个房间：`live-demo.html?room=orchard`

如果要指定主播角色：

- `live-demo.html?room=orchard&role=anchor`
- `live-demo.html?room=ranch&role=anchor2`

## 你现在需要自己补的真实配置

在 `live-im-config.js` 里补每个房间的：

- `pushUrl`
- `pullUrl`
- `groupID`

当前现状：

- `orchard` 已预置现有 demo 地址
- `ranch`、`pantry` 默认保留空地址，方便你后面手动补真流

## 演示时可以怎么说

可以直接这样讲：

> 这个 demo 里我把直播间抽象成 `roomId`，每个房间绑定自己独立的播放地址、推流地址、IM 群和商品数据。观众切直播时，本质上就是切 `roomId`，页面会重连播放器和聊天室，并刷新该房间的业务信息。
