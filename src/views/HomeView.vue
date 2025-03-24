<template>
  <el-container>
    <el-header>
      <div class="logo">
        <img class="image" src="../assets/vue.svg" />
        <div class="slogan">后端服务器资产管理系统</div>
      </div>
      <div class="person">
        <el-dropdown trigger="hover" @command="handleCommand">
          <RouterLink to="/welcome">
            <el-avatar> {{ userInfo.username }} </el-avatar></RouterLink
          >

          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item :icon="EditPen" command="chpwd"
                >修改密码</el-dropdown-item
              >
              <el-dropdown-item :icon="SwitchButton" command="exit" divided
                >退出</el-dropdown-item
              >
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </el-header>
    <el-container>
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <div class="menu-switch" @click="isCollapse = !isCollapse">
          {{ isCollapse ? "展开>" : "<收起" }}
        </div>
        <el-menu
          router
          :default-active="defaultActive.data"
          :collapse="isCollapse"
          :collapse-transition="false"
          class="el-menu-vertical-demo"
        >
          <el-sub-menu
            :index="item.id + ''"
            v-for="item in menuList.data"
            :key="item.id"
          >
            <template #title>
              <el-icon v-if="item.name === '用户管理'"><User /></el-icon>
              <el-icon v-if="item.name === '资产管理'"><Money /></el-icon>
              <span>{{ item.name }}</span>
            </template>
            <el-menu-item
              :index="sub.path"
              v-for="sub in item.children"
              :key="sub.id"
              :route="{ name: sub.name }"
              ><el-icon><Location /></el-icon>
              <span>{{ sub.name }}</span>
            </el-menu-item>
          </el-sub-menu>
        </el-menu>
      </el-aside>

      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
  <!-- 修改密码 -->
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
        >{{ userInfo.username }}
      </el-form-item>
      <el-form-item prop="oldpass" label="旧密码">
        <el-input
          v-model="chpwdFormData.oldpass"
          type="password"
          placeholder="请输入前密码"
          show-password
        />
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
import { useRouter, useRoute } from "vue-router";
import { reactive, inject, onBeforeMount, ref } from "vue";
import {
  FormRules,
  FormInstance,
  ComponentSize,
  ElMessage,
  ElMessageBox,
} from "element-plus";
import type { AxiosInstance } from "axios";
import { usePage } from "../hooks";

// 获取登录用户信息
const { userInfo, get_userinfo, resetForm } = usePage();

const http = inject<AxiosInstance>("http");
// 修改密码
interface chpwdUserForm {
  oldpass: string;
  newpass: string;
  checkpass: string;
}
var chpwdDialogFormVisible = ref(false);
const chpwdFormRef = ref<FormInstance>();
const chpwdFormData = reactive<chpwdUserForm>({
  oldpass: "",
  newpass: "",
  checkpass: "",
});

const validatePass = (rule: any, value: any, callback: any) => {
  if (value === "") {
    callback(new Error("请再次确认密码"));
  } else if (value !== chpwdFormData.newpass) {
    callback(new Error("两次密码不一致"));
  } else {
    callback();
  }
};

const chpwdRules = reactive<FormRules<chpwdUserForm>>({
  oldpass: [
    { required: true, message: "请输入旧密码", trigger: "blur" },
    { min: 6, max: 15, message: "Length should be 6 to 15", trigger: "blur" },
  ],
  newpass: [
    { required: true, message: "请输入新密码", trigger: "blur" },
    { min: 6, max: 15, message: "Length should be 6 to 15", trigger: "blur" },
  ],
  checkpass: [{ validator: validatePass, trigger: "blur" }],
});
const formSize = ref<ComponentSize>("default");

const chpwd = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async (vaild) => {
    const { data: response } = await http.post(
      `users/mgr/${userInfo.id}/setpwd/`,
      chpwdFormData
    );
    if (response.code) {
      ElMessage({
        message: response.message,
        type: "error",
      });
    } else {
      const username = userInfo.username;
      ElMessage.success(`用户${username}密码修改成功`);
      chpwdDialogFormVisible.value = false;
    }
  });

  console.log("修改密码");
};

// 右上角用户下拉菜单
import {
  SwitchButton,
  EditPen,
  User,
  Money,
  Location,
} from "@element-plus/icons-vue";
const handleCommand = (command: string | number | object) => {
  if (command === "exit") {
    exit();
  } else if (command === "chpwd") {
    chpwdDialogFormVisible.value = true;
  }
};

//
// interface userForm {
//   id: number;
//   username: string;
// }
// const userInfo = reactive<userForm>({
//   id: 0,
//   username: "",
// });

// const get_userinfo = async () => {
//   const { data: response } = await http.get("users/mgr/whoami/");
//   console.log(response);
//   userInfo.id = response.user.id;
//   userInfo.username = response.user.username;
// };

// 退出登录
const $router = useRouter();
const exit = () => {
  window.localStorage.removeItem("token");
  $router.push("/");
};

// 菜单项
/// onMounted 钩子可以用来在组件完成初始渲染并创建 DOM 节点后运行代码
interface MenuItem {
  id: number;
  name: string;
  children?: MenuItem[];
}
var menuList = reactive<{ data: MenuItem[] }>({ data: [] });
var defaultActive = reactive<{ data: String }>({ data: "" });

const get_menu = async () => {
  const response = await http.get("users/menu/");
  menuList.data = response.data.menulist;
  defaultActive.data = response.data.default;
  // console.log(menuList.data);
};
onBeforeMount(() => {
  get_menu();
  get_userinfo();
});

// 折叠菜单
const isCollapse = ref(false);
</script>

<style lang="less" scoped>
.menu-switch {
  background: grey;
  font-size: 10px;
  line-height: 24px;
  color: white;
  text-align: center;
  letter-spacing: 0.2rem;
  cursor: pointer;
}
.el-container {
  height: 100%;
}
.el-aside {
  background-color: #2c3e50;
  position: relative;
}

.el-main {
  background-color: #ecf0f1;
}

.el-menu {
  border: none;
}

.el-header {
  .logo {
    display: flex;
    height: 40px;
  }
  .slogan {
    font-size: 30px;
    padding-left: 2px;
  }
  .person {
    margin-top: 5px;
  }
  display: flex;
  justify-content: space-between;
  padding-left: 5px;
  background-color: aliceblue;
}
</style>