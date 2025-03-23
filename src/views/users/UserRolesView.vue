<template>
  <div>
    <el-card shadow="hover">
      <div>
        <el-breadcrumb :separator-icon="ArrowRight">
          <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item>用户管理</el-breadcrumb-item>
          <el-breadcrumb-item>角色列表</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div>
        <el-row :gutter="10">
          <el-col :span="12">
            <el-input
              v-model="search.data"
              style="max-width: 600px"
              placeholder="请输入"
              class="input-with-select"
              clearable
            >
              <template #append>
                <el-button :icon="Search" @click="getRoleList()" />
              </template>
            </el-input>
          </el-col>
          <el-button type="primary" plain @click="dialogFormVisible = true"
            >添加角色</el-button
          >
        </el-row>
      </div>
      <el-table :data="RoleFormData.data" border style="width: 100%">
        <el-table-column type="index" width="50" />
        <el-table-column prop="name" label="角色名" />
        <el-table-column label="操作">
          <template #default="{ row }">
            <el-tooltip
              class="box-item"
              effect="dark"
              :content="row.name + '分配权限'"
              placement="left"
            >
              <el-button
                type="primary"
                :icon="Setting"
                circle
                @click="handleSetting(row)"
              />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        :current-page="pag.page"
        :page-size="pag.size"
        layout="total, prev, pager, next, jumper"
        :total="pag.total"
        @current-change="handleCurrentChange"
      />
    </el-card>
    <!-- 添加角色 -->
    <el-dialog
      v-model="dialogFormVisible"
      title="添加角色"
      width="500"
      @closed="resetForm(addRoleFormRef)"
      draggable
    >
      <el-form
        :model="addRoleFormData"
        ref="addRoleFormRef"
        :rules="rules"
        :size="formSize"
        label-width="auto"
      >
        <el-form-item prop="name" label="角色名">
          <el-input
            v-model="addRoleFormData.name"
            placeholder="请输入用户名"
            clearable
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取消</el-button>
          <el-button type="primary" @click="addRole(addRoleFormRef)">
            确认
          </el-button>
        </div>
      </template>
    </el-dialog>
    <!-- 设置权限 -->
    <el-dialog
      v-model="permDialogFormVisible"
      title="设置权限"
      width="500"
      @closed="resetTree"
      draggable
    >
      <el-tree
        ref="treeFormRef"
        style="max-width: 600px"
        :data="permData.data"
        show-checkbox
        default-expand-all
        node-key="id"
        highlight-current
        :props="defaultProps"
        :default-checked-keys="seletIds.data"
      />
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="permDialogFormVisible = false">取消</el-button>
          <el-button type="primary" @click="setPerm"> 确认 </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import {
  FormRules,
  FormInstance,
  ComponentSize,
  ElMessage,
  ElTree,
  ListItem,
} from "element-plus";
import { Search, ArrowRight, Setting } from "@element-plus/icons-vue";
import { reactive, inject, onBeforeMount, ref } from "vue";
import type { AxiosInstance } from "axios";
import { usePage } from "../../hooks";

const { pag, search, formSize, resetForm } = usePage();

const http = inject<AxiosInstance>("http");
// 分配权限
const permDialogFormVisible = ref(false);
const treeFormRef = ref<InstanceType<typeof ElTree>>();
const seletIds = reactive<{ data: ListItem[] }>({ data: [] });
const currentRole = ref<number>();
interface Tree {
  id: number;
  name: string;
  children?: Tree[];
}
// const permData: Tree[] = [];
const permData = reactive<{ data: Tree[] }>({ data: [] });
const defaultProps = {
  children: "children",
  label: "name",
};

const getCheckedKeys = () => {
  return treeFormRef.value!.getCheckedKeys(false);
};

const setPerm = async () => {
  const setPermsIdArr = getCheckedKeys();
  console.log(setPermsIdArr);
  const { data: response } = await http.patch(
    `users/role/${currentRole.value}/`,
    {
      permissions: setPermsIdArr,
    }
  );
  if (response.code) {
    ElMessage({
      message: response.message,
      type: "error",
    });
  } else {
    const name = addRoleFormData.name;
    ElMessage.success(`角色${name}权限设置成功`);
    permDialogFormVisible.value = false;
  }
};

const handleSetting = async (row) => {
  console.log(row);
  currentRole.value = row.id;
  const response = await http.get(`users/role/${row.id}/perms/`);
  if (response.data.code) {
    ElMessage({
      message: response.data.message,
      type: "error",
    });
  } else {
    permData.data = response.data.allPerms;
    seletIds.data = response.data.permissions;
  }

  permDialogFormVisible.value = true;
};

const resetTree = () => {
  treeFormRef.value!.setCheckedKeys([], false);
};

// 添加角色
const dialogFormVisible = ref(false);

interface addRoleForm {
  name: string;
}

const addRoleFormData = reactive<addRoleForm>({
  name: "",
});

const addRoleFormRef = ref<FormInstance>();

const rules = reactive<FormRules<addRoleForm>>({
  name: [
    { required: true, message: "请输入角色名", trigger: "blur" },
    { min: 2, max: 9, message: "长度应为2至9", trigger: "blur" },
  ],
});

const addRole = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async (valid) => {
    if (valid) {
      const { data: response } = await http.post(
        "users/role/",
        addRoleFormData
      );
      if (response.code) {
        ElMessage({
          message: response.message,
          type: "error",
        });
      } else {
        const name = addRoleFormData.name;
        ElMessage.success(`角色${name}创建成功`);
        getRoleList();
      }
    }
  });
  dialogFormVisible.value = false;
};

// 获取角色
interface RoleForm {
  id: number;
  name: string;
}
const RoleFormData = reactive<{ data: RoleForm[] }>({ data: [] });

// pagination
const handleCurrentChange = (val: number) => {
  getRoleList(val);
};

const getRoleList = async (page = 1) => {
  if (!page) page = 1;
  const response = await http.get("users/role/", {
    params: { page, search: search.data },
  });

  RoleFormData.data = response.data.results;
  pag.total = response.data.pagination.total;
  pag.page = response.data.pagination.page;
  pag.size = response.data.pagination.size;
};

onBeforeMount(() => {
  getRoleList();
});
</script>

<style>
</style>