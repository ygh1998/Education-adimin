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
        新增子页面
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
      @sort-change="sortChange"
    >

      <el-table-column label="页面内容" min-width="150px">
        <template slot-scope="{ row }">
          <span>{{ row.title }}</span>   
          <i v-if="row.type=='index'" class="el-icon-s-home" style="color:#409eff; margin-left:5px;"></i>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="200px" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.created_time }}</span>
        </template>
      </el-table-column>
      <el-table-column label="更新时间" width="200px" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.updated_time }}</span>
        </template>
      </el-table-column>
      
      <el-table-column
        label="操作"
        align="center"
        width="230"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="{ row, $index }">
          <el-button type="warning" size="mini" @click="openDetail(row.id)">
            装修
          </el-button>
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
              :disabled="!!row.isdefault"
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

    <el-dialog

      :title="textMap[dialogStatus]"
      :visible.sync="dialogFormVisible"
    >
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="left"
        label-width="70px"
        style="width: 400px; margin-left: 50px"
      >
        <!-- <el-form-item label="Type" prop="type">
          <el-select
            v-model="temp.type"
            class="filter-item"
            placeholder="Please select"
          >
            <el-option
              v-for="item in calendarTypeOptions"
              :key="item.key"
              :label="item.display_name"
              :value="item.key"
            />
          </el-select>
        </el-form-item> -->
        <el-form-item label-width="79px" label="标题" prop="title">
          <el-input v-model="temp.title" />
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
import { fetchMobileList, createMobile,updateMobile,deleteMobile } from "@/api/visualization";

import waves from "@/directive/waves"; // waves directive
import { parseTime } from "@/utils";
import Tinymce from "@/components/Tinymce";
import Pagination from "@/components/Pagination"; // secondary package based on el-pagination

// arr to obj, such as { CN : "China", US : "USA" }

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
      },
      showReviewer: false,
      temp: {
        id: undefined,
        title: "",
        price: 0,
        status: 1,
        try: "",
        content: "",
        cover: "",
      },
      dialogFormVisible: false,
      dialogStatus: "",
      textMap: {
        update: "编辑",
        create: "新增",
      },
      dialogPvVisible: false,
      dialogImageUrl: "",
      dialogVisible: false,
      pvData: [],
      rules: {
        title: [
          {
            required: true,
            message: "请填写标题",
            trigger: "blur",
          },
        ]
      },
    };
  },
  created() {
    this.getList();
  },
  methods: {
    getList() {
      this.listLoading = true;
      fetchMobileList(this.listQuery).then((response) => {
        console.log(response);
        this.list = response.data.items;
        this.total = response.data.total;

        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false;
        }, 1.5 * 1000);
      });
    },
    handleModifyStatus(row, status) {
      this.$message({
        message: "操作Success",
        type: "success",
      });
      row.status = status;
    },
    sortChange(data) {
      const { prop, order } = data;
      if (prop === "id") {
        this.sortByID(order);
      }
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        title: "",
        price: 0,
        status: 1,
        try: "",
        content: "",
        cover: "",
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
          this.temp.id = parseInt(Math.random() * 100) + 1024; // mock a id
          this.temp.author = "vue-element-admin";
          createMobile(this.temp).then(() => {
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
          const tempData = Object.assign({}, this.temp);
          tempData.timestamp = +new Date(tempData.timestamp); // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 1512031311464
          updateMobile(tempData).then(() => {
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
      deleteMobile(row).then((response) => {
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
    openDetail(id) {
      this.$router.push({
        name: 'mobileEdit',
        query: {
          id
        }
      })
    }

  },
};
</script>
<style scoped>
.filter-container {
  display: flex;
  justify-content: space-between;
}
</style>