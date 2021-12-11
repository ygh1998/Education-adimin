<template>
    <div class="search-bar-box">
        <div class="search-bar">
            <i class="el-icon-search"></i>
            <span>{{placeholder}}</span>
        </div>
    </div>
</template>
<script>
export default {
    props: {
        placeholder :{
            type: String,
            default: ''
        }
    }
}
</script>
<style scoped>
.search-bar-box {
    padding: 0 10px;
}

.search-bar {
    display: flex;
    justify-content: center;
    align-items: center;
    background: rgb(248, 248, 248);
    padding: 10px;
    color: #808080;
    border: 1px solid #eeeeee;
}

.search-bar i {
    margin-right: 5px;
    font-size: 20px;
}
</style>