<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button
        class="filter-item"
        style="margin-left: 10px"
        type="primary"
        icon="el-icon-edit"
        @click="handleCreate"
      >
        新增收款账号
      </el-button>
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%"
    >
      <el-table-column label="账户" width="450px">
        <template slot-scope="{ row }">
          <span>{{ row.account }}</span>
        </template>
      </el-table-column>
      <el-table-column label="开户人" align="center" width="135">
        <template slot-scope="{ row }">
          <span>{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="开户行">
        <template slot-scope="{ row }">
          <span>{{ row.path }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        width="230"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="{ row, $index }">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-popconfirm
            @onConfirm="handleDelete(row, $index)"
            confirm-button-text="删除"
            cancel-button-text="取消"
            icon="el-icon-info"
            icon-color="red"
            title="是否要删除该记录"
            style="margin-left: 10px"
            ><el-button
              v-if="row.status != 'deleted'"
              size="mini"
              type="danger"
              slot="reference"
            >
              删除
            </el-button>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="getList"
    />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="left"
        label-width="70px"
        style="width: 500px; margin-left: 50px"
      >
        <el-form-item label-width="79px" label="账号" prop="account">
          <el-input v-model="temp.account" />
        </el-form-item>
        <el-form-item label-width="79px" label="省市区">
          <v-distpicker
            :province="temp.province"
            :city="temp.city"
            :area="temp.area"
            @province="handleDistPicker($event, 'province')"
            @city="handleDistPicker($event, 'city')"
            @area="handleDistPicker($event, 'area')"
          ></v-distpicker>
        </el-form-item>
        <el-form-item label-width="79px" label="详细地址" prop="path">
          <el-input v-model="temp.path" />
        </el-form-item>
        <el-form-item label-width="79px" label="所属银行" prop="bank">
          <el-select v-model="temp.bank" placeholder="请选择">
            <el-option
              v-for="item in bank"
              :key="item.value"
              :label="item.text"
              :value="item.text"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label-width="79px" label="姓名" prop="name">
          <el-input v-model="temp.name" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false"> 取消 </el-button>
        <el-button
          type="primary"
          @click="dialogStatus === 'create' ? createData() : updateData()"
        >
          确定
        </el-button>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="dialogPvVisible" title="Reading statistics">
      <el-table
        :data="pvData"
        border
        fit
        highlight-current-row
        style="width: 100%"
      >
        <el-table-column prop="key" label="Channel" />
        <el-table-column prop="pv" label="Pv" />
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogPvVisible = false"
          >Confirm</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {
  fetchPayments,
  createPayment,
  updatePayment,
  deletePayment,
} from "@/api/pay";
import { getBank } from "@/utils/bank";
import VDistpicker from "v-distpicker";

import waves from "@/directive/waves"; // waves directive
import { parseTime } from "@/utils";
import Pagination from "@/components/Pagination"; // secondary package based on el-pagination

// arr to obj, such as { CN : "China", US : "USA" }
let statusOptions = {
  0: "已下架",
  1: "已上架",
};

export default {
  name: "ComplexTable",
  components: {
    Pagination,
    VDistpicker,
  },
  directives: {
    waves,
  },
  filters: {
    statusFilter(status) {
      return statusOptions[status];
    },
  },
  data() {
    return {
      bank: [],
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      num: 1,
      listQuery: {
        page: 1,
        limit: 20,
        status: undefined,
        title: undefined,
      },
      statusOptions,
      showReviewer: false,
      temp: {
        account: "",
        area: "",
        bank: "",
        city: "",
        name: "",
        path: "",
      },
      dialogFormVisible: false,
      dialogStatus: "",
      textMap: {
        update: "Edit",
        create: "增加",
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
        account: [
          {
            required: true,
            message: "账号不能为空",
            trigger: "blur",
          },
        ],
        bank: [
          {
            required: true,
            message: "所属银行不能为空",
            trigger: "change",
          },
        ],
        name: [
          {
            required: true,
            message: "开户人不能为空",
            trigger: "blur",
          },
        ],
        path: [
          {
            required: true,
            message: "详细地址不能为空",
            trigger: "blur",
          },
        ],
      },
    };
  },
  created() {
    this.getList();
    this.bank = getBank();
  },
  methods: {
    handleDistPicker(e, k) {
      this.temp[k] = e.value;
    },
    getList() {
      this.listLoading = true;
      fetchPayments(this.listQuery).then((response) => {
        console.log(response);
        this.list = response.data.items;
        this.total = response.data.total;

        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false;
        }, 1.5 * 1000);
      });
    },
    handleFilter() {
      this.listQuery.page = 1;
      this.getList();
    },
    resetTemp() {
      this.temp = {
        account: "",
        area: "",
        bank: "",
        city: "",
        name: "",
        path: "",
      };
    },
    handleCreate() {
      this.resetTemp();
      this.dialogStatus = "create";
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
    },
    createData() {
      this.$refs["dataForm"].validate((valid) => {
        if (valid) {
          if (
            this.temp.provice == "" ||
            this.temp.city == "" ||
            this.temp.area == ""
          ) {
            return this.$message({
              message: "省市区不能为空",
              type: "error",
            });
          }
          createPayment(this.temp).then(() => {
            this.list.unshift(this.temp);
            this.dialogFormVisible = false;
            this.$notify({
              title: "Success",
              message: "Created Successfully",
              type: "success",
              duration: 2000,
            });
          });
        }
      });
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row); // copy obj
      this.temp.timestamp = new Date(this.temp.timestamp);
      this.dialogStatus = "update";
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
    },
    updateData() {
      this.$refs["dataForm"].validate((valid) => {
        if (valid) {
          if (
            this.temp.province == "" ||
            this.temp.city == "" ||
            this.temp.area == ""
          ) {
            return this.$message({
              message: "省市区不能为空",
              type: "error",
            });
          }
          const tempData = Object.assign({}, this.temp);
          tempData.timestamp = +new Date(tempData.timestamp); // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 1512031311464
          updatePayment(tempData).then(() => {
            const index = this.list.findIndex((v) => v.id === this.temp.id);
            this.list.splice(index, 1, this.temp);
            this.dialogFormVisible = false;
            this.$notify({
              title: "Success",
              message: "Update Successfully",
              type: "success",
              duration: 2000,
            });
          });
        }
      });
    },
    handleDelete(row, index) {
      deletePayment(row).then((response) => {
        this.$notify({
          title: "提示",
          message: "删除成功",
          type: "success",
          duration: 2000,
        });
        this.list.splice(index, 1);
      });
      this.list.splice(index, 1);
    },
    handleFetchPv(pv) {
      fetchPv(pv).then((response) => {
        this.pvData = response.data.pvData;
        this.dialogPvVisible = true;
      });
    },
  },
};
</script>
<style scoped>
.filter-container {
  display: flex;
  justify-content: space-between;
}
</style>