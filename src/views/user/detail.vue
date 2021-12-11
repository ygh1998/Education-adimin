<template>
  <div>
    <el-dialog
      title="查看详情"
      :visible.sync="dialogVisible"
      width="80%"
      top="5vh"
    >
      <el-container>
        <el-header style="height: 15vh">
          <el-row :gutter="24">
            <el-col :span="6"
              ><p>ID： {{ id }}</p></el-col
            >
            <el-col :span="6"
              ><p>用户名：{{ user.username }}</p></el-col
            >
            <el-col :span="6"
              ><p>昵称： {{ user.nickname || "未设置" }}</p></el-col
            >
            <el-col :span="6"
              ><p>手机号： {{ user.phone }}</p></el-col
            >
            <el-col :span="6"
              ><p>锁定： {{ user.status ? "否" : "是" }}</p></el-col
            >
            <el-col :span="6"
              ><p>会员： {{ user.user_level }}</p></el-col
            >
            <el-col :span="6"
              ><p>会员到期时间：{{ user.user_level_expire }}</p></el-col
            >
            <el-col :span="6"
              ><p>注册时间：{{ user.created_time }}</p></el-col
            >
          </el-row>
        </el-header>
        <el-main style="height: 55vh">
          <el-tabs v-model="activeName" @tab-click="handleClick">
            <el-tab-pane
              :label="item.label"
              :name="item.name"
              v-loading="listLoading"
              v-for="(item, index) in tabs"
              :key="index"
            >
              <el-table :data="list" height="250" border style="width: 100%">
                <el-table-column
                  v-for="(t, tI) in item.ths"
                  :key="tI"
                  :prop="t.prop"
                  :label="t.label"
                >
                </el-table-column>
              </el-table>
            </el-tab-pane>
          </el-tabs>
        </el-main>
        <el-footer>
          <pagination
            :total="form.total"
            :page.sync="form.page"
            :limit.sync="form.limit"
            @pagination="getData"
            style="padding: 0; padding-top: 10px; margin: 0"
            layout="total,prev,pager,next"
          />
        </el-footer>
      </el-container>
    </el-dialog>
  </div>
</template>

<script>
import Pagination from "@/components/Pagination"; // secondary package based on el-pagination
import {
  fetchDetail,
  fetchDetailCourse,
  fetchDetailColumn,
  fetchDetailOrder,
  fetchDetailHistory,
  fetchDetailComment,
} from "@/api/user";
let statusOptions = {
  success: "成功",
  pendding: "待支付",
  fail: "失败",
};

let typeOptions = {
  video: '视频',
  media: '图文',
  column: '专栏',
  audio: '音频'
}
export default {
  components: { Pagination },
  data() {
    return {
      activeName: "course",
      dialogVisible: false,
      id: 0,
      form: {
        page: 1,
        limit: 10,
        total: 100,
      },
      user: {
        avatar: "",
        created_time: "",
        id: 0,
        nickname: "",
        phone: "",
        status: 0,
        user_level: "",
        user_level_expire: "",
        username: "",
      },
      list: [],
      listLoading: false,
      tabs: [
        {
          label: "课程订阅",
          name: "course",
          ths: [
            { prop: "title", label: "课程标题" },
            {
              prop: "price",
              label: "购买价格",
            },
            {
              prop: "created_time",
              label: "购买时间",
            },
          ],
          request: fetchDetailCourse,
        },
        {
          label: "专栏订阅",
          name: "column",
          ths: [
            {
              prop: "title",
              label: "专栏标题",
            },
            {
              prop: "price",
              label: "购买价格",
            },
            {
              prop: "created_time",
              label: "购买时间",
            },
          ],
          request: fetchDetailColumn,
        },
        {
          label: "订单记录",
          name: "order",
          ths: [
            {
              prop: "id",
              label: "ID",
            },
            {
              prop: "no",
              label: "订单号",
            },
            {
              prop: "price",
              label: "购买价格",
            },
            {
              prop: "status",
              label: "状态",
            },
            {
              prop: "title",
              label: "商品",
            },
            {
              prop: "created_time",
              label: "购买时间",
            },
          ],
          request: fetchDetailOrder,
        },
        {
          label: "观看历史",
          name: "history",
          ths: [
            {
              prop: "title",
              label: "课程标题",
            },
            {
              prop: "type",
              label: "课程类型",
            },
            {
              prop: "total_time",
              label: "学习时长",
            },
          ],
          request: fetchDetailHistory,
        },
        {
          label: "用户评论",
          name: "comment",
          ths: [
            {
              prop: "content",
              label: "评论内容",
            },
            {
              prop: "created_time",
              label: "评论时间",
            },
            {
              prop: "title",
              label: "课程标题",
            },
            {
              prop: "type",
              label: "类型",
            },
          ],
          request: fetchDetailComment,
        },
      ],
    };
  },
  computed: {
    currentTab() {
      return this.tabs.find((item) => item.name == this.activeName);
    },
  },
  methods: {
    getData() {
      this.listLoading = true
      this.list = [];
      this.currentTab.request(this.form).then((res) => {
        this.list = res.data.items.map((item) => {
          if (this.currentTab.name == "order") {
            item.status = statusOptions[item.status]
          }else if(this.currentTab.name == 'history' || this.currentTab.name == 'comment') {
            item.type  = typeOptions[item.type]
          }
          return item
        });
        this.form.total = res.data.total;
        setTimeout(()=> {
          this.listLoading = false
        },200)
      });
    },
    open(id) {
      this.id = id;
      fetchDetail({
        id: this.id,
      }).then((res) => {
        console.log(res);
        this.user = res.data.user;
      });
      this.getData();
      this.dialogVisible = true;
    },
    handleClick(tab, event) {
      this.form.page = 1;
      this.getData();
      console.log(tab, event);
    },
  },
};
</script>

<style>
</style>