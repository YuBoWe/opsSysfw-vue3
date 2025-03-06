<template>
  <el-container>
    <el-header>
      <div class="logo">
        <img class="image" src="../assets/vue.svg" />
        <div class="slogan">后端服务器资产管理系统</div>
        <el-icon class="switch" @click="isCollapse = !isCollapse"
          ><Switch
        /></el-icon>
      </div>
      <div class="person">
        <el-button type="info" @click="exit()">退出</el-button>
      </div>
    </el-header>
    <el-container>
      <el-aside :width="isCollapse ? '64px' : '200px'">
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
              <el-icon><location /></el-icon>
              <span>{{ item.name }}</span>
            </template>
            <el-menu-item
              :index="sub.path"
              v-for="sub in item.children"
              :key="sub.id"
              :route="{ name: sub.name }"
              >{{ sub.name }}
            </el-menu-item>
          </el-sub-menu>
        </el-menu>
      </el-aside>

      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>


<script lang="ts" setup>
import { useRouter, useRoute } from "vue-router";
import { reactive, inject, onBeforeMount, ref } from "vue";
import type { AxiosInstance } from "axios";

const http = inject<AxiosInstance>("http");

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
});

// 折叠菜单
const isCollapse = ref(false);
</script>

<style lang="less" scoped>
.el-container {
  height: 100%;
}
.el-aside {
  background-color: aliceblue;
}

.el-main {
  background-color: #fafafa;
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
  .switch {
    font-size: 38px;
    margin-left: 5px;
    margin-top: 2px;
  }
  .person {
    margin-top: 5px;
  }
  display: flex;
  justify-content: space-between;
  padding-left: 5px;
  background-color: #c0c4cc;
}
</style>