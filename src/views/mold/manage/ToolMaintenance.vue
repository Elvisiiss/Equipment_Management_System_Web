<template>
  <div class="fixture-management-container">
    <!-- 顶部标题和操作按钮 -->
    <div class="header">
      <h2>治具管理系统</h2>
      <div class="operation-buttons">
        <el-button type="primary" @click="showCreateDialog">新建治具</el-button>
        <el-button @click="showFixtureGroupDialog">治具群组管理</el-button>
      </div>
    </div>

    <!-- 筛选卡片 -->
    <el-card class="filter-card">
      <el-form :inline="true" :model="filterForm">
        <el-form-item label="治具类型">
          <el-select v-model="filterForm.type" placeholder="请选择">
            <el-option
                v-for="item in fixtureTypes"
                :key="item.value"
                :label="item.label"
                :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filterForm.status" placeholder="请选择">
            <el-option label="全部" value=""></el-option>
            <el-option label="正常" value="normal"></el-option>
            <el-option label="Hold" value="hold"></el-option>
            <el-option label="报废" value="scrap"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="检测群组">
          <el-select v-model="filterForm.group" placeholder="请选择">
            <el-option
                v-for="group in fixtureGroups"
                :key="group.id"
                :label="group.name"
                :value="group.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleFilter">查询</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 治具卡片视图 -->
    <div class="card-view" v-if="viewMode === 'card'">
      <el-row :gutter="20">
        <el-col :span="6" v-for="fixture in filteredFixtures" :key="fixture.id">
          <el-card class="fixture-card" :class="getStatusClass(fixture.status)">
            <div slot="header" class="clearfix">
              <span>{{ fixture.name }}</span>
              <el-button
                  style="float: right; padding: 3px 0"
                  type="text"
                  @click="showFixtureDetail(fixture)"
              >详情</el-button
              >
            </div>
            <div class="fixture-info">
              <p><span class="label">类型:</span> {{ fixture.type }}</p>
              <p><span class="label">状态:</span> {{ getStatusText(fixture.status) }}</p>
              <p><span class="label">检测群组:</span> {{ fixture.groupName }}</p>
              <p><span class="label">最后检测:</span> {{ fixture.lastCheck }}</p>
            </div>
            <div class="card-actions">
              <el-button
                  size="mini"
                  @click="handleCheckout(fixture)"
                  v-if="fixture.status === 'normal'"
              >领出</el-button
              >
              <el-button
                  size="mini"
                  @click="handleReturn(fixture)"
                  v-if="fixture.status === 'in_use'"
              >归还</el-button
              >
              <el-button
                  size="mini"
                  type="danger"
                  @click="showHoldDialog(fixture)"
                  v-if="fixture.status === 'normal' || fixture.status === 'in_use'"
              >Hold</el-button
              >
              <el-button
                  size="mini"
                  type="success"
                  @click="handleReleaseHold(fixture)"
                  v-if="fixture.status === 'hold'"
              >解除Hold</el-button
              >
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 治具表格视图 -->
    <div class="table-view" v-else>
      <el-table :data="filteredFixtures" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column prop="name" label="治具名称"></el-table-column>
        <el-table-column prop="type" label="类型"></el-table-column>
        <el-table-column prop="groupName" label="检测群组"></el-table-column>
        <el-table-column prop="status" label="状态">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastCheck" label="最后检测"></el-table-column>
        <el-table-column label="操作" width="250">
          <template #default="{ row }">
            <el-button size="mini" @click="showFixtureDetail(row)">详情</el-button>
            <el-button
                size="mini"
                @click="handleCheckout(row)"
                v-if="row.status === 'normal'"
            >领出</el-button
            >
            <el-button
                size="mini"
                @click="handleReturn(row)"
                v-if="row.status === 'in_use'"
            >归还</el-button
            >
            <el-button
                size="mini"
                type="danger"
                @click="showHoldDialog(row)"
                v-if="row.status === 'normal' || row.status === 'in_use'"
            >Hold</el-button
            >
            <el-button
                size="mini"
                type="success"
                @click="handleReleaseHold(row)"
                v-if="row.status === 'hold'"
            >解除Hold</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalFixtures"
      ></el-pagination>
    </div>

    <!-- 视图切换 -->
    <div class="view-toggle">
      <el-radio-group v-model="viewMode" size="small">
        <el-radio-button label="card">卡片视图</el-radio-button>
        <el-radio-button label="table">表格视图</el-radio-button>
      </el-radio-group>
    </div>

    <!-- 治具详情弹窗 -->
    <el-dialog title="治具详情" :visible.sync="detailDialogVisible" width="50%">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="基本信息" name="basic">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="治具ID">{{ currentFixture.id }}</el-descriptions-item>
            <el-descriptions-item label="治具名称">{{ currentFixture.name }}</el-descriptions-item>
            <el-descriptions-item label="治具类型">{{ currentFixture.type }}</el-descriptions-item>
            <el-descriptions-item label="检测群组">{{ currentFixture.groupName }}</el-descriptions-item>
            <el-descriptions-item label="当前状态">
              <el-tag :type="getStatusTagType(currentFixture.status)">
                {{ getStatusText(currentFixture.status) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ currentFixture.createTime }}</el-descriptions-item>
            <el-descriptions-item label="最后检测时间">{{ currentFixture.lastCheck }}</el-descriptions-item>
            <el-descriptions-item label="使用次数">{{ currentFixture.usageCount }}</el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>
        <el-tab-pane label="检测记录" name="checks">
          <el-table :data="checkRecords" style="width: 100%">
            <el-table-column prop="date" label="检测日期"></el-table-column>
            <el-table-column prop="operator" label="操作人"></el-table-column>
            <el-table-column prop="result" label="结果">
              <template #default="{ row }">
                <el-tag :type="row.result === '合格' ? 'success' : 'danger'">
                  {{ row.result }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="items" label="检测项目"></el-table-column>
            <el-table-column prop="note" label="备注"></el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="生命周期" name="lifecycle">
          <el-timeline>
            <el-timeline-item
                v-for="(event, index) in lifecycleEvents"
                :key="index"
                :timestamp="event.timestamp"
            >
              {{ event.content }}
            </el-timeline-item>
          </el-timeline>
        </el-tab-pane>
      </el-tabs>
      <span slot="footer" class="dialog-footer">
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </span>
    </el-dialog>

    <!-- 新建治具弹窗 -->
    <el-dialog title="新建治具" :visible.sync="createDialogVisible" width="50%">
      <el-form :model="newFixtureForm" :rules="fixtureRules" ref="newFixtureForm" label-width="100px">
        <el-form-item label="治具名称" prop="name">
          <el-input v-model="newFixtureForm.name"></el-input>
        </el-form-item>
        <el-form-item label="治具类型" prop="type">
          <el-select v-model="newFixtureForm.type" placeholder="请选择治具类型">
            <el-option
                v-for="item in fixtureTypes"
                :key="item.value"
                :label="item.label"
                :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="检测群组" prop="groupId">
          <el-select v-model="newFixtureForm.groupId" placeholder="请选择检测群组">
            <el-option
                v-for="group in fixtureGroups"
                :key="group.id"
                :label="group.name"
                :value="group.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="点检项目" prop="checkItems">
          <el-checkbox-group v-model="newFixtureForm.checkItems">
            <el-checkbox
                v-for="item in allCheckItems"
                :key="item.id"
                :label="item.id"
            >{{ item.name }}</el-checkbox
            >
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="备注">
          <el-input type="textarea" v-model="newFixtureForm.remark"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="createFixture">确定</el-button>
      </span>
    </el-dialog>

    <!-- Hold治具弹窗 -->
    <el-dialog title="Hold治具" :visible.sync="holdDialogVisible" width="40%">
      <el-form :model="holdForm" :rules="holdRules" ref="holdForm" label-width="100px">
        <el-form-item label="治具名称">
          <el-input v-model="holdFixture.name" disabled></el-input>
        </el-form-item>
        <el-form-item label="Hold原因" prop="reason">
          <el-select v-model="holdForm.reason" placeholder="请选择Hold原因">
            <el-option
                v-for="reason in holdReasons"
                :key="reason.value"
                :label="reason.label"
                :value="reason.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="详细说明" prop="description">
          <el-input type="textarea" v-model="holdForm.description"></el-input>
        </el-form-item>
        <el-form-item label="预计解除时间">
          <el-date-picker
              v-model="holdForm.expectedReleaseDate"
              type="date"
              placeholder="选择日期"
          ></el-date-picker>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="holdDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleHold">确定</el-button>
      </span>
    </el-dialog>

    <!-- 治具检测群组管理弹窗 -->
    <el-dialog title="治具检测群组管理" :visible.sync="groupDialogVisible" width="60%">
      <el-button type="primary" size="small" @click="showAddGroupDialog">新增群组</el-button>
      <el-table :data="fixtureGroups" style="width: 100%; margin-top: 20px">
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column prop="name" label="群组名称"></el-table-column>
        <el-table-column prop="description" label="描述"></el-table-column>
        <el-table-column prop="fixtureCount" label="治具数量"></el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button size="mini" @click="editGroup(row)">编辑</el-button>
            <el-button size="mini" type="danger" @click="deleteGroup(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 新增/编辑群组弹窗 -->
      <el-dialog
          :title="groupEditMode === 'add' ? '新增检测群组' : '编辑检测群组'"
          :visible.sync="groupEditDialogVisible"
          width="40%"
          append-to-body
      >
        <el-form :model="groupForm" :rules="groupRules" ref="groupForm" label-width="100px">
          <el-form-item label="群组名称" prop="name">
            <el-input v-model="groupForm.name"></el-input>
          </el-form-item>
          <el-form-item label="描述">
            <el-input type="textarea" v-model="groupForm.description"></el-input>
          </el-form-item>
          <el-form-item label="检测项目">
            <el-checkbox-group v-model="groupForm.checkItems">
              <el-checkbox
                  v-for="item in allCheckItems"
                  :key="item.id"
                  :label="item.id"
              >{{ item.name }}</el-checkbox
              >
            </el-checkbox-group>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="groupEditDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveGroup">保存</el-button>
        </span>
      </el-dialog>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, computed } from 'vue';

