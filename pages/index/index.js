// 0 引入用来发送请求的方法   一定要把路径补全
import { request } from "../../request/index.js";
Page({
    data: {
        //轮播图数组
        swiperList: [],
        // 分类导航数组
        catesList: [],
        // 楼层数据
        floorList: []
    },
    //页面开始加载 就会触发
    onLoad: function(options) {
        this.getSwiperList();
        this.getCatesList();
        this.getFloorList();
    },
    //获取轮播图数据
    getSwiperList() {
        // 1 发送异步请求获取轮播图数据   优化手段：通过es6的promise技术解决
        // wx.request({
        //     url: '/home/swiperdata',
        //     success: (result) => {
        //         this.setData({
        //             swiperList: result
        //         })
        //     }
        // });
        request({ url: "/home/swiperdata" })
            .then(result => {
                // console.log(result);
                this.setData({
                    swiperList: result
                })
            })
    },
    //获取分类导航数据
    getCatesList() {
        request({ url: "/home/catitems" })
            .then(result => {
                this.setData({
                    catesList: result
                })
            })
    },
    // 获取楼层数据
    getFloorList() {
        request({ url: "/home/floordata" })
            .then(result => {
                this.setData({
                    floorList: result
                })
            })
    }

});