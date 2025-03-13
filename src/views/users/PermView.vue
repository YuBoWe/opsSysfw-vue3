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
    </el-table>
    <el-pagination
      :current-page="pag.page"
      :page-size="pag.size"
      layout="total, prev, pager, next, jumper"
      :total="pag.total"
      @current-change="handleCurrentChange"
    />
  </el-card>
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

const { pag } = usePage();
// sreach
interface searchForm {
  data: string;
}
const search = reactive<searchForm>({
  data: "",
});

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