<template>
  <div class="app-container">
    <el-row :gutter="20" style="margin-bottom: 20px">
      <el-col :span="6" :offset="0">
        <el-card shadow="never">
          <div slot="header">
            <span style="color: black">可用余额 (元)</span>
            <el-button
              type="primary"
              size="small"
              style="float: right"
              @click="handleCreate"
              >申请提现</el-button
            >
          </div>
          <!-- card body -->
          <span style="font-size: 20px; font-weight: bold">20.00</span>
        </el-card>
      </el-col>
      <el-col :span="6" :offset="0">
        <el-card shadow="never">
          <div slot="header">
            <span style="color: black">累计收入 (元)</span>
          </div>
          <!-- card body -->
          <span style="font-size: 20px; font-weight: bold">20.00</span>
        </el-card>
      </el-col>
      <el-col :span="6" :offset="0">
        <el-card shadow="never">
          <div slot="header">
            <span style="color: black">待结算金额 (元)</span>
          </div>
          <!-- card body -->
          <span style="font-size: 20px; font-weight: bold">{{
            detail.no_settle
          }}</span>
        </el-card>
      </el-col>
      <el-col :span="6" :offset="0">
        <el-card shadow="never">
          <div slot="header">
            <span style="color: black">冻结金额 (元)</span>
          </div>
          <!-- card body -->
          <span style="font-size: 20px; font-weight: bold">20.00</span>
        </el-card>
      </el-col>
    </el-row>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%"
    >
      <el-table-column label="交易时间" width="200px" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.created_time }}</span>
        </template>
      </el-table-column>
      <el-table-column label="提款账号" min-width="250px" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.account }}</span>
        </template>
      </el-table-column>
      <el-table-column label="开户人" align="center" width="110">
        <template slot-scope="{ row }">
          <span>{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="提现金额" width="150" align="center">
        <template slot-scope="{ row }">
          <span>¥{{ row.price }}</span>
        </template>
      </el-table-column>

      <el-table-column
        label="状态"
        align="center"
        width="230"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="{ row, $index }">
          <el-tag :type="row.status ? 'success' : 'danger'">
            {{ row.status | statusFilter }}
          </el-tag>
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

    <el-dialog title="提现" :visible.sync="dialogFormVisible">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="left"
        label-width="70px"
        style="width: 400px; margin-left: 50px"
      >
        <el-form-item label-width="79px" label="提现金额" prop="price">
          <el-input-number
            v-model="temp.price"
            :min="0"
            label="提现金额"
          ></el-input-number>
        </el-form-item>
        <el-form-item label-width="79px" label="提现账户" prop="payment_id">
          <el-select
            v-model="temp.payment_id"
            placeholder="请选择"
            style="width: 360px"
          >
            <el-option
              v-for="item in payments"
              :key="item.id"
              :label="item.bank"
              :value="item.id"
            >
              <span style="float: left">{{ item.bank }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">{{
                item.account
              }}</span>
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false"> 取消 </el-button>
        <el-button type="primary" @click="createData()"> 确定 </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { fetchAssets, fetchPayments, Cashout } from "@/api/pay";

import waves from "@/directive/waves"; // waves directive
import { parseTime } from "@/utils";
import Tinymce from "@/components/Tinymce";
import Pagination from "@/components/Pagination"; // secondary package based on el-pagination

// arr to obj, such as { CN : "China", US : "USA" }
let statusOptions = {
  0: "审核中",
  1: "提现成功",
  2: "提现失败",
};

export default {
  name: "ComplexTable",
  components: {
    Pagination,
    Tinymce,
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
      detail: {
        no_settle: 21.12,
      },
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
      payments: [],
      value: "",
      statusOptions,
      temp: {
        price: 0,
        payment_id: null,
      },
      dialogFormVisible: false,
      rules: {
        price: [
          {
            trigger: "blur",
            validator: (rule, value, callback) => {
              if (!value) {
                return callback(new Error("提现金额必填"));
              }
              if (value > this.detail.no_settle) {
                return callback(
                  new Error("提现金额不能大于" + this.detail.no_settle + "元")
                );
              }
              callback();
            },
          },
        ],
        payment_id: [
          {
            required: true,
            message: "提现账户不能为空",
            trigger: "change",
          },
        ],
      },
    };
  },
  created() {
    this.getList();
    fetchPayments().then((res) => {
      this.payments = res.data.items;
    });
  },
  methods: {
    getList() {
      this.listLoading = true;
      fetchAssets(this.listQuery).then((response) => {
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
    handleModifyStatus(row, status) {
      this.$message({
        message: "操作Success",
        type: "success",
      });
      row.status = status;
    },
    resetTemp() {
      this.temp = {
        price: 0,
        payment_id: null,
      };
    },
    handleCreate() {
      this.resetTemp();
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
    },
    createData() {
      this.$refs["dataForm"].validate((valid) => {
        if (valid) {
          Cashout(this.temp).then((res) => {
            console.log(res);
            this.list.unshift(res.data);
            this.dialogFormVisible = false;
            this.$notify({
              title: "Success",
              message: "申请成功，等待审核",
              type: "success",
              duration: 2000,
            });
          });
        }
      });
    },
    handleDelete(row, index) {
      deleteMedia(row).then((response) => {
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
  },
};
</script>
<style scoped>
.filter-container {
  display: flex;
  justify-content: space-between;
}
</style>