export default {
  setup() {
    // 视图模式
    const viewMode = ref('card');

    // 筛选表单
    const filterForm = reactive({
      type: '',
      status: '',
      group: ''
    });

    // 分页
    const currentPage = ref(1);
    const pageSize = ref(10);
    const totalFixtures = ref(100);

    // 治具类型选项
    const fixtureTypes = [
      { value: 'type1', label: '类型1' },
      { value: 'type2', label: '类型2' },
      { value: 'type3', label: '类型3' },
    ];

    // 治具状态映射
    const statusMap = {
      normal: { text: '正常', tagType: 'success', class: 'status-normal' },
      in_use: { text: '使用中', tagType: 'primary', class: 'status-in-use' },
      hold: { text: 'Hold', tagType: 'warning', class: 'status-hold' },
      scrap: { text: '报废', tagType: 'danger', class: 'status-scrap' }
    };

    // 获取状态文本
    const getStatusText = (status) => {
      return statusMap[status]?.text || status;
    };

    // 获取状态标签类型
    const getStatusTagType = (status) => {
      return statusMap[status]?.tagType || '';
    };

    // 获取状态卡片类名
    const getStatusClass = (status) => {
      return statusMap[status]?.class || '';
    };

    // Hold原因选项
    const holdReasons = [
      { value: 'damage', label: '损坏' },
      { value: 'maintenance', label: '需要维护' },
      { value: 'quality_issue', label: '质量问题' },
      { value: 'other', label: '其他' }
    ];

    // 模拟治具数据
    const fixtures = ref(Array.from({ length: 20 }, (_, i) => ({
      id: `F${1000 + i}`,
      name: `治具${i + 1}`,
      type: `type${(i % 3) + 1}`,
      groupId: `group${(i % 4) + 1}`,
      groupName: `群组${(i % 4) + 1}`,
      status: ['normal', 'in_use', 'hold', 'scrap'][i % 4],
      lastCheck: `2023-05-${10 + (i % 20)}`,
      createTime: `2023-01-${1 + (i % 28)}`,
      usageCount: i + 5,
      checkItems: ['item1', 'item2', 'item3'].slice(0, (i % 3) + 1)
    })));

    // 模拟检测群组数据
    const fixtureGroups = ref([
      { id: 'group1', name: '群组1', description: '第一组治具', fixtureCount: 5, checkItems: ['item1', 'item2'] },
      { id: 'group2', name: '群组2', description: '第二组治具', fixtureCount: 8, checkItems: ['item1', 'item3'] },
      { id: 'group3', name: '群组3', description: '第三组治具', fixtureCount: 3, checkItems: ['item2', 'item3'] },
      { id: 'group4', name: '群组4', description: '第四组治具', fixtureCount: 4, checkItems: ['item1', 'item2', 'item3'] },
    ]);

    // 模拟检测项目
    const allCheckItems = ref([
      { id: 'item1', name: '尺寸检测' },
      { id: 'item2', name: '功能测试' },
      { id: 'item3', name: '外观检查' },
      { id: 'item4', name: '精度校准' },
    ]);

    // 过滤后的治具数据
    const filteredFixtures = computed(() => {
      return fixtures.value.filter(fixture => {
        const typeMatch = !filterForm.type || fixture.type === filterForm.type;
        const statusMatch = !filterForm.status || fixture.status === filterForm.status;
        const groupMatch = !filterForm.group || fixture.groupId === filterForm.group;
        return typeMatch && statusMatch && groupMatch;
      });
    });

    // 详情弹窗相关
    const detailDialogVisible = ref(false);
    const currentFixture = ref({});
    const activeTab = ref('basic');

    // 检测记录模拟数据
    const checkRecords = ref([
      { date: '2023-05-15', operator: '张三', result: '合格', items: '尺寸检测,功能测试', note: '' },
      { date: '2023-04-28', operator: '李四', result: '不合格', items: '尺寸检测,外观检查', note: '尺寸偏差0.1mm' },
      { date: '2023-03-10', operator: '王五', result: '合格', items: '功能测试,外观检查', note: '' },
    ]);

    // 生命周期事件模拟数据
    const lifecycleEvents = ref([
      { timestamp: '2023-05-15', content: '进行日常检测，结果：合格' },
      { timestamp: '2023-04-28', content: '进行日常检测，结果：不合格，已修复' },
      { timestamp: '2023-03-10', content: '从仓库领出使用' },
      { timestamp: '2023-01-15', content: '入库检验通过' },
      { timestamp: '2023-01-10', content: '治具创建完成' },
    ]);

    // 新建治具相关
    const createDialogVisible = ref(false);
    const newFixtureForm = reactive({
      name: '',
      type: '',
      groupId: '',
      checkItems: [],
      remark: ''
    });

    const fixtureRules = {
      name: [{ required: true, message: '请输入治具名称', trigger: 'blur' }],
      type: [{ required: true, message: '请选择治具类型', trigger: 'change' }],
      groupId: [{ required: true, message: '请选择检测群组', trigger: 'change' }],
      checkItems: [{ type: 'array', required: true, message: '请至少选择一个检测项目', trigger: 'change' }]
    };

    // Hold治具相关
    const holdDialogVisible = ref(false);
    const holdFixture = ref({});
    const holdForm = reactive({
      reason: '',
      description: '',
      expectedReleaseDate: ''
    });

    const holdRules = {
      reason: [{ required: true, message: '请选择Hold原因', trigger: 'change' }],
      description: [{ required: true, message: '请输入详细说明', trigger: 'blur' }]
    };

    // 检测群组管理相关
    const groupDialogVisible = ref(false);
    const groupEditDialogVisible = ref(false);
    const groupEditMode = ref('add');
    const groupForm = reactive({
      id: '',
      name: '',
      description: '',
      checkItems: []
    });

    const groupRules = {
      name: [{ required: true, message: '请输入群组名称', trigger: 'blur' }]
    };

    // 显示治具详情
    const showFixtureDetail = (fixture) => {
      currentFixture.value = fixture;
      detailDialogVisible.value = true;
    };

    // 显示新建治具对话框
    const showCreateDialog = () => {
      createDialogVisible.value = true;
    };

    // 创建治具
    const createFixture = () => {
      // 实际项目中这里应该是API调用
      const newId = `F${1000 + fixtures.value.length}`;
      fixtures.value.unshift({
        id: newId,
        name: newFixtureForm.name,
        type: newFixtureForm.type,
        groupId: newFixtureForm.groupId,
        groupName: fixtureGroups.value.find(g => g.id === newFixtureForm.groupId)?.name || '',
        status: 'normal',
        lastCheck: '未检测',
        createTime: new Date().toISOString().split('T')[0],
        usageCount: 0,
        checkItems: newFixtureForm.checkItems
      });

      createDialogVisible.value = false;
      // 重置表单
      Object.assign(newFixtureForm, {
        name: '',
        type: '',
        groupId: '',
        checkItems: [],
        remark: ''
      });
    };

    // 显示Hold对话框
    const showHoldDialog = (fixture) => {
      holdFixture.value = fixture;
      holdDialogVisible.value = true;
    };

    // 处理Hold操作
    const handleHold = () => {
      const index = fixtures.value.findIndex(f => f.id === holdFixture.value.id);
      if (index !== -1) {
        fixtures.value[index].status = 'hold';
      }
      holdDialogVisible.value = false;
      // 重置表单
      Object.assign(holdForm, {
        reason: '',
        description: '',
        expectedReleaseDate: ''
      });
    };

    // 解除Hold
    const handleReleaseHold = (fixture) => {
      const index = fixtures.value.findIndex(f => f.id === fixture.id);
      if (index !== -1) {
        fixtures.value[index].status = 'normal';
      }
    };

    // 领出治具
    const handleCheckout = (fixture) => {
      const index = fixtures.value.findIndex(f => f.id === fixture.id);
      if (index !== -1) {
        fixtures.value[index].status = 'in_use';
      }
    };

    // 归还治具
    const handleReturn = (fixture) => {
      const index = fixtures.value.findIndex(f => f.id === fixture.id);
      if (index !== -1) {
        fixtures.value[index].status = 'normal';
        fixtures.value[index].usageCount += 1;
      }
    };

    // 显示检测群组管理对话框
    const showFixtureGroupDialog = () => {
      groupDialogVisible.value = true;
    };

    // 显示新增群组对话框
    const showAddGroupDialog = () => {
      groupEditMode.value = 'add';
      Object.assign(groupForm, {
        id: '',
        name: '',
        description: '',
        checkItems: []
      });
      groupEditDialogVisible.value = true;
    };

    // 编辑群组
    const editGroup = (group) => {
      groupEditMode.value = 'edit';
      Object.assign(groupForm, {
        id: group.id,
        name: group.name,
        description: group.description,
        checkItems: group.checkItems
      });
      groupEditDialogVisible.value = true;
    };

    // 删除群组
    const deleteGroup = (group) => {
      // 实际项目中这里应该有确认对话框和API调用
      const index = fixtureGroups.value.findIndex(g => g.id === group.id);
      if (index !== -1) {
        fixtureGroups.value.splice(index, 1);
      }
    };

    // 保存群组
    const saveGroup = () => {
      if (groupEditMode.value === 'add') {
        // 新增群组
        const newId = `group${fixtureGroups.value.length + 1}`;
        fixtureGroups.value.push({
          id: newId,
          name: groupForm.name,
          description: groupForm.description,
          fixtureCount: 0,
          checkItems: groupForm.checkItems
        });
      } else {
        // 编辑群组
        const index = fixtureGroups.value.findIndex(g => g.id === groupForm.id);
        if (index !== -1) {
          fixtureGroups.value[index].name = groupForm.name;
          fixtureGroups.value[index].description = groupForm.description;
          fixtureGroups.value[index].checkItems = groupForm.checkItems;
        }
      }
      groupEditDialogVisible.value = false;
    };

    // 筛选处理
    const handleFilter = () => {
      currentPage.value = 1;
    };

    // 重置筛选
    const resetFilter = () => {
      Object.assign(filterForm, {
        type: '',
        status: '',
        group: ''
      });
      currentPage.value = 1;
    };

    // 分页处理
    const handleSizeChange = (val) => {
      pageSize.value = val;
    };

    const handleCurrentChange = (val) => {
      currentPage.value = val;
    };

    return {
      viewMode,
      filterForm,
      currentPage,
      pageSize,
      totalFixtures,
      fixtureTypes,
      fixtureGroups,
      allCheckItems,
      holdReasons,
      filteredFixtures,
      getStatusText,
      getStatusTagType,
      getStatusClass,
      detailDialogVisible,
      currentFixture,
      activeTab,
      checkRecords,
      lifecycleEvents,
      createDialogVisible,
      newFixtureForm,
      fixtureRules,
      holdDialogVisible,
      holdFixture,
      holdForm,
      holdRules,
      groupDialogVisible,
      groupEditDialogVisible,
      groupEditMode,
      groupForm,
      groupRules,
      showFixtureDetail,
      showCreateDialog,
      createFixture,
      showHoldDialog,
      handleHold,
      handleReleaseHold,
      handleCheckout,
      handleReturn,
      showFixtureGroupDialog,
      showAddGroupDialog,
      editGroup,
      deleteGroup,
      saveGroup,
      handleFilter,
      resetFilter,
      handleSizeChange,
      handleCurrentChange
    };
  }
};
</script>

<style scoped>
.fixture-management-container {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.filter-card {
  margin-bottom: 20px;
}

.fixture-card {
  margin-bottom: 20px;
}

.fixture-card.status-normal {
  border-left: 4px solid #67c23a;
}

.fixture-card.status-in-use {
  border-left: 4px solid #409eff;
}

.fixture-card.status-hold {
  border-left: 4px solid #e6a23c;
}

.fixture-card.status-scrap {
  border-left: 4px solid #f56c6c;
}

.fixture-info {
  font-size: 14px;
  color: #606266;
}

.fixture-info .label {
  color: #909399;
  margin-right: 10px;
}

.card-actions {
  margin-top: 15px;
  display: flex;
  justify-content: space-between;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}

.view-toggle {
  margin-top: 20px;
  text-align: center;
}
</style>
