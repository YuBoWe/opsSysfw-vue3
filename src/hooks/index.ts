import {
  FormInstance,
} from "element-plus";


export default function useHooks() {
  const resetForm = (formEl: FormInstance | undefined) => {
    if (!formEl) return;
    formEl.resetFields();
  };
  return resetForm;
}

