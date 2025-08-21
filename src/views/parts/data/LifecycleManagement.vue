<template>
  <div class="lifecycle-management">
    <div class="header">
      <h3>{{ part.name }} - 生命周期管理</h3>
      <el-button type="primary" @click="showAddEventDialog = true">添加事件</el-button>
    </div>

    <el-timeline>
      <el-timeline-item
          v-for="event in lifecycleEvents"
          :key="event.id"
          :timestamp="event.eventTime"
          :type="getEventType(event.eventType)"
          placement="top"
      >
        <el-card>
          <h4>{{ event.eventType }}</h4>
          <p>{{ event.description }}</p>
          <p>操作人: {{ event.operator }}</p>
          <p v-if="event.location">位置: {{ event.location }}</p>
        </el-card>
      </el-timeline-item>
    </el-timeline>

    <!-- 添加事件对话框 -->
    <el-dialog v-model="showAddEventDialog" title="添加生命周期事件" width="500px">
      <el-form :model="eventForm" label-width="80px">
        <el-form-item label="事件类型">
          <el-select v-model="eventForm.eventType">
            <el-option label="采购入库" value="采购入库" />
            <el-option label="安装使用" value="安装使用" />
            <el-option label="拆卸维修" value="拆卸维修" />
            <el-option label="维修完成" value="维修完成" />
            <el-option label="报废处理" value="报废处理" />
            <el-option label="调拨" value="调拨" />
            <el-option label="检测" value="检测" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="eventForm.description" type="textarea" />
        </el-form-item>
        <el-form-item label="位置">
          <el-input v-model="eventForm.location" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddEventDialog = false">取消</el-button>
        <el-button type="primary" @click="saveEvent">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';

const props = defineProps({
  part: {
    type: Object,
    required: true
  }
});

const lifecycleEvents = ref([]);
const showAddEventDialog = ref(false);

const eventForm = reactive({
  eventType: '',
  description: '',
  location: '',
  operator: '当前用户'
});

onMounted(() => {
  loadLifecycleEvents();
});

const loadLifecycleEvents = () => {
  // 模拟数据
  lifecycleEvents.value = [
    {
      id: 1,
      eventType: '采购入库',
      eventTime: '2022-03-10 10:00:00',
      operator: '采购员A',
      description: '新采购备件入库',
      location: '主仓库'
    },
    {
      id: 2,
      eventType: '安装使用',
      eventTime: '2022-04-15 09:30:00',
      operator: '技术员B',
      description: '安装到生产线A',
      location: '生产线A'
    },
    {
      id: 3,
      eventType: '拆卸维修',
      eventTime: '2022-10-20 14:25:00',
      operator: '技术员C',
      description: '备件故障送修',
      location: '维修车间'
    },
    {
      id: 4,
      eventType: '维修完成',
      eventTime: '2022-11-05 11:10:00',
      operator: '维修员D',
      description: '备件维修完成返回仓库',
      location: '主仓库'
    }
  ];
};

const getEventType = (eventType) => {
  switch (eventType) {
    case '采购入库': return 'primary';
    case '安装使用': return 'success';
    case '拆卸维修': return 'warning';
    case '维修完成': return 'success';
    case '报废处理': return 'danger';
    default: return 'info';
  }
};

const saveEvent = () => {
  // 在实际应用中，这里应该调用API保存事件
  const newEvent = {
    id: Date.now(),
    ...eventForm,
    eventTime: new Date().toLocaleString()
  };

  lifecycleEvents.value.unshift(newEvent);
  ElMessage.success('事件添加成功');
  showAddEventDialog.value = false;

  // 重置表单
  eventForm.eventType = '';
  eventForm.description = '';
  eventForm.location = '';
};
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
</style>
