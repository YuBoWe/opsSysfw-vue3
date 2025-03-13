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
            v-model="search.data"
            style="max-width: 600px"
            placeholder="请输入"
            class="input-with-select"
            clearable
          >
            <template #append>
              <el-button :icon="Search" @click="getUserList()" />
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
      <el-table-column prop="is_active" label="激活">
        <template #default="{ row }">
          <el-switch
            v-if="row.id !== 1"
            v-model="row.is_active"
            style="
              --el-switch-on-color: #13ce66;
              --el-switch-off-color: #ff4949;
            "
            @change="get_isactive(row)"
          />
        </template>
      </el-table-column>
      <el-table-column prop="is_superuser" label="管理员" />
      <el-table-column prop="phone" label="电话" />
      <el-table-column label="操作">
        <template #default="{ row }">
          <el-tooltip
            class="box-item"
            effect="dark"
            :content="'编辑用户' + row.username"
            placement="left"
            v-if="row.id !== 1"
          >
            <el-button
              type="primary"
              :icon="Edit"
              circle
              @click="handleEdit(row)"
            />
          </el-tooltip>
          <el-tooltip
            class="box-item"
            effect="dark"
            :content="'删除用户' + row.username"
            placement="right"
            v-if="row.id !== 1"
          >
            <el-button
              type="danger"
              :icon="Delete"
              circle
              @click="deleteUser(row)"
            />
          </el-tooltip>
          <el-tooltip
            class="box-item"
            effect="dark"
            :content="'修改用户' + row.username + '密码'"
            placement="left"
            v-if="userInfo.id === 1"
          >
            <el-button
              type="info"
              :icon="Edit"
              circle
              @click="chpwdHandle(row)"
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
  <!-- 添加用户 -->
  <el-dialog
    v-model="dialogFormVisible"
    title="添加用户"
    width="500"
    @closed="resetForm(ruleFormRef)"
    draggable
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
  <!-- 修改用户 -->
  <el-dialog
    v-model="editDialogFormVisible"
    title="修改用户"
    width="500"
    @closed="resetForm(ruleEidtFormRef)"
    draggable
  >
    <el-form
      :model="editUserFormData"
      ref="ruleEditFormRef"
      :rules="editRules"
      :size="formSize"
      label-width="auto"
    >
      <el-form-item prop="username" label="用户名"
        >{{ editUserFormData.username }}
      </el-form-item>
      <el-form-item prop="email" label="邮箱">
        <el-input
          v-model="editUserFormData.email"
          placeholder="请输入邮箱"
          clearable
        />
      </el-form-item>
      <el-form-item prop="phone" label="电话号码">
        <el-input
          v-model="editUserFormData.phone"
          placeholder="请输入电话号码"
          clearable
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="editDialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="editUser(ruleEditFormRef)">
          确认
        </el-button>
      </div>
    </template>
  </el-dialog>
  <!-- 管理员修改用户密码 -->
  <el-dialog
    v-model="chpwdDialogFormVisible"
    title="修改用户"
    width="500"
    @closed="resetForm(chpwdFormRef)"
    draggable
  >
    <el-form
      :model="chpwdFormData"
      ref="chpwdFormRef"
      :rules="chpwdRules"
      :size="formSize"
      label-width="auto"
    >
      <el-form-item prop="username" label="用户名"
        >{{ chpwdFormData.username }}
      </el-form-item>

      <el-form-item prop="newpass" label="新密码">
        <el-input
          v-model="chpwdFormData.newpass"
          type="password"
          placeholder="请设置新密码"
          show-password
        />
      </el-form-item>
      <el-form-item prop="checkpass" label="确认密码">
        <el-input
          v-model="chpwdFormData.checkpass"
          placeholder="请确认新密码"
          type="password"
          show-password
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="chpwdDialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="chpwd(chpwdFormRef)">
          确认
        </el-button>
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
} from "element-plus";
import { ref, inject, onBeforeMount, reactive } from "vue";
import type { AxiosInstance } from "axios";

//
// const { resetForm } = useCounter;
// import resetForm from "../../hooks/index";
import { usePage } from "../../hooks";

const { resetForm, userInfo, get_userinfo, pag } = usePage();

const http = inject<AxiosInstance>("http");

// 管理员修改用户密码
interface chpwdUserForm {
  id: number;
  username: string;
  newpass: string;
  checkpass: string;
}
var chpwdDialogFormVisible = ref(false);
const chpwdFormRef = ref<FormInstance>();
const chpwdFormData = reactive<chpwdUserForm>({
  id: 0,
  username: "",
  newpass: "",
  checkpass: "",
});

