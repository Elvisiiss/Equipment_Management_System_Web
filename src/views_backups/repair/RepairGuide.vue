<script setup>
import { ref } from 'vue';

// 假数据
const repairExperiences = ref([
  { id: 1, deviceId: 'DEV-001', experience: '更换主板后解决问题', status: '已审核', file: null },
  { id: 2, deviceId: 'DEV-002', experience: '软件升级解决兼容性问题', status: '待审核', file: null }
]);

const newExperience = ref({
  deviceId: '',
  experience: '',
  file: null
});

const uploadFile = (event) => {
  newExperience.value.file = event.target.files[0];
};

const submitExperience = () => {
  if (!newExperience.value.deviceId || !newExperience.value.experience) return;

  repairExperiences.value.push({
    id: repairExperiences.value.length + 1,
    deviceId: newExperience.value.deviceId,
    experience: newExperience.value.experience,
    status: '待审核',
    file: newExperience.value.file
  });

  // 重置表单
  newExperience.value = { deviceId: '', experience: '', file: null };
};

const approveExperience = (id) => {
  const index = repairExperiences.value.findIndex(item => item.id === id);
  if (index !== -1) {
    repairExperiences.value[index].status = '已审核';
  }
};
</script>

<template>
  <div class="repair-guide">
    <h2>维修经验录入</h2>
    <div class="input-section">
      <input v-model="newExperience.deviceId" placeholder="设备编号">
      <textarea v-model="newExperience.experience" placeholder="维修经验"></textarea>
      <input type="file" @change="uploadFile">
      <button @click="submitExperience">提交</button>
    </div>

    <h2>维修经验审核</h2>
    <table>
      <thead>
      <tr>
        <th>设备编号</th>
        <th>维修经验</th>
        <th>状态</th>
        <th>操作</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="item in repairExperiences" :key="item.id">
        <td>{{ item.deviceId }}</td>
        <td>{{ item.experience }}</td>
        <td>{{ item.status }}</td>
        <td>
          <button v-if="item.status === '待审核'" @click="approveExperience(item.id)">审核通过</button>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.repair-guide {
  padding: 20px;
}
.input-section {
  margin-bottom: 20px;
}
input, textarea {
  display: block;
  margin-bottom: 10px;
  width: 100%;
  max-width: 500px;
}
textarea {
  height: 100px;
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
</style>
