<template>
  <div>
    <el-card shadow="hover">
      <div>
        <el-breadcrumb :separator-icon="ArrowRight">
          <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item>资产管理</el-breadcrumb-item>
          <el-breadcrumb-item>资产类型</el-breadcrumb-item>
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
                <el-button :icon="Search" @click="getCiTypes()" />
              </template>
            </el-input>
          </el-col>
          <el-button type="primary" plain @click="dialogFormVisible = true"
            >添加资产类型</el-button
          >
        </el-row>
      </div>
      <el-table :data="CiTypeFormData.data" border style="width: 100%">
        <el-table-column type="index" width="50" />
        <el-table-column prop="label" label="资产名" />
        <el-table-column prop="version" label="版本" />
        <el-table-column label="操作">
          <template #default="{ row }">
            <el-tooltip
              class="box-item"
              effect="dark"
              :content="'修改' + row.label + '名'"
              placement="left"
            >
              <el-button type="primary" :icon="Setting" circle />
            </el-tooltip>
            <el-tooltip
              class="box-item"
              effect="dark"
              :content="'添加' + row.label + '的子字段'"
              placement="left"
            >
              <el-button type="primary" :icon="Plus" circle />
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
  </div>
  <!-- 添加资产类型 -->
  <el-dialog
    v-model="dialogFormVisible"
    title="添加资产类型"
    width="500"
    @closed="resetForm(addCiTypeFormRef)"
    draggable
  >
    <el-form
      :model="addCiTypeFormData"
      ref="addCiTypeFormRef"
      :rules="rules"
      :size="formSize"
      label-width="auto"
    >
      <el-form-item prop="name" label="资产名">
        <el-input
          v-model="addCiTypeFormData.name"
          placeholder="请输入资产名"
          clearable
        />
      </el-form-item>
      <el-form-item prop="label" label="标签">
        <el-input
          v-model="addCiTypeFormData.label"
          placeholder="请输入标签"
          clearable
        />
      </el-form-item>
      <el-form-item prop="version" label="版本号">
        <el-input
          v-model="addCiTypeFormData.version"
          placeholder="请输入版本号"
          clearable
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="addCiType(addCiTypeFormRef)">
          确认
        </el-button>
      </div>
    </template>
  </el-dialog>
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
import { Search, ArrowRight, Setting, Plus } from "@element-plus/icons-vue";
import { reactive, inject, onBeforeMount, ref } from "vue";
import type { AxiosInstance } from "axios";
import { usePage } from "../../hooks";

const { pag, search, formSize, resetForm } = usePage();

const http = inject<AxiosInstance>("http");

// 添加资产类型
const dialogFormVisible = ref(false);
const addCiTypeFormRef = ref<FormInstance>();
interface addCiTypeForm {
  name: string;
  label: string;
  version: number;
}
const addCiTypeFormData = reactive<addCiTypeForm>({
  name: "",
  label: "",
  version: null,
});

const rules = reactive<FormRules<addCiTypeForm>>({
  name: [
    { required: true, message: "请输入资产名", trigger: "blur" },
    { min: 2, max: 32, message: "长度应为2至32", trigger: "blur" },
  ],
  label: [
    { required: true, message: "请输入标签", trigger: "blur" },
    { min: 2, max: 32, message: "长度应为2至32", trigger: "blur" },
  ],
  version: [
    { required: true, message: "请输入版本号", trigger: "blur" },
    { min: 1, max: 32, message: "长度应为1至32", trigger: "blur" },
  ],
});

const addCiType = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async (valid) => {
    if (valid) {
      const { data: response } = await http.post(
        "cmdb/citypes/",
        addCiTypeFormData
      );
      if (response.code) {
        ElMessage({
          message: response.message,
          type: "error",
        });
      } else {
        const name = addCiTypeFormData.label;
        ElMessage.success(`资产类型${name}创建成功`);
        getCiTypes();
      }
    }
  });
  dialogFormVisible.value = false;
};

// 获取Ci
interface CiTypeForm {
  id: string;
  name: string;
  label: string;
  version: number;
}
const CiTypeFormData = reactive<{ data: CiTypeForm[] }>({ data: [] });

// pagination
const handleCurrentChange = (val: number) => {
  getCiTypes(val);
};

const getCiTypes = async (page = 1) => {
  if (!page) page = 1;
  const response = await http.get("cmdb/citypes/", {
    params: { page, label: search.data },
  });

  CiTypeFormData.data = response.data.results;
  pag.total = response.data.pagination.total;
  pag.page = response.data.pagination.page;
  pag.size = response.data.pagination.size;
};

onBeforeMount(() => {
  getCiTypes();
});
</script>

<style>
</style>