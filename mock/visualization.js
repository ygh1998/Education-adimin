const { Random } = require('mockjs')
const Mock = require('mockjs')

let List = [{
    id: 1,
    title: "首页",
    created_time: "@now",
    updated_time: "@now",
    isdefault: 1,
    type: "index"
}, {
    id: 2,
    title: "演示列表",
    created_time: "@now",
    updated_time: "@now",
    isdefault: 0,
    type: "common"
}]


module.exports = [{
        url: '/vue-element-admin/visualization/mobile/list',
        type: 'get',
        response: config => {
            const { status, title, page = 1, limit = 20, sort } = config.query

            let mockList = List

            const pageList = mockList.filter((item, index) => index < limit * page && index >= limit * (page - 1))

            return {
                code: 20000,
                data: {
                    total: mockList.length,
                    items: pageList
                }
            }
        }
    },

    {
        url: '/vue-element-admin/visualization/mobile/create',
        type: 'post',
        response: _ => {
            return {
                code: 20000,
                data: 'success'
            }
        }
    },

    {
        url: '/vue-element-admin/visualization/mobile/update',
        type: 'post',
        response: _ => {
            return {
                code: 20000,
                data: 'success'
            }
        }
    },

    {
        url: '/vue-element-admin/visualization/mobile/delete',
        type: 'post',
        response: _ => {
            return {
                code: 20000,
                data: 'success'
            }
        }
    }
]