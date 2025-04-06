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
      <el-table :data="flattenData" border style="width: 100%">
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
              :content="'删除' + row.name"
              placement="left"
            >
              <el-button
                type="danger"
                :icon="Delete"
                circle
                @click="deleteCi(row)"
              />
            </el-tooltip>
            <el-tooltip
              class="box-item"
              effect="dark"
              :content="'更新' + row.name"
              placement="left"
            >
              <el-button :icon="Refresh" circle @click="getServerInfo(row)" />
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
        <div v-if="domain.type.startsWith('list:')">
          <el-button type="success" text @click="addDomain(domain)">
            添加
          </el-button>
          <el-card
            v-for="(def, i) in domain.fieldDef"
            :key="`${domain.name}.def.${i}`"
          >
            <!-- <p>{{ def }} {{ i }}</p> -->
            <el-form-item
              v-for="(subDomain, j) in def"
              :key="subDomain.name"
              :label="subDomain.label"
              :prop="'domains.' + index + '.fieldDef.' + i + '.' + j + '.value'"
              :rules="{
                required: subDomain.required,
                message: '字段不能为空',
                trigger: 'blur',
              }"
            >
              <!-- <p>{{ subDomain }} {{ j }}</p> -->
              <el-input v-model="subDomain.value" />
            </el-form-item>
          </el-card>
        </div>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSet(formRef)"> 确认 </el-button>
      </div>
    </template>
    <!-- 删除资产 -->
  </el-dialog>
  <el-dialog v-model="DeletedialogVisible" title="警告" width="500" center>
    <span> 确定删除该资产吗？ </span>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="DeletedialogVisible = false">否</el-button>
        <el-button type="danger" @click="setDeleteCi"> 是 </el-button>
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
import {
  Search,
  ArrowRight,
  Delete,
  Plus,
  Refresh,
} from "@element-plus/icons-vue";
import { reactive, inject, onBeforeMount, ref, computed } from "vue";
import type { AxiosInstance } from "axios";
import { usePage } from "../../hooks";

const { pag, search, formSize, resetForm } = usePage();
const http = inject<AxiosInstance>("http");
// 获取服务器信息
interface ServerInfoForm {
  ipadd_in: string;
  cpu: string;
  cpu_cores: number;
  cpu_count: number;
  disk: string;
  host_name: string;
  mem: number;
  os_kernel: string;
  sn: string;
  sysinfo: string;
}

const serverData = reactive<{ data: ServerInfoForm[] }>({ data: [] });

const getTooltipContent = (row) => {};

const getServerInfo = async (row) => {
  console.log(row);
  const hostname = row.name;
  const ipadd_in = row["Management IP"];
  console.log(hostname, ipadd_in);
  const response = await http.get("cmdb/serverinfo/postmachineinfo/", {
    params: { hostname, ipadd_in },
  });
  if (response.data.code) {
    ElMessage.error("获取该服务器信息失败");
  } else {
    serverData.data = response.data;
    console.log(CiFormData.data);
    var i = -1;
    for (const value of CiFormData.data) {
      console.log(value);
      console.log(value["name"].value);
      i++;
      if (
        value["name"].value === hostname &&
        value["Management IP"].value === ipadd_in
      ) {
        // console.log(i);
        console.log(serverData.data["mem"]);
        console.log(serverData.data["mem"].toString());
        CiFormData.data[i]["RAM"].value = serverData.data["mem"].toString();
        CiFormData.data[i]["CPU"].value = serverData.data["cpu"];
      }
    }
  }
};

// TODO 删除资产
const DeletedialogVisible = ref(false);
const deleteCiId = ref(0);
const deleteCiName = ref("");
const deleteCi = (row) => {
  // console.log(row.id);

  deleteCiId.value = row.id;
  deleteCiName.value = row.name;
  DeletedialogVisible.value = true;
};

const setDeleteCi = async () => {
  const response = await http.delete(`cmdb/cis/${deleteCiId.value}/`);
  // console.log(response);
  if (response.data.code) {
    ElMessage.error(response.data.message);
  } else {
    ElMessage.success(`删除资产${deleteCiName.value}成功`);
    DeletedialogVisible.value = false;
    getCis();
  }
};

