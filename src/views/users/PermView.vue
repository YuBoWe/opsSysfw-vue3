<template>
  <el-card shadow="hover">
    <div>
      <el-breadcrumb :separator-icon="ArrowRight">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>用户管理</el-breadcrumb-item>
        <el-breadcrumb-item>权限列表</el-breadcrumb-item>
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
              <el-button :icon="Search" @click="getPermList()" />
            </template>
          </el-input>
        </el-col>
      </el-row>
    </div>
    <el-table :data="permData.data" border style="width: 100%">
      <el-table-column type="index" width="50" />
      <el-table-column prop="name" label="权限名" />
      <el-table-column prop="content_type.app_label" label="应用" />
      <el-table-column prop="content_type.model" label="模型" />
      <el-table-column prop="codename" label="codename" />
      <el-table-column label="操作">
        <template #default="{ row }">
          <el-tooltip
            class="box-item"
            effect="dark"
            content="编辑权限"
            placement="left"
          >
            <el-button
              type="primary"
              :icon="Edit"
              circle
              @click="handleEdit(row)"
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
  <!-- 编辑权限 -->
  <el-dialog v-model="dialogFormVisible" title="修改权限" width="500" draggable>
    <el-form
      :model="editData"
      ref="permFormRef"
      :rules="rules"
      :size="formSize"
      label-width="auto"
    >
      <el-form-item prop="name" label="权限名">
        <el-input v-model="editData.name" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div>
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="edit(permFormRef)"> 确认 </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { Search, ArrowRight, Delete, Edit } from "@element-plus/icons-vue";
import {
  FormRules,
  FormInstance,
  ComponentSize,
  ElMessage,
  ElMessageBox,
  ListItem,
} from "element-plus";
import { ref, inject, onBeforeMount, reactive } from "vue";
import type { AxiosInstance } from "axios";
const http = inject<AxiosInstance>("http");

import { usePage } from "../../hooks";

// 分页和搜索hook
const { pag, search } = usePage();

// 编辑权限
var dialogFormVisible = ref(false);

const formSize = ref<ComponentSize>("default");

const permFormRef = ref<FormInstance>();

const rules = reactive<FormRules<Perm>>({
  name: [{ min: 3, max: 20, message: "长度在3到20之间", trigger: "blur" }],
});

interface editForm {
  id: number;
  name: string;
}

const editData = reactive<editForm>({
  id: 0,
  name: "",
});

const handleEdit = (row) => {
  const { name, id } = row;
  editData.name = name;
  editData.id = id;
  dialogFormVisible.value = true;
};

const edit = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async (valid) => {
    if (valid) {
      const { id, name } = editData;
      const response = await http.patch(`users/perm/${id}/`, editData);
      if (response.data.code) {
        ElMessage({
          message: response.data.message,
          type: "error",
        });
      } else {
        ElMessage.success("该权限名修改成功");
        getPermList(pag.page);

        dialogFormVisible.value = false;
      }
    }
  });

  console.log();
};

// 分页方法
const handleCurrentChange = (val: number) => {
  getPermList(val);
};

// 用户列表
interface Perm {
  codename: string;
  name: string;
  content_type: ListItem;
}

const permData = reactive<{ data: Perm[] }>({ data: [] });

const getPermList = async (page = 1) => {
  // console.log(search.data);
  // console.log(666);

  if (!page) page = 1;
  const response = await http.get("users/perm/", {
    params: { page, search: search.data },
  });
  console.log(response);
  permData.data = response.data.results;
  pag.total = response.data.pagination.total;
  pag.page = response.data.pagination.page;
  pag.size = response.data.pagination.size;
  // console.log(userData.data);
};

// 渲染前获取userlist
onBeforeMount(() => {
  getPermList();
});
</script>

<style>
</style>