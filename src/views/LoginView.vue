<template>
  <div class="login_container">
    <div class="login_box">
      <div class="avatar_box">
        <img src="../assets/vue.svg" alt="logo" />
      </div>
      <el-form
        :model="LoginForm"
        :rules="rules"
        class="login_form"
        label-width="auto"
        ref="ruleFormRef"
        :size="formSize"
      >
        <el-form-item prop="username" label="用户名">
          <el-input v-model="LoginForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item prop="password" label="密码">
          <el-input
            v-model="LoginForm.password"
            type="password"
            placeholder="请输入密码"
            show-password
            @keydown.enter="login(ruleFormRef)"
          />
        </el-form-item>
        <el-row :gutter="20" justify="center">
          <el-form-item>
            <el-col :span="6">
              <el-button @click="login(ruleFormRef)" type="primary"
                >登录</el-button
              >
            </el-col>
            <el-col :span="6"><div class="grid-content ep-bg-purple" /></el-col>
            <el-col :span="6">
              <el-button @click="resetForm(ruleFormRef)" type="info"
                >Cancel</el-button
              >
            </el-col>
          </el-form-item>
        </el-row>
      </el-form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref, getCurrentInstance, inject } from "vue";
import {
  ComponentSize,
  FormInstance,
  FormRules,
  ElMessage,
} from "element-plus";
import type { AxiosInstance } from "axios";
import { useRouter, useRoute } from "vue-router";

const $router = useRouter();
const http = inject<AxiosInstance>("http");
interface RuleForm {
  username: string;
  password: string;
}

const formSize = ref<ComponentSize>("default");
const ruleFormRef = ref<FormInstance>();

const LoginForm = reactive<RuleForm>({
  username: "",
  password: "",
});

const rules = reactive<FormRules<RuleForm>>({
  username: [
    { required: true, message: "请输入用户名", trigger: "blur" },
    { min: 3, max: 9, message: "Length should be 3 to 9", trigger: "blur" },
  ],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { min: 6, max: 15, message: "Length should be 6 to 15", trigger: "blur" },
  ],
});

const login = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async (valid) => {
    if (valid) {
      console.log(LoginForm);
      const { data: response } = await http.post("token/", LoginForm);
      console.log(response);
      console.log(response.data);
      console.log(response.code);
      if (response.code) {
        // 此处使用后端发来的code作为判断，有code就是有异常，无code就是登录成功
        ElMessage({
          message: response.message,
          type: "error",
        });
      } else {
        window.localStorage.setItem("token", response.access);
        $router.push("/home");
      }
    } else {
      console.log(formEl);
    }
  });
};

const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
};
</script>

<style lang="less" scoped>
.login_container {
  // background-image: url('../assets/background.heic');
  // background-size: 100% 100%;
  background-color: wheat;
  height: 100%;
}

.login_box {
  width: 450px;
  height: 280px;
  // background-image: url('../assets/inbox.heic');
  // background-size: 100% 100%;
  background-color: aliceblue;
  border-radius: 5px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);

  .avatar_box {
    height: 150px;
    width: 140px;
    padding: 10px;
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
    }
  }
  .login_form {
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: 0 20px;
    box-sizing: border-box;
  }
}
</style>>
