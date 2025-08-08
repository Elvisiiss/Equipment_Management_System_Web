<template>
  <div>
    <h3>PM 工单 & 复机检查</h3>

    <el-tabs v-model="activeTab">
      <!-- 1. PM 工单列表 -->
      <el-tab-pane label="PM 工单" name="pm">
        <el-button type="primary" @click="openCreatePm">创建 PM 工单</el-button>

        <el-table :data="pmList" style="width:100%;margin-top:12px">
          <el-table-column prop="code" label="单号" />
          <el-table-column prop="deviceName" label="设备" />
          <el-table-column prop="planDate" label="计划日期" />
          <el-table-column prop="status" label="状态">
            <template #default="{$index}">
              <el-tag>{{ pmList[$index].status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template #default="{row}">
              <el-button size="small" @click="viewPm(row)">查看</el-button>
              <el-button
                  v-if="row.status==='待执行'"
                  size="small"
                  type="success"
                  @click="finishPm(row)"
              >
                执行完成
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- 2. 复机检查项目管理 -->
      <el-tab-pane label="复机检查项" name="check">
        <el-button type="primary" @click="openCreateCheckItem">新增检查项</el-button>
        <el-button @click="importCheckItems">导入模板</el-button>

        <el-table :data="checkItemList" style="width:100%;margin-top:12px">
          <el-table-column prop="name" label="名称" />
          <el-table-column prop="operate" label="操作" />
          <el-table-column prop="method" label="方法" />
          <el-table-column prop="spec" label="规格/标准" />
          <el-table-column label="必检">
            <template #default="{$index}">
              <el-checkbox v-model="checkItemList[$index].required" disabled />
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template #default="{$index}">
              <el-button size="small" @click="editCheckItem($index)">编辑</el-button>
              <el-button size="small" type="danger" @click="delCheckItem($index)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- 3. 复机列表组合 -->
      <el-tab-pane label="复机列表组合" name="template">
        <el-button type="primary" @click="openCreateTemplate">新建组合</el-button>

        <el-table :data="templateList" style="width:100%;margin-top:12px">
          <el-table-column prop="name" label="组合名称" />
          <el-table-column prop="items" label="包含检查项">
            <template #default="{$index}">
              {{ templateList[$index].items.join('，') }}
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template #default="{row}">
              <el-button size="small" @click="editTemplate(row)">编辑</el-button>
              <el-button size="small" type="danger" @click="delTemplate(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>

    <!-- 创建 PM 弹窗 -->
    <el-dialog v-model="pmVisible" title="创建 PM 工单" width="500px">
      <el-form :model="pmForm" label-width="80px">
        <el-form-item label="设备">
          <el-select v-model="pmForm.deviceId" filterable>
            <el-option
                v-for="d in devices"
                :key="d.id"
                :label="d.name"
                :value="d.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="计划日期">
          <el-date-picker v-model="pmForm.planDate" type="date" />
        </el-form-item>
        <el-form-item label="复机模板">
          <el-select v-model="pmForm.templateId">
            <el-option
                v-for="t in templateList"
                :key="t.id"
                :label="t.name"
                :value="t.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="pmVisible=false">取消</el-button>
        <el-button type="primary" @click="savePm">保存</el-button>
      </template>
    </el-dialog>

    <!-- 检查项弹窗 -->
    <el-dialog v-model="checkItemVisible" :title="checkItemIdx>-1?'编辑':'新增'">
      <el-form :model="checkItemForm" label-width="100px">
        <el-form-item label="名称">
          <el-input v-model="checkItemForm.name" />
        </el-form-item>
        <el-form-item label="操作">
          <el-input v-model="checkItemForm.operate" />
        </el-form-item>
        <el-form-item label="方法">
          <el-input v-model="checkItemForm.method" />
        </el-form-item>
        <el-form-item label="规格">
          <el-input v-model="checkItemForm.spec" />
        </el-form-item>
        <el-form-item label="必检">
          <el-checkbox v-model="checkItemForm.required" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="checkItemForm.remark" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="checkItemVisible=false">取消</el-button>
        <el-button type="primary" @click="saveCheckItem">保存</el-button>
      </template>
    </el-dialog>

    <!-- 复机列表组合弹窗 -->
    <el-dialog v-model="templateVisible" title="复机列表组合">
      <el-form>
        <el-form-item label="组合名称">
          <el-input v-model="templateForm.name" />
        </el-form-item>
        <el-form-item label="选择检查项">
          <el-checkbox-group v-model="templateForm.items">
            <el-checkbox
                v-for="item in checkItemList"
                :key="item.id"
                :label="item.name"
            />
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="templateVisible=false">取消</el-button>
        <el-button type="primary" @click="saveTemplate">保存</el-button>
      </template>
    </el-dialog>

    <!-- 执行完成弹窗 -->
    <el-dialog v-model="finishVisible" title="完成 PM 并执行复机检查" width="70%">
      <h4>{{ finishPmRow?.code }} - {{ finishPmRow?.deviceName }}</h4>
      <el-table :data="finishTable" style="width:100%">
        <el-table-column prop="name" label="检查项" />
        <el-table-column prop="operate" label="操作" />
        <el-table-column prop="method" label="方法" />
        <el-table-column prop="spec" label="规格/标准" />
        <el-table-column label="结果">
          <template #default="{$index}">
            <el-radio-group v-model="finishTable[$index].result">
              <el-radio label="OK">合格</el-radio>
              <el-radio label="NG">不合格</el-radio>
            </el-radio-group>
          </template>
        </el-table-column>
        <el-table-column label="备注">
          <template #default="{$index}">
            <el-input v-model="finishTable[$index].remark" />
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button @click="finishVisible=false">取消</el-button>
        <el-button type="primary" @click="submitFinish">提交结果</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 设备下拉
const devices = ref([
  { id:1, name:'注塑机-A01' },
  { id:2, name:'冲压机-B05' },
  { id:3, name:'CNC-03' },
])

// PM 工单
const pmList = ref([
  { id:1, code:'PM-20250808-001', deviceName:'注塑机-A01', planDate:'2025-08-08', status:'待执行', templateId:1 }
])
let pmIdPool = 100
const pmVisible = ref(false)
const pmForm = ref({})
function openCreatePm(){
  pmForm.value = {}
  pmVisible.value = true
}
function savePm(){
  const device = devices.value.find(d=>d.id===pmForm.value.deviceId)
  pmList.value.push({
    id: ++pmIdPool,
    code: `PM-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${pmIdPool}`,
    deviceName: device?.name,
    planDate: pmForm.value.planDate,
    status:'待执行',
    templateId: pmForm.value.templateId
  })
  pmVisible.value = false
}

// 检查项
const checkItemList = ref([
  { id:1, name:'清洁', operate:'目视', method:'无灰尘', spec:'无可见灰尘', required:true, remark:'' },
  { id:2, name:'润滑', operate:'油枪', method:'加油', spec:'5ml', required:true, remark:'' },
])
let checkItemIdPool = 100
const checkItemVisible = ref(false)
const checkItemIdx = ref(-1)
const checkItemForm = ref({})
function openCreateCheckItem(){
  checkItemIdx.value = -1
  checkItemForm.value = {}
  checkItemVisible.value = true
}
function editCheckItem(idx){
  checkItemIdx.value = idx
  checkItemForm.value = { ...checkItemList.value[idx] }
  checkItemVisible.value = true
}
function saveCheckItem(){
  if(checkItemIdx.value>-1){
    Object.assign(checkItemList.value[checkItemIdx.value], checkItemForm.value)
  }else{
    checkItemForm.value.id = ++checkItemIdPool
    checkItemList.value.push({ ...checkItemForm.value })
  }
  checkItemVisible.value = false
}
function delCheckItem(idx){
  ElMessageBox.confirm('确认删除？').then(()=>checkItemList.value.splice(idx,1))
}
function importCheckItems(){
  ElMessage.success('请上传 Excel 模板，实际需调用后端解析')
}

// 复机列表组合
const templateList = ref([
  { id:1, name:'标准复机', items:['清洁','润滑'] }
])
let templateIdPool = 100
const templateVisible = ref(false)
const templateForm = ref({})
function openCreateTemplate(){
  templateForm.value = { items:[] }
  templateVisible.value = true
}
function saveTemplate(){
  if(!templateForm.value.name){ ElMessage.warning('请输入名称'); return }
  templateList.value.push({
    id: ++templateIdPool,
    name: templateForm.value.name,
    items: templateForm.value.items
  })
  templateVisible.value = false
}

// 完成 PM
const finishVisible = ref(false)
const finishPmRow = ref()
const finishTable = ref([])
function viewPm(row){
  ElMessage.info('查看功能可扩展详情页')
}
function finishPm(row){
  finishPmRow.value = row
  const template = templateList.value.find(t=>t.id===row.templateId)
  const items = template ? template.items.map(name=>checkItemList.value.find(i=>i.name===name)) : []
  finishTable.value = items.map(i=>({ ...i, result:'', remark:'' }))
  finishVisible.value = true
}
function submitFinish(){
  ElMessage.success('复机检查已提交')
  const idx = pmList.value.findIndex(p=>p.id===finishPmRow.value.id)
  pmList.value[idx].status = '已完成'
  finishVisible.value = false
}

const activeTab = ref('pm')
</script>
