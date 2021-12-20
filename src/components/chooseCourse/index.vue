<template>
  <div>
    <el-dialog
      title="选择课程"
      :visible.sync="dialogVisible"
      width="70%"
      top="5vh"
      :modal-append-to-body="false"
      append-to-body
    >
      <el-container style="height: 71vh">
        <el-header style="margin-top: -30px; margin-bottom: -30px">
          <div style="display: flex; justify-content: flex-end">
            <el-input
              v-model="form.title"
              placeholder="标题"
              size="small"
              style="width: 160px; margin-right: 5px"
              @change="titleChange()"
            ></el-input>
            <el-button type="primary" size="small" @click="search()"
              >搜索</el-button
            >
          </div>
        </el-header>
        <el-container style="margin-top: 10px">
          <el-aside
            width="200px"
            style="
              height: 60vh;
              background: #fbfbfb;
              border: 1px solid #eee;
              padding: 0;
              overflow-y: auto;
            "
          >
            <el-menu
              mode="vertical"
              default-active="1"
              @select="onAsideSelect"
              style="background:#fbfbfb border:0px;"
            >
              <el-menu-item
                :index="item.index"
                v-for="(item, index) in menus"
                :key="index"
                >{{ item.name }}</el-menu-item
              >
            </el-menu>
          </el-aside>
          <el-container>
            <el-main style="height: 60vh; padding: 0; overflow-y: auto">
              <el-table
                :key="tableKey"
                ref="multipleTable"
                @selection-change="handleSelectionChange"
                v-loading="listLoading"
                :data="list"
                border
                fit
                highlight-current-row
                style="width: 100%"
              >
                <el-table-column type="selection" width="55"> </el-table-column>

                <el-table-column label="内容" min-width="150px">
                  <template slot-scope="{ row }">
                    <div style="display: flex">
                      <img
                        :src="row.cover"
                        width="120px"
                        height="60px"
                        alt=""
                      />
                      <div
                        style="
                          margin-left: 10px;
                          display: flex;
                          flex-direction: column;
                          justify-content: space-between;
                        "
                      >
                        <span>{{ row.title }}</span>
                        <span style="color: red">¥ {{ row.price }}</span>
                      </div>
                    </div>
                  </template>
                </el-table-column>
              </el-table>
            </el-main>
            <el-footer>
              <pagination
                style="padding: 0px; padding-top: 10px; margin: 0px"
                :total="total"
                :page.sync="form.page"
                :limit.sync="form.limit"
                @pagination="getData"
                layout="total,prev,pager,next"
              />
            </el-footer>
          </el-container>
        </el-container>
      </el-container>
      <span slot="footer" class="dialog-footer">
        <el-button @click="closeVisible">取 消</el-button>
        <el-button type="primary" @click="confirm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
let M = {};

function importAll(r) {
  r.keys().forEach((key) => (M[key] = r(key)));
}

importAll(require.context("@/api/", true, /\.js$/));
import Pagination from "@/components/Pagination"; // secondary package based on el-pagination
export default {
  data() {
    return {
      key: "media",
      form: {
        title: "",
        page: 1,
        limit: 10,
      },
      list: [],
      menus: [
        {
          name: "图文",
          index: "media",
        },
        {
          name: "音频",
          index: "audio",
        },
        {
          name: "视频",
          index: "video",
        },
      ],
      tableKey: 0,
      total: 0,
      listLoading: true,
      dialogVisible: false,
      multipleSelection: [],
      callback: null,
      limit : -1
    };
  },
  components: {
    Pagination,
  },
  methods: {
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    titleChange() {},
    search() {
      this.form.page = 1
      this.getData()
    },
    getData() {
      this.listLoading = true;
      let fetchList = M[`./${this.key}.js`].fetchList;
      fetchList(this.form).then((response) => {
        this.list = response.data.items;
        this.total = response.data.total;
        this.listLoading = false;
      });
    },
    onAsideSelect(e) {
      this.key = e;
      this.form.page = 1;
      this.getData();
    },
    openDialog(callback,limit = -1) {
      this.dialogVisible = true;
      this.getData();
      this.callback = callback
      this.limit = limit
      
    },
    closeVisible() {
      this.dialogVisible = false;
    },
    confirm() {
      if(this.multipleSelection.length === 0) {
        return this.$message.error('至少选择一个')
      }
      if(this.limit != -1 && this.multipleSelection.length > this.limit) {
        return this.$message.error(`最好可以选中${limit}个`)
      } 
      this.callback(this.multipleSelection)
      this.closeVisible();
      // 清空选中
      this.$refs.multipleTable.clearSelection()
    },
  },
};
</script>

<style scoped>
h1 {
  display: flex;
}
</style>