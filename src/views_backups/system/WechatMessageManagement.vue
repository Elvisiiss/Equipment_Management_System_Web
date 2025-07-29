<template>
  <div class="wechat-management">
    <h2>微信信息管理</h2>

    <div class="section">
      <h3>企业微信类型设置</h3>
      <div v-for="type in messageTypes" :key="type.id" class="type-item">
        <label>
          <input type="checkbox" v-model="type.enabled" @change="toggleMessageType(type.id)">
          {{ type.name }}
        </label>
      </div>
    </div>

    <div class="section">
      <h3>企业微信用户匹配</h3>
      <table>
        <thead>
        <tr>
          <th>系统账号</th>
          <th>企业微信账号</th>
          <th>状态</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="user in users" :key="user.id">
          <td>{{ user.systemAccount }}</td>
          <td>
            <input type="text" v-model="user.wechatAccount" @blur="saveUserMapping(user)">
          </td>
          <td>{{ user.matched ? '已匹配' : '未匹配' }}</td>
        </tr>
        </tbody>
      </table>
    </div>

    <div class="section">
      <h3>企业微信群机器人WbeHook设置</h3>
      <div class="form-group">
        <label>群名称:</label>
        <input type="text" v-model="webhookSettings.groupName">
      </div>
      <div class="form-group">
        <label>WebHook URL:</label>
        <input type="text" v-model="webhookSettings.webhookUrl">
      </div>
      <div class="form-group">
        <label>
          <input type="checkbox" v-model="webhookSettings.enabled">
          启用
        </label>
      </div>
      <button @click="saveWebhookSettings">保存设置</button>
    </div>

    <div class="section">
      <h3>企业微信提醒设置</h3>
      <div v-for="type in reminderTypes" :key="type.id" class="type-item">
        <label>
          <input type="checkbox" v-model="type.enabled" @change="toggleReminderType(type.id)">
          {{ type.name }}
        </label>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

// 假数据
const messageTypes = ref([
  { id: 1, name: '推送消息', enabled: true },
  { id: 2, name: '日志', enabled: false },
  { id: 3, name: '通知', enabled: true }
])

const reminderTypes = ref([
  { id: 1, name: '停机', enabled: true },
  { id: 2, name: '报修', enabled: true },
  { id: 3, name: '点检', enabled: false }
])

const users = ref([
  { id: 1, systemAccount: 'user1', wechatAccount: 'wx_user1', matched: true },
  { id: 2, systemAccount: 'user2', wechatAccount: '', matched: false },
  { id: 3, systemAccount: 'user3', wechatAccount: 'wx_user3', matched: true }
])

const webhookSettings = reactive({
  groupName: '设备管理群',
  webhookUrl: 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=123456',
  enabled: true
})

// 方法
const toggleMessageType = (id) => {
  const type = messageTypes.value.find(t => t.id === id)
  if (type) type.enabled = !type.enabled
}

const toggleReminderType = (id) => {
  const type = reminderTypes.value.find(t => t.id === id)
  if (type) type.enabled = !type.enabled
}

const saveUserMapping = (user) => {
  user.matched = !!user.wechatAccount
}

const saveWebhookSettings = () => {
  console.log('保存WebHook设置:', webhookSettings)
}
</script>

<style scoped>
.wechat-management {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}
.section {
  margin-bottom: 30px;
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 5px;
}
.type-item {
  margin: 10px 0;
}
.form-group {
  margin: 10px 0;
}
.form-group label {
  display: inline-block;
  width: 120px;
}
table {
  width: 100%;
  border-collapse: collapse;
}
th, td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}
th {
  background-color: #f2f2f2;
}
button {
  padding: 8px 15px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
button:hover {
  background-color: #45a049;
}
</style>
