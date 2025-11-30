<template>
  <div class="content-wrapper">
    <div class="content-header">
      <h2>菜单管理</h2>
      <el-button type="primary" @click="handleAddRootMenu">
        <el-icon><Plus /></el-icon>
        新增根菜单
      </el-button>
    </div>

    <div class="menu-content">
      <div class="menu-tree-section">
        <el-tree
            ref="menuTreeRef"
            :data="menuTree"
            :props="treeProps"
            node-key="id"
            :expand-on-click-node="false"
            :default-expand-all="true"
            draggable
            @node-drop="handleMenuDrop"
            @node-click="handleMenuClick"
        >
          <template #default="{ node, data }">
            <span class="custom-tree-node">
              <span class="node-content">
                <el-icon v-if="data.metaIcon" :class="data.metaIcon" style="margin-right: 5px;"></el-icon>
                <span>{{ data.metaTitle }}</span>
                <span class="menu-path">({{ data.path }})</span>
              </span>
              <span class="node-actions">
                <el-button
                    size="small"
                    type="primary"
                    link
                    @click="handleAddChildMenu(data)"
                >
                  添加子菜单
                </el-button>
                <el-button
                    size="small"
                    type="warning"
                    link
                    @click="handleEditMenu(data)"
                >
                  编辑
                </el-button>
                <el-button
                    size="small"
                    type="danger"
                    link
                    @click="handleDeleteMenu(data.id)"
                >
                  删除
                </el-button>
              </span>
            </span>
          </template>
        </el-tree>
      </div>
    </div>

    <!-- 新增/编辑菜单对话框 -->
    <el-dialog
        :title="formMenu.id ? '编辑菜单' : '新增菜单'"
        v-model="showMenuDialog"
        width="500px"
    >
      <el-form
          :model="formMenu"
          :rules="menuRules"
          ref="menuFormRef"
          label-width="80px"
      >
        <el-form-item label="父菜单" prop="parentId">
          <el-tree-select
              v-model="formMenu.parentId"
              :data="menuTree"
              :props="treeProps"
              check-strictly
              :render-after-expand="false"
              placeholder="选择父菜单"
              style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="菜单名称" prop="name">
          <el-input v-model="formMenu.name"></el-input>
        </el-form-item>
        <el-form-item label="菜单标题" prop="metaTitle">
          <el-input v-model="formMenu.metaTitle"></el-input>
        </el-form-item>
        <el-form-item label="路由路径" prop="path">
          <el-input v-model="formMenu.path"></el-input>
        </el-form-item>
        <el-form-item label="文件路径" prop="filePath">
          <el-input v-model="formMenu.filePath"></el-input>
        </el-form-item>
        <el-form-item label="菜单图标" prop="metaIcon">
          <el-input v-model="formMenu.metaIcon" placeholder="请输入图标类名，如: el-icon-menu">
            <template #append>
              <el-button @click="showIconSelector = true">选择图标</el-button>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="排序序号" prop="sortOrder">
          <el-input-number
              v-model="formMenu.sortOrder"
              :min="0"
              :max="999"
              controls-position="right"
          ></el-input-number>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showMenuDialog = false">取消</el-button>
        <el-button
            type="primary"
            @click="submitMenuForm"
        >
          确认
        </el-button>
      </template>
    </el-dialog>

    <!-- 图标选择器对话框 -->
    <el-dialog
        title="选择图标"
        v-model="showIconSelector"
        width="600px"
    >
      <div class="icon-selector">
        <div
            v-for="icon in commonIcons"
            :key="icon"
            class="icon-item"
            :class="{ selected: formMenu.metaIcon === icon }"
            @click="selectIcon(icon)"
        >
          <el-icon :class="icon"></el-icon>
          <span>{{ icon }}</span>
        </div>
      </div>
      <template #footer>
        <el-button @click="showIconSelector = false">取消</el-button>
        <el-button type="primary" @click="showIconSelector = false">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { Plus } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import RoleMenuAPI from '@/api/RoleMenu.js'; // 更新引用路径

// 菜单数据
const menuTree = ref([]);
const menuTreeRef = ref(null);

// 菜单管理相关状态
const showMenuDialog = ref(false);
const formMenu = ref({
  id: undefined,
  parentId: 0,
  name: '',
  path: '',
  metaTitle: '',
  filePath: '',
  metaIcon: '',
  sortOrder: 0
});
const menuRules = ref({
  name: [
    { required: true, message: '请输入菜单名称', trigger: 'blur' }
  ],
  metaTitle: [
    { required: true, message: '请输入菜单标题', trigger: 'blur' }
  ],
  path: [
    { required: true, message: '请输入路由路径', trigger: 'blur' }
  ],
  filePath: [
    { required: true, message: '请输入文件路径', trigger: 'blur' }
  ]
});
const menuFormRef = ref(null);

