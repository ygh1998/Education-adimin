<template>
  <div class="app-container">
    <div class="filter-container">
      <el-dropdown>
        <el-button type="danger" size="small">
          黑名单设置<i class="el-icon-arrow-down el-icon--right"></i>
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item @click.native="changeCommentStatus(true)">禁止评论</el-dropdown-item>
          <el-dropdown-item @click.native="changeAccessStatus(true)">禁止访问</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      <div>
        <el-input
          v-model="listQuery.title"
          placeholder="用户名"
          style="width: 200px"
          class="filter-item"
          @keyup.enter.native="handleFilter"
        />

        <el-button
          v-waves
          class="filter-item"
          type="primary"
          icon="el-icon-search"
          @click="handleFilter"
        >
          搜索
        </el-button>
      </div>
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

      <el-table-column label="用户" min-width="150px">
        <template slot-scope="{ row }">
          <div style="display: flex">
            <img
              :src="row.user.avatar"
              width="50px"
              height="50px"
              alt=""
              style="border-radius: 50%"
            />
            <div
              style="
                margin-left: 10px;
                display: flex;
                align-items: center;
                justify-content: space-between;
              "
            >
              <span>{{ row.user.username }}</span>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="消费总额" align="center" width="95">
        <template slot-scope="{ row }">
          <span>{{ row.total_consume }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="150px" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.created_time }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        width="280"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="{ row, $index }">
          <el-button
            type="primary"
            size="mini"
            @click="handleDetail(row.user.id)"
          >
            详情
          </el-button>
          <el-button size="mini" type="success" style="margin-right: 10px">
            上架
          </el-button>
          <el-dropdown>
            <el-button type="danger" size="mini">
              黑名单设置<i class="el-icon-arrow-down el-icon--right"></i>
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item @click.native="changeCommentStatus(row.user.id)"
                >禁止评论</el-dropdown-item
              >
              <el-dropdown-item @click.native="changeAccessStatus(row.user.id)">禁止访问</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
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

    <detail ref="detail"></detail>
  </div>
</template>

<script>
import { fetchList, fetchUserComment, fetchUserAccess } from "@/api/user";
import detail from "./detail.vue";

import waves from "@/directive/waves"; // waves directive
import Tinymce from "@/components/Tinymce";
import Pagination from "@/components/Pagination"; // secondary package based on el-pagination
import { confirm } from "dropzone";

// arr to obj, such as { CN : "China", US : "USA" }

export default {
  name: "ComplexTable",
  components: {
    Pagination,
    Tinymce,
    detail,
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
      multipleSelection: []
    };
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
      fetchList(this.listQuery).then((response) => {
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
    changeCommentStatus(ids) {
      if(typeof ids == 'boolean' && this.multipleSelection.length == 0) {
        return this.$message({
            type: "error",
            message: "请先选中需要操作的用户",
          });
      }
      let id = typeof ids == 'boolean' ? this.multipleSelection.map(item=>item.user.id) : ids
      let allText = typeof ids == 'boolean' ? '选中' : '当前'
      this.$confirm(`是否要禁止${allText}用户评论?`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        fetchUserComment({
          id,
          status: 0,
        }).then((res) => {
          this.$message({
            type: "success",
            message: "设置成功!",
          });
          this.$refs.multipleTable.clearSelection()
        });
      });
    },
    changeAccessStatus(ids) {
       if(typeof ids == 'boolean' && this.multipleSelection.length == 0) {
        return this.$message({
            type: "error",
            message: "请先选中需要操作的用户",
          });
      }
      let id = typeof ids == 'boolean' ? this.multipleSelection.map(item=>item.user.id) : ids
      let allText = typeof ids == 'boolean' ? '选中' : '当前'
      this.$confirm(`是否要禁止${allText}用户访问?`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        fetchUserAccess({
          id,
          status: 0,
        }).then((res) => {
          this.$message({
            type: "success",
            message: "设置成功!",
          });
          this.$refs.multipleTable.clearSelection()
        });
      });
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