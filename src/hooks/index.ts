import type {
  FormInstance,
  ComponentSize,
  ElTree
} from "element-plus";
import { reactive, ref } from 'vue'
import axios from 'axios'
axios.defaults.baseURL = '/api';


export const usePage = () => {
  // 重置表单
  const resetForm = (formEl: FormInstance | undefined) => {
    if (!formEl) return;
    formEl.resetFields();
  };

  // 获取用户信息
  interface userForm {
    id: number;
    username: string;
  }
  const userInfo = reactive<userForm>({
    id: 0,
    username: "",
  });

  const get_userinfo = async () => {
    const { data: response } = await axios.get("users/mgr/whoami/");
    // console.log(1111);
    // console.log(response);
    userInfo.id = response.user.id;
    userInfo.username = response.user.username;
  };

  // 分页
  interface pagination {
    total: number;
    page: number;
    size: number;
  }
  const pag = reactive<pagination>({
    total: 0,
    page: 1,
    size: 1,
  });

  // 搜索
  interface searchForm {
    data: string;
  }
  const search = reactive<searchForm>({
    data: "",
  });

  // 树形控件
  const treeFormRef = ref<InstanceType<typeof ElTree>>();
  // // 清除
  const resetTree = () => {
    treeFormRef.value!.setCheckedKeys([], false);
  };
  // // 获取树形控件选中的keys
  const getCheckedKeys = () => {
    return treeFormRef.value!.getCheckedKeys(false);
  };
  
  // 默认表单size
  const formSize = ref<ComponentSize>("default");

  return { resetForm, userInfo, get_userinfo, pag, search, formSize, treeFormRef, resetTree, getCheckedKeys }
}

export const cmdbPage = () => {
  
}