// 图标选择器相关
const showIconSelector = ref(false);
const commonIcons = ref([
  'el-icon-menu',
  'el-icon-document',
  'el-icon-setting',
  'el-icon-user',
  'el-icon-s-tools',
  'el-icon-s-help',
  'el-icon-s-operation',
  'el-icon-s-promotion',
  'el-icon-s-marketing',
  'el-icon-s-data'
]);

const treeProps = ref({
  children: 'children',
  label: 'metaTitle',
  value: 'id'
});

// 生命周期钩子
onMounted(() => {
  fetchMenuTree();
});

// 方法 - 获取菜单树
const fetchMenuTree = async () => {
  try {
    const response = await RoleMenuAPI.getMenuTree(); // 使用新的API
    menuTree.value = response.data.data;
  } catch (error) {
    ElMessage.error('获取菜单树失败');
    console.error(error);
  }
};

// 方法 - 添加根菜单
const handleAddRootMenu = () => {
  formMenu.value = {
    id: undefined,
    parentId: 0,
    name: '',
    path: '',
    metaTitle: '',
    filePath: '',
    metaIcon: '',
    sortOrder: 0
  };
  showMenuDialog.value = true;
};

// 方法 - 添加子菜单
const handleAddChildMenu = (parentMenu) => {
  formMenu.value = {
    id: undefined,
    parentId: parentMenu.id,
    name: '',
    path: '',
    metaTitle: '',
    filePath: '',
    metaIcon: '',
    sortOrder: 0
  };
  showMenuDialog.value = true;
};

// 方法 - 编辑菜单
const handleEditMenu = async (menu) => {
  try {
    const response = await RoleMenuAPI.getMenuById(menu.id); // 使用新的API
    formMenu.value = { ...response.data.data };
    showMenuDialog.value = true;
  } catch (error) {
    ElMessage.error('获取菜单详情失败');
    console.error(error);
  }
};

// 方法 - 提交菜单表单
const submitMenuForm = async () => {
  try {
    await menuFormRef.value.validate();

    if (formMenu.value.id) {
      // 编辑现有菜单
      await RoleMenuAPI.updateMenu(formMenu.value.id, formMenu.value); // 使用新的API
      ElMessage.success('菜单编辑成功');
    } else {
      // 创建新菜单
      await RoleMenuAPI.createMenu(formMenu.value); // 使用新的API
      ElMessage.success('菜单创建成功');
    }

    showMenuDialog.value = false;
    menuFormRef.value.resetFields();
    fetchMenuTree();
  } catch (error) {
    console.error('表单验证失败', error);
    ElMessage.error(error.response?.data?.message || '操作失败');
  }
};

// 方法 - 删除菜单
const handleDeleteMenu = async (menuId) => {
  try {
    await ElMessageBox.confirm('确定要删除该菜单吗？', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });

    await RoleMenuAPI.deleteMenu(menuId); // 使用新的API
    ElMessage.success('菜单删除成功');
    fetchMenuTree();
  } catch (error) {
    if (error === 'cancel') return;
    ElMessage.error('菜单删除失败');
    console.error(error);
  }
};

// 方法 - 菜单拖拽排序
const handleMenuDrop = async (draggingNode, dropNode, dropType) => {
  try {
    const menusData = [];

    const processNode = (node, parentId = 0) => {
      menusData.push({
        id: node.data.id,
        parentId: parentId,
        sortOrder: node.data.sortOrder
      });

      if (node.childNodes && node.childNodes.length > 0) {
        node.childNodes.forEach((child, index) => {
          processNode(child, node.data.id);
        });
      }
    };

    // 处理整个树
    if (menuTreeRef.value) {
      const rootNodes = menuTreeRef.value.store.root.childNodes;
      rootNodes.forEach((node, index) => {
        processNode(node, 0);
      });
    }

    await RoleMenuAPI.updateMenusOrder(menusData); // 使用新的API
    ElMessage.success('菜单顺序更新成功');
  } catch (error) {
    ElMessage.error('菜单顺序更新失败');
    console.error(error);
    fetchMenuTree(); // 失败时重新加载
  }
};

// 方法 - 选择图标
const selectIcon = (icon) => {
  formMenu.value.metaIcon = icon;
};

// 方法 - 菜单点击
const handleMenuClick = (data) => {
  // 可以在这里处理菜单点击事件，比如显示菜单详情等
  console.log('点击菜单:', data);
};
</script>

<style scoped>
.content-wrapper {
  padding: 20px;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.menu-content {
  display: flex;
  gap: 20px;
}

.menu-tree-section {
  flex: 1;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 16px;
  min-height: 500px;
}

.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding: 8px 0;
}

.node-content {
  display: flex;
  align-items: center;
}

.menu-path {
  margin-left: 8px;
  color: #909399;
  font-size: 12px;
}

.node-actions {
  display: flex;
  gap: 8px;
}

.icon-selector {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
}

.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.icon-item:hover {
  border-color: #409eff;
  background-color: #f5f7fa;
}

.icon-item.selected {
  border-color: #409eff;
  background-color: #ecf5ff;
}

.icon-item .el-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.icon-item span {
  font-size: 12px;
  color: #606266;
}
</style>