// 嵌套添加
interface DomainItem {
  label: string;
  name: string;
  requried: boolean;
  value: string | ListItem[];
  fieldDef: DomainItem[];
}

const formRef = ref<FormInstance>();

const dynamicValidateForm = reactive<{
  domains: DomainItem[];
}>({
  domains: [],
});

const addDomain = (value) => {
  console.log(value);
  const name = value.type.split(":")[1];
  console.log(name);

  getNestFields(name, value);

  // addNestDataForm.domains.push({})
};

const getNestFields = async (name, domain) => {
  // console.log(name);
  domain.value = name;

  const response = await http.get("cmdb/citypes/getNestFields/", {
    params: { name },
  });

  const newFields = response.data.fields.map((field) => ({
    ...field,
    value: "",
  }));
  if (!Array.isArray(domain.fieldDef)) {
    domain.fieldDef = []; // 确保 fieldDef 是数组
  }

  // 将所有新字段添加到 fieldDef 中
  // const domains = [];
  // domains.push(newFields);
  // console.log(domain.fieldDef);

  domain.fieldDef.push(newFields);
  console.log(domain.fieldDef[0]);
};

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
        console.log(response.data);

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

const getFields = async (item, data = dynamicValidateForm) => {
  if (!item || item.length === 0) return;

  const id = item[item.length - 1];
  selectedCiTypeId.value = id;
  // console.log(id);
  try {
    const response = await http.get(`cmdb/citypes/${id}/`);
    selectCiTypeLabel.value = response.data.label;
    // console.log(response.data.fields);
    data.domains = response.data.fields.map((field) => ({
      ...field,
      value: "", // 初始化 value 属性
      fieldDef: [],
    }));
  } catch (error) {
    ElMessage.error("获取字段失败:", error);
  }
};

// 处理嵌套的 DomainItem
const extractValues = (items: DomainItem[]): Record<string, any> => {
  return items.reduce((acc, item) => {
    acc[item.name] = {};
    acc[item.name].value = item.value;
    if (item.fieldDef && item.fieldDef.length > 0) {
      acc[item.name].fieldDef = item.fieldDef;
    }
    return acc;
  }, {} as Record<string, any>);
};

const handleSet = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async (valid) => {
    if (valid) {
      try {
        // console.log(dynamicValidateForm.domains);
        const payload = extractValues(dynamicValidateForm.domains);
        // console.log(payload);

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

// 获取资产
interface CiForm {
  data: DynamicSizeListInstance;
}

const CiFormData = reactive<{ data: CiForm[] }>({ data: [] });

// 将CiForm中的对象中的value取出
const flattenData = computed(() => {
  return CiFormData.data.map((row) => {
    const flatRow: Record<string, any> = {};
    Object.keys(row).forEach((key) => {
      if (typeof row[key] === "object" && row[key] !== null) {
        flatRow[key] = row[key].value;
      } else {
        flatRow[key] = row[key];
      }
    });
    return flatRow;
  });
});

const getCis = async (page = 1) => {
  if (!page) page = 1;
  const response = await http.get("cmdb/cis/", {
    params: { page, search: search.data },
  });
  if (response.data.code) {
    ElMessage({
      message: response.data.message,
      type: "error",
    });
  } else {
    CiFormData.data = response.data.results;
    console.log(CiFormData.data);

    pag.total = response.data.pagination.total;
    pag.page = response.data.pagination.page;
    pag.size = response.data.pagination.size;
  }
};

const handleCurrentChange = (val: number) => {
  getCis(val);
};

// 计算表格列
const columns = reactive({});
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
  for (const key in maxFieldsRecord) {
    if (key !== "ci_typeId" && key !== "id") {
      columns[key] = { label: formatLabel(key) };
    }
  }
  console.log(1);

  return columns;
});

// 格式化标签
const formatLabel = (key: string): string => {
  return key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " ");
};

onBeforeMount(() => {
  getCis();
});
</script>

<style lang="less" scoped>
.demo-dynamic {
  margin: 20px;
}

.el-form-item .el-form-item {
  margin-bottom: 22px;
}
</style>