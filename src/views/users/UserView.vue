<template>
  <el-card shadow="hover">
    <div>
      <el-breadcrumb :separator-icon="ArrowRight">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>用户管理</el-breadcrumb-item>
        <el-breadcrumb-item>用户列表</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div>
      <el-row :gutter="10">
        <el-col :span="12">
          <el-input
            v-model="search"
            style="max-width: 600px"
            placeholder="Please input"
            class="input-with-select"
          >
            <template #append>
              <el-button :icon="Search" />
            </template>
          </el-input>
        </el-col>

        <el-button type="primary" plain @click="dialogFormVisible = true"
          >添加用户</el-button
        >
      </el-row>
    </div>
    <el-table
      :data="userData.data"
      border
      style="width: 100%"
      :row-class-name="tableRowClassName"
    >
      <el-table-column type="index" width="50" />
      <el-table-column prop="username" label="用户名" />
      <el-table-column prop="email" label="邮箱" />
      <el-table-column prop="is_active" label="激活" />
      <el-table-column prop="is_superuser" label="管理员" />
      <el-table-column prop="phone" label="电话" />
    </el-table>
    <el-pagination
      :current-page="pag.page"
      :page-size="pag.size"
      layout="total, prev, pager, next, jumper"
      :total="pag.total"
      @current-change="handleCurrentChange"
    />
  </el-card>
  <!-- 添加用户 -->
  <el-dialog
    v-model="dialogFormVisible"
    title="添加用户"
    width="500"
    @closed="resetForm(ruleFormRef)"
  >
    <el-form
      :model="userForm"
      ref="ruleFormRef"
      :rules="rules"
      :size="formSize"
      label-width="auto"
    >
      <el-form-item prop="username" label="用户名">
        <el-input
          v-model="userForm.username"
          placeholder="请输入用户名"
          clearable
        />
      </el-form-item>
      <el-form-item prop="password" label="密码">
        <el-input
          v-model="userForm.password"
          type="password"
          placeholder="请输入密码"
          show-password
          @keydown.enter="addUser(ruleFormRef)"
        />
      </el-form-item>
      <el-form-item prop="checkpass" label="确认密码">
        <el-input
          type="password"
          v-model="userForm.checkpass"
          placeholder="请确认密码"
          clearable
        />
      </el-form-item>
      <el-form-item prop="email" label="邮箱">
        <el-input v-model="userForm.email" placeholder="请输入邮箱" clearable />
      </el-form-item>
      <el-form-item prop="phone" label="电话号码">
        <el-input
          v-model="userForm.phone"
          placeholder="请输入电话号码"
          clearable
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="addUser(ruleFormRef)">
          确认
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { Search, ArrowRight } from "@element-plus/icons-vue";
import {
  FormRules,
  FormInstance,
  ComponentSize,
  ElMessage,
} from "element-plus";
import { ref, inject, onBeforeMount, reactive } from "vue";
import type { AxiosInstance } from "axios";

const http = inject<AxiosInstance>("http");
const search = ref();
// 添加用户
interface RuleForm {
  username: string;
  password: string;
  checkpass: string;
  phone: string;
  email: string;
}
var dialogFormVisible = ref(false);
const formSize = ref<ComponentSize>("default");
const ruleFormRef = ref<FormInstance>();
const formLabelWidth = "140px";
const userForm = reactive<RuleForm>({
  username: "",
  password: "",
  checkpass: "",
  phone: "",
  email: "",
});
const validatePass = (rule: any, value: any, callback: any) => {
  if (value === "") {
    callback(new Error("请再次确认密码"));
  } else if (value !== userForm.password) {
    callback(new Error("两次密码不一致"));
  } else {
    callback();
  }
};

const rules = reactive<FormRules<RuleForm>>({
  username: [
    { required: true, message: "请输入用户名", trigger: "blur" },
    { min: 3, max: 9, message: "Length should be 3 to 9", trigger: "blur" },
  ],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { min: 6, max: 15, message: "Length should be 6 to 15", trigger: "blur" },
  ],
  checkpass: [{ validator: validatePass, trigger: "blur" }],
});

const addUser = (formEl: FormInstance | undefined) => {
  if (!formEl) {
    return;
  }
  formEl.validate(async (valid) => {
    console.log(valid);
    console.log(userForm);

    if (valid) {
      console.log(userForm);
      const { data: response } = await http.post("users/", userForm);
      console.log(response);
      if (response.code) {
        ElMessage({
          message: response.message,
          type: "error",
        });
      } else {
        const username = userForm.username;
        ElMessage.success(`用户${username}创建成功`);
        getUserList();
      }
    }
  });
  dialogFormVisible.value = false;
};

const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
};

// 分页方法
interface pagination {
  total: number;
  page: number;
  size: number;
}
var pag = ref<pagination>({
  total: 0,
  page: 1,
  size: 1,
});

const handleCurrentChange = (val: number) => {
  getUserList(val);
};

// 用户列表
interface User {
  username: string;
  email: string;
  phone: string;
  is_active: boolean;
  is_superuser: boolean;
}

var userData = reactive<{ data: User[] }>({ data: [] });

const getUserList = async (page = 1) => {
  if (!page) page = 1;
  const response = await http.get("users/", { params: { page } });
  console.log(response.data.results);
  userData.data = response.data.results;
  pag = response.data.pagination;
  console.log(userData.data);
};

const tableRowClassName = ({
  row,
  rowIndex,
}: {
  row: User;
  rowIndex: number;
}) => {
  // console.log(row);
  if (row.is_active === true) {
    return "success-row";
  }
  return "warning-row";

  // if (rowIndex === 1) {
  //   return "warning-row";
  // } else if (rowIndex === 3) {
  //   return "success-row";
  // }
  // return "";
};

// 渲染前获取userlist
onBeforeMount(() => {
  getUserList();
});
</script>

<style>
.el-table .warning-row {
  --el-table-tr-bg-color: var(--el-color-warning-light-9);
}
.el-table .success-row {
  --el-table-tr-bg-color: var(--el-color-success-light-9);
}
</style>