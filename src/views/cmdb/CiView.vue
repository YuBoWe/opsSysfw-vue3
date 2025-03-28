<template>
  <div>
    <el-card shadow="hover">
      <div>
        <el-breadcrumb :separator-icon="ArrowRight">
          <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item>资产管理</el-breadcrumb-item>
          <el-breadcrumb-item>资产列表</el-breadcrumb-item>
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
                <el-button :icon="Search" @click="getCis()" />
              </template>
            </el-input>
          </el-col>
          <el-button type="primary" plain @click="dialogVisible = true"
            >添加资产</el-button
          >
        </el-row>
      </div>
      <el-table :data="CiFormData.data" border style="width: 100%">
        <el-table-column type="index" width="50" />
        <el-table-column
          v-for="(column, key) in tableColumns"
          :key="key"
          :prop="key"
          :label="column.label"
        />
        <el-table-column label="操作">
          <template #default="{ row }">
            <el-tooltip
              class="box-item"
              effect="dark"
              :content="'修改' + row.label"
              placement="left"
            >
              <el-button type="primary" :icon="Setting" circle />
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
  <!-- 添加资产 -->
  <el-dialog
    v-model="dialogVisible"
    title="添加资产"
    width="500"
    @closed="clearCheckedNodes()"
    draggable
  >
    <div>
      <el-cascader
        :props="CiTypeProps"
        v-model="selectedValue"
        @change="getFields"
        @clear="clearCheckedNodes"
      />
    </div>
    <el-form
      ref="formRef"
      style="max-width: 600px"
      :model="dynamicValidateForm"
      label-width="auto"
      class="demo-dynamic"
    >
      <el-form-item
        v-for="(domain, index) in dynamicValidateForm.domains"
        :key="domain.key"
        :label="domain.label"
        :prop="'domains.' + index + '.value'"
        :rules="{
          required: domain.required,
          message: '字段不能为空',
          trigger: 'blur',
        }"
      >
        <el-input v-if="domain.type === 'str'" v-model="domain.value" />
        <el-date-picker
          v-if="domain.type === 'date'"
          v-model="domain.value"
          type="datetime"
          placeholder="Select date and time"
        />
        <el-button v-if="domain.type.startsWith('list:')" type="success" text>
          添加
        </el-button>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSet(formRef)"> 确认 </el-button>
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
  DynamicSizeListInstance,
} from "element-plus";
import { Search, ArrowRight, Setting, Plus } from "@element-plus/icons-vue";
import { reactive, inject, onBeforeMount, ref, computed } from "vue";
import type { AxiosInstance } from "axios";
import { usePage } from "../../hooks";

const { pag, search, formSize, resetForm } = usePage();
const http = inject<AxiosInstance>("http");

// 添加资产
import type { CascaderProps } from "element-plus";
const dialogVisible = ref(false);

const selectedValue = ref([]); // 级联选择器的绑定值
const selectedCiTypeId = ref();
const selectCiTypeLabel = ref("");

const CiTypeProps: CascaderProps = {
  lazy: true,
  async lazyLoad(node, resolve) {
    const { level } = node;

    try {
      if (level >= 1) {
        // 模拟异步请求获取数据
        const response = await http.get("cmdb/citypes/all_name/");

        // 检查 response.data 是否有效
        if (!Array.isArray(response.data)) {
          console.error("Invalid response data:", response.data);
          return resolve([]);
        }

        // 根据 response.data 动态生成节点
        const nodes = response.data.map((item) => ({
          value: item.id || undefined, // 使用 item.id，如果不存在则为空
          label: item.label || "Unknown", // 使用 item.label，如果不存在则设置默认值
          leaf: level >= 1, // 根据层级判断是否为叶子节点
        }));

        resolve(nodes);
      } else {
        // 处理 level < 1 的情况
        resolve([
          {
            label: "服务器",
          },
        ]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      resolve([]); // 出错时返回空节点列表
    }
  },
};
const fromRef = ref<FormInstance>();

// 当选中节点变化时触发获取表单项
interface DomainItem {
  label: string;
  name: string;
  requried: boolean;
  value: string;
}

const formRef = ref<FormInstance>();

const dynamicValidateForm = reactive<{
  domains: DomainItem[];
}>({
  domains: [],
});

const getFields = async (item) => {
  if (!item || item.length === 0) return;
  const id = item[item.length - 1];
  selectedCiTypeId.value = id;
  // console.log(id);
  try {
    const response = await http.get(`cmdb/citypes/${id}/`);
    selectCiTypeLabel.value = response.data.label;
    // console.log(response.data.fields);
    dynamicValidateForm.domains = response.data.fields.map((field) => ({
      ...field,
      value: "", // 初始化 value 属性
    }));
  } catch (error) {
    ElMessage.error("获取字段失败:", error);
  }
};

const handleSet = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async (valid) => {
    if (valid) {
      try {
        const payload = dynamicValidateForm.domains.reduce((acc, domain) => {
          acc[domain.name] = domain.value;
          return acc;
        }, {});
        // 添加 CiType 到 payload
        payload["ci_typeId"] = selectedCiTypeId.value;
        payload["ci_type"] = selectCiTypeLabel.value;

        const response = await http.post("cmdb/cis/", payload);
        ElMessage.success("资产添加成功");
        dialogVisible.value = false;
        getCis(); // 刷新资产列表
      } catch (error) {
        ElMessage.error("添加资产失败:", error);
      }
    }
  });
};

// 关闭时回调
const clearCheckedNodes = () => {
  // console.log("close");
  // console.log(selectedValue.value);
  selectedValue.value = []; // 清空级联选择器的值
  dynamicValidateForm.domains = [];
};

// getCis
interface CiForm {
  data: DynamicSizeListInstance;
}

const CiFormData = reactive<{ data: CiForm[] }>({ data: [] });

const getCis = async (page = 1) => {
  if (!page) page = 1;
  const response = await http.get("cmdb/cis/", {
    params: { page, name: search.data },
  });

  CiFormData.data = response.data.results;
  pag.total = response.data.pagination.total;
  pag.page = response.data.pagination.page;
  pag.size = response.data.pagination.size;
};

const handleCurrentChange = (val: number) => {
  getCis(val);
};

// 计算表格列
const tableColumns = computed(() => {
  if (CiFormData.data.length === 0) return {};

  let maxFieldsRecord = {};
  let maxFieldCount = 0;

  for (const record of CiFormData.data) {
    const fieldCount = Object.keys(record).filter(
      (key) => key !== "ci_typeId" && key !== "id"
    ).length;
    if (fieldCount > maxFieldCount) {
      maxFieldCount = fieldCount;
      maxFieldsRecord = record;
    }
  }

  const columns: Record<string, { label: string }> = {};

  for (const key in maxFieldsRecord) {
    if (key !== "ci_typeId" && key !== "id") {
      columns[key] = { label: key.charAt(0).toUpperCase() + key.slice(1) };
    }
  }

  return columns;
});

onBeforeMount(() => {
  getCis();
});
</script>

<style lang="less" scoped>
.demo-dynamic {
  margin: 20px;
}
</style>