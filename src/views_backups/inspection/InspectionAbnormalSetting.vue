<template>
  <div class="inspection-abnormal-setting">
    <h2>点检项目异常标识设置</h2>
    <div class="setting-container">
      <div class="status-list">
        <h3>状态标识设置</h3>
        <table>
          <thead>
          <tr>
            <th>状态名称</th>
            <th>显示颜色</th>
            <th>显示文本</th>
            <th>操作</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="status in statusSettings" :key="status.id">
            <td>{{ status.name }}</td>
            <td>
              <input type="color" v-model="status.color" @change="updateStatus(status)">
            </td>
            <td>
              <input type="text" v-model="status.text" @change="updateStatus(status)">
            </td>
            <td>
              <button @click="resetStatus(status)">重置</button>
            </td>
          </tr>
          </tbody>
        </table>
      </div>

      <div class="preview">
        <h3>预览效果</h3>
        <div class="preview-item" v-for="status in statusSettings" :key="'preview-' + status.id" :style="{ backgroundColor: status.color }">
          {{ status.text }}
        </div>
      </div>
    </div>

    <div class="custom-status">
      <h3>自定义状态</h3>
      <div class="form-group">
        <label>状态名称:</label>
        <input type="text" v-model="newStatus.name">
      </div>
      <div class="form-group">
        <label>状态颜色:</label>
        <input type="color" v-model="newStatus.color">
      </div>
      <div class="form-group">
        <label>显示文本:</label>
        <input type="text" v-model="newStatus.text">
      </div>
      <button @click="addCustomStatus">添加自定义状态</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const defaultStatusSettings = [
  { id: 1, name: '正常', color: '#c8e6c9', text: '正常', defaultColor: '#c8e6c9', defaultText: '正常' },
  { id: 2, name: '调试通过', color: '#fff9c4', text: '调试通过', defaultColor: '#fff9c4', defaultText: '调试通过' },
  { id: 3, name: '异常', color: '#ffcdd2', text: '异常', defaultColor: '#ffcdd2', defaultText: '异常' },
  { id: 4, name: '未点检', color: '#ffffff', text: '未点检', defaultColor: '#ffffff', defaultText: '未点检' },
];

const statusSettings = ref([...defaultStatusSettings]);
const newStatus = ref({
  name: '',
  color: '#cccccc',
  text: ''
});

const updateStatus = (status) => {
  const index = statusSettings.value.findIndex(s => s.id === status.id);
  if (index !== -1) {
    statusSettings.value[index] = { ...status };
  }
};

const resetStatus = (status) => {
  const index = statusSettings.value.findIndex(s => s.id === status.id);
  if (index !== -1) {
    statusSettings.value[index] = {
      ...statusSettings.value[index],
      color: statusSettings.value[index].defaultColor,
      text: statusSettings.value[index].defaultText
    };
  }
};

const addCustomStatus = () => {
  if (!newStatus.value.name || !newStatus.value.text) {
    alert('请填写完整信息');
    return;
  }

  const newId = Math.max(...statusSettings.value.map(s => s.id)) + 1;
  statusSettings.value.push({
    id: newId,
    name: newStatus.value.name,
    color: newStatus.value.color,
    text: newStatus.value.text,
    defaultColor: newStatus.value.color,
    defaultText: newStatus.value.text
  });

  newStatus.value = {
    name: '',
    color: '#cccccc',
    text: ''
  };
};
</script>

<style scoped>
.inspection-abnormal-setting {
  padding: 20px;
}
.setting-container {
  display: flex;
  gap: 30px;
  margin-bottom: 30px;
}
.status-list {
  flex: 2;
}
.preview {
  flex: 1;
}
table {
  width: 100%;
  border-collapse: collapse;
}
th, td {
  border: 1px solid #ddd;
  padding: 8px 12px;
  text-align: left;
}
th {
  background-color: #f2f2f2;
}
.preview-item {
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ddd;
  text-align: center;
}
.custom-status {
  border-top: 1px solid #eee;
  padding-top: 20px;
}
.form-group {
  margin-bottom: 15px;
}
.form-group label {
  display: inline-block;
  width: 100px;
}
button {
  padding: 8px 16px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 10px;
}
button:hover {
  background-color: #388e3c;
}
</style>
