
  4. 设备转机
  │　├─ 4.1 转机申请
  │　├─ 4.2 转机记录
  │　└─ 4.3 转机报表
  <template>
    <el-card>
      <template #header>
        <div class="card-header">
          <span>设备转机记录</span>
          <el-button type="primary" @click="openDialog">新增转机</el-button>
        </div>
      </template>

      <el-table :data="records" border>
        <el-table-column prop="deviceCode"  label="设备编号"/>
        <el-table-column prop="fromProduct" label="原产品机种"/>
        <el-table-column prop="toProduct"   label="新产品机种"/>
        <el-table-column prop="startTime"   label="转机开始"/>
        <el-table-column prop="endTime"     label="转机结束"/>
        <el-table-column prop="remark"      label="备注"/>
      </el-table>

      <!-- 弹窗 -->
      <el-dialog v-model="visible" title="新增转机记录" width="420px">
        <el-form :model="form" label-width="110px">
          <el-form-item label="设备编号">
            <el-input v-model="form.deviceCode"/>
          </el-form-item>
          <el-form-item label="原产品机种">
            <el-input v-model="form.fromProduct"/>
          </el-form-item>
          <el-form-item label="新产品机种">
            <el-input v-model="form.toProduct"/>
          </el-form-item>
          <el-form-item label="转机开始">
            <el-date-picker v-model="form.startTime" type="datetime"/>
          </el-form-item>
          <el-form-item label="转机结束">
            <el-date-picker v-model="form.endTime" type="datetime"/>
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="form.remark" type="textarea"/>
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="visible=false">取消</el-button>
          <el-button type="primary" @click="submit">保存</el-button>
        </template>
      </el-dialog>
    </el-card>
  </template>

  <script setup>
  import { ref, reactive } from 'vue'
  import { ElMessage } from 'element-plus'

  const visible = ref(false)
  const records = ref([])
  const form = reactive({
    deviceCode: '',
    fromProduct: '',
    toProduct: '',
    startTime: '',
    endTime: '',
    remark: ''
  })

  function openDialog () {
    Object.assign(form, {
      deviceCode: '',
      fromProduct: '',
      toProduct: '',
      startTime: '',
      endTime: '',
      remark: ''
    })
    visible.value = true
  }

  function submit () {
    if (!form.deviceCode || !form.fromProduct || !form.toProduct) {
      ElMessage.warning('请完整填写必要信息')
      return
    }
    records.value.push({ ...form })
    visible.value = false
    ElMessage.success('新增成功')
  }
  </script>
