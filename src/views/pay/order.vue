<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button
        :loading="downloadLoading"
        v-waves
        class="filter-item"
        type="primary"
        icon="el-icon-link"
        @click="handleDownload"
      >
        导出表格
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
      ref="multipleTable"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55"> </el-table-column>

      <el-table-column label="订单号" align="center" width="80">
        <template slot-scope="{ row }">
          <span>{{ row.no }}</span>
        </template>
      </el-table-column>

      <el-table-column label="商品名称" align="center" width="250">
        <template slot-scope="{ row }">
          <p v-for="(item, index) in row.goods" :key="index">
            {{ item.title }}
          </p>
        </template>
      </el-table-column>

      <el-table-column label="订单类型" align="center" width="120">
        <template slot-scope="{ row }">
          <span>{{ row.type | ordertypeOptions }}</span>
        </template>
      </el-table-column>

      <el-table-column label="订单状态" align="center" width="120">
        <template slot-scope="{ row }">
          <el-tag
            :type="row.status == 'success' ? 'scuucess' : 'danger'"
            size="normal"
            >{{ row.status | orderstatusOptions }}</el-tag
          >
        </template>
      </el-table-column>

      <el-table-column label="原付 / 实付 (元)" width="170px" align="center">
        <template slot-scope="{ row }">
          <span style="color: #bbb">{{ row.price }}</span>
          <span>/</span>
          <span style="color: red">{{ row.total_price }}</span>
        </template>
      </el-table-column>

      <el-table-column label="支付方式" align="center" width="100">
        <template slot-scope="{ row }">
          <span>{{ row.pay_method | orderpayOptions }}</span>
        </template>
      </el-table-column>

      <el-table-column label="创建/支付时间" align="center" width="220">
        <template slot-scope="{ row }">
          <p>{{ row.created_time }}</p>
          <p>{{ row.pay_time }}</p>
        </template>
      </el-table-column>

      <el-table-column
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="{ row }">
             <el-popconfirm
            @onConfirm="handleDelete(row, $index)"
            confirm-button-text="删除"
            cancel-button-text="取消"
            icon="el-icon-info"
            icon-color="red"
            title="是否要删除该记录"
            style="margin-left: 10px"
            >
          <el-button type="danger" slot="reference" size="mini"> 删除 </el-button>
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
  </div>
</template>

<script>
import { fetchOrder,deleteOrder } from "@/api/pay";

import waves from "@/directive/waves"; // waves directive
import Tinymce from "@/components/Tinymce";
import Pagination from "@/components/Pagination"; // secondary package based on el-pagination
import { confirm } from "dropzone";

// arr to obj, such as { CN : "China", US : "USA" }
let ordertype = {
  default: "拼团",
  group: "组团",
};

let orderstatus = {
  fail: "失败",
  success: "成功",
  pendding: "待支付",
};

let orderpay = {
  wechat: "微信支付",
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
  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      num: 1,
      listQuery: {
        page: 1,
        limit: 20,
        title: undefined,
      },
      multipleSelection: [],
      downloadLoading: false,
    };
  },
  filters: {
    ordertypeOptions(val) {
      return ordertype[val];
    },
    orderstatusOptions(val) {
      return orderstatus[val];
    },
    orderpayOptions(val) {
      return orderpay[val];
    },
  },
  created() {
    this.getList();
  },
  methods: {
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    handleDetail(id) {
      console.log(id);
      this.$refs.detail.open(id);
    },
    getList() {
      this.listLoading = true;
      fetchOrder(this.listQuery).then((response) => {
        console.log(response);
        this.list = response.data.items;
        this.total = response.data.total;

        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false;
        }, 1.5 * 1000);
      });
    },
    // 表格导出
    handleDownload() {
      this.downloadLoading = true;
      import("@/vendor/Export2Excel").then((excel) => {
        const tHeader = [
          "订单号",
          "商品名称",
          "订单类型",
          "订单状态",
          "原付",
          "实付",
          "支付方式",
          "创建时间",
          "支付时间",
        ];
        const filterVal = [
          "no",
          "goods",
          "type",
          "status",
          "total_price",
          "price",
          "pay_method",
          "created_time",
          "pay_time",
        ];
        const list = this.multipleSelection.map(item=> {
          let o = {
              ...item
          }
          o.goods = item.goods.map(v => v.title).join(",");
          o.type = ordertype[item.type];
          o.status = orderstatus[item.status];
          o.pay_method = orderpay[item.pay_method];
          return o;
        });
        const data = this.formatJson(filterVal, list);
        excel.export_json_to_excel({
          header: tHeader,
          data,
        });
        this.downloadLoading = false;
      });
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map((v) =>
        filterVal.map((j) => {
          if (j === "timestamp") {
            return parseTime(v[j]);
          } else {
            return v[j];
          }
        })
      );
    },
    handleDelete(row, index) {
      deleteOrder(row).then((response) => {
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