const chpwdHandle = (row) => {
  chpwdFormData.username = row.username;
  chpwdFormData.id = row.id;
  chpwdDialogFormVisible.value = true;
};

const validatePass2 = (rule: any, value: any, callback: any) => {
  if (value === "") {
    callback(new Error("请再次确认密码"));
  } else if (value !== chpwdFormData.newpass) {
    callback(new Error("两次密码不一致"));
  } else {
    callback();
  }
};

const chpwdRules = reactive<FormRules<chpwdUserForm>>({
  newpass: [
    { required: true, message: "请输入新密码", trigger: "blur" },
    { min: 6, max: 15, message: "Length should be 6 to 15", trigger: "blur" },
  ],
  checkpass: [{ validator: validatePass2, trigger: "blur" }],
});

const chpwd = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async (vaild) => {
    const { data: response } = await http.post(
      `users/mgr/${chpwdFormData.id}/setuserspwd/`,
      chpwdFormData
    );
    if (response.code) {
      ElMessage({
        message: response.message,
        type: "error",
      });
    } else {
      const username = chpwdFormData.username;
      ElMessage.success(`用户${username}密码修改成功`);
      chpwdDialogFormVisible.value = false;
    }
  });

  console.log("修改密码");
};

// 修改用户email及phone
interface editUserForm {
  id: number;
  username: string;
  phone: string;
  email: string;
}
var editDialogFormVisible = ref(false);
// const formSize = ref<ComponentSize>("default");
const ruleEditFormRef = ref<FormInstance>();
// const formLabelWidth = "140px";
const editUserFormData = reactive<editUserForm>({
  id: 0,
  username: "",
  phone: "",
  email: "",
});
const editRules = reactive<FormRules<editUserForm>>({});

const handleEdit = (row) => {
  const { id, username, phone, email } = row;
  editUserFormData.username = username;
  editUserFormData.phone = phone;
  editUserFormData.email = email;
  editUserFormData.id = id;

  editDialogFormVisible.value = true;
};

const editUser = (formEl: FormInstance | undefined) => {
  console.log("修改用户信息");

  if (!formEl) {
    console.log(formEl);

    return;
  }

  formEl.validate(async (valid) => {
    if (valid) {
      const { id, username } = editUserFormData;
      const response = await http.patch(`users/mgr/${id}/`, editUserFormData);
      if (response.data.code) {
        ElMessage({
          message: response.data.message,
          type: "error",
        });
      } else {
        ElMessage.success(`用户${username}修改成功`);
        getUserList(pag.page);
        console.log("用户修改成功");

        editDialogFormVisible.value = false;
      }
    }
  });
};

// 删除用户
const deleteUser = (row) => {
  ElMessageBox.confirm("是否删除该用户", "警告", {
    confirmButtonText: "是",
    cancelButtonText: "否",
    type: "error",
  })
    .then(async () => {
      const response = await http.delete(`users/mgr/${row.id}/`);
      if (!response.data.code) {
        ElMessage({
          type: "success",
          message: `成功删除用户${row.username}`,
        });
        getUserList();
      }
    })
    .catch(() => {});
};

// 更新激活状态
const get_isactive = async (row) => {
  // console.log("~~~~~~~~~~~~~");

  // console.log(row.id);
  const id = row.id;
  const response = await http.patch(`/users/mgr/${id}/`, {
    is_active: row.is_active,
  });
  if (response.data.code) {
    ElMessage.error(response.data.message);
  }
  // console.log("~~~~~~~~~~~~~");
};

// 用户查询
interface searchForm {
  data: string;
}
const search = reactive<searchForm>({
  data: "",
});

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
    // console.log(valid);
    // console.log(userForm);

    if (valid) {
      // console.log(userForm);
      const { data: response } = await http.post("users/mgr/", userForm);
      // console.log(response);
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

// 分页方法
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
  // console.log(search.data);
  // console.log(666);

  if (!page) page = 1;
  const response = await http.get("users/mgr/", {
    params: { page, username: search.data },
  });
  // console.log(response.data.results);
  userData.data = response.data.results;
  pag.total = response.data.pagination.total;
  pag.page = response.data.pagination.page;
  pag.size = response.data.pagination.size;
  // console.log(userData.data);
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
  get_userinfo();
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