<template>
  <el-container class="app-container">
    <el-main class="app-main">
      <!-- 区域管理页面 -->
      <div class="content-wrapper">
        <div class="content-header">
          <h2>区域管理</h2>
          <el-button type="primary" @click="showAddRegionDialog = true">
            <el-icon><Plus /></el-icon>
            新增区域
          </el-button>
        </div>

        <div class="search-bar">
          <el-input
              v-model="regionSearchQuery"
              placeholder="搜索区域"
              prefix-icon="Search"
              class="search-input"
              @keyup.enter="fetchRegions"
          ></el-input>
        </div>

        <el-table
            :data="paginatedRegions"
            border
            style="width: 100%; margin-top: 16px;"
        >
          <el-table-column prop="id" label="ID" width="80"></el-table-column>
          <el-table-column prop="areaName" label="区域名称"></el-table-column>
          <el-table-column prop="areaDesc" label="区域描述"></el-table-column>
          <el-table-column label="操作" width="200">
            <template #default="scope">
              <el-button
                  size="small"
                  @click="handleEditRegion(scope.row)"
              >
                编辑
              </el-button>
              <el-button
                  size="small"
                  type="danger"
                  @click="handleDeleteRegion(scope.row.id)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="currentPage"
            :page-sizes="[10, 20, 50]"
            :page-size="pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            class="pagination"
        ></el-pagination>
      </div>
    </el-main>

    <!-- 新增/编辑区域对话框 -->
    <el-dialog
        :title="formRegion.id ? '编辑区域' : '新增区域'"
        v-model="showAddRegionDialog"
        width="500px"
    >
      <el-form
          :model="formRegion"
          :rules="regionRules"
          ref="regionFormRef"
          label-width="100px"
      >
        <el-form-item label="区域名称" prop="areaName">
          <el-input v-model="formRegion.areaName"></el-input>
        </el-form-item>
        <el-form-item label="区域描述" prop="areaDesc">
          <el-input
              v-model="formRegion.areaDesc"
              type="textarea"
              :rows="3"
          ></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddRegionDialog = false">取消</el-button>
        <el-button
            type="primary"
            @click="submitRegionForm"
        >
          确认
        </el-button>
      </template>
    </el-dialog>
  </el-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { Plus } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import areaAPI from '@/api/setting/Area.js';

// 区域数据
const regions = ref([]);
const total = ref(0);
const loadingRegions = ref(false);

// 区域管理相关状态
const regionSearchQuery = ref('');
const currentPage = ref(1);
const pageSize = ref(10);
const showAddRegionDialog = ref(false);
const formRegion = ref({
  id: undefined,
  areaName: '',
  areaDesc: ''
});
const regionRules = ref({
  areaName: [
    {required: true, message: '请输入区域名称', trigger: 'blur'},
    {min: 2, max: 50, message: '区域名称长度在 2 到 50 个字符', trigger: 'blur'}
  ],
  areaDesc: [
    {required: true, message: '请输入区域描述', trigger: 'blur'},
    {max: 200, message: '区域描述不能超过 200 个字符', trigger: 'blur'}
  ]
});
const regionFormRef = ref(null);

// 计算属性 - 筛选区域
const filteredRegions = computed(() => {
  // 确保 regions.value 存在且是数组，否则使用空数组
  const regionsList = Array.isArray(regions.value) ? regions.value : [];
  const searchQuery = regionSearchQuery.value.toLowerCase();

  return regionsList.filter(region => {
    return (
        (region.areaName && region.areaName.toLowerCase().includes(searchQuery)) ||
        (region.areaDesc && region.areaDesc.toLowerCase().includes(searchQuery))
    );
  });
});

// 分页后的区域数据
const paginatedRegions = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredRegions.value.slice(start, end);
});

// 生命周期钩子
onMounted(() => {
  fetchRegions();
});

// 方法 - 分页控制
const handleSizeChange = (val) => {
  pageSize.value = val;
  currentPage.value = 1;
};

const handleCurrentChange = (val) => {
  currentPage.value = val;
};

// 方法 - 区域管理
const handleEditRegion = (region) => {
  formRegion.value = {...region};
  showAddRegionDialog.value = true;
};

const submitRegionForm = async () => {
  try {
    await regionFormRef.value.validate();

    if (formRegion.value.id) {
      // 编辑现有区域
      await areaAPI.update(formRegion.value.id, formRegion.value);
      ElMessage.success('区域编辑成功');
    } else {
      // 创建新区域
      await areaAPI.add(formRegion.value);
      ElMessage.success('区域创建成功');
    }

    showAddRegionDialog.value = false;
    regionFormRef.value.resetFields();
    await fetchRegions();
  } catch (error) {
    console.error('表单验证失败', error);
    ElMessage.error(error.response?.data?.message || '操作失败');
  }
};

const handleDeleteRegion = (regionId) => {
  const region = regions.value.find(r => r.id === regionId);
  if (!region) return;

  ElMessageBox.confirm(
      `确定要删除区域 "${region.areaName}" 吗？此操作不可恢复！`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
  ).then(async () => {
    try {
      await areaAPI.delete(regionId);
      ElMessage.success('区域删除成功');
      fetchRegions();
    } catch (error) {
      ElMessage.error(error.response?.data?.message || '删除失败');
    }
  }).catch(() => {
    // 取消删除
  });
};

// 获取区域列表
const fetchRegions = async () => {
  try {
    loadingRegions.value = true;
    const response = await areaAPI.page(currentPage.value, pageSize.value, regionSearchQuery.value);
    regions.value = response.data.data.content; // 从正确的路径提取区域列表
    total.value = response.data.data.totalElements; // 从正确的路径提取总记录数
  } catch (error) {
    ElMessage.error('获取区域列表失败');
    console.error(error);
  } finally {
    loadingRegions.value = false;
  }
};
</script>

<style scoped>
.app-container {
  height: 100vh;
  overflow: hidden;
}

.app-main {
  padding: 20px;
  overflow-y: auto;
  background-color: #f5f7fa;
}

.content-wrapper {
  background-color: #fff;
  border-radius: 4px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.content-header h2 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.search-bar {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 20px;
}

.search-input {
  width: 300px;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}

::v-deep .el-dialog__body {
  max-height: 500px;
  overflow-y: auto;
}
</style>
