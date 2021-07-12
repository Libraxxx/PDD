/*
  1 点击“+” 触发tap点击事件
    （1）调用小程序内置的选择图片的api
    （2）获取到图片的路径  数组
    （3）把图片路径 存到data变量中
    （4）页面可以根据 图片数组进行循环显示 自定义组件
  2 点击自定义图片 组件
    （1）获取被点击的元素的索引
    （2）获取data中图片数组
    （3）根据索引 数组中删除对应元素
    （4）把数组重新设置回data中
  3 点击提交按钮
    （1）获取文本域的内容-----类似输入框的获取
          i data中定义变量表示输入框的内容
          ii 文本域绑定输入事件，事件触发的时候，把输入框的值存入到变量中
    （2）对这些内容进行合法性验证
    （3）验证通过，用户选择的图片上传到专门的图片服务器 返回图片外网链接
          i 遍历图片数组
          ii 挨个上传
          iii 自己维护图片数组，存放图片上传后的外网的链接
    （4）服务器和外网的图片路径 一起提交到服务器-----前端模拟，并不会发送请求到后台
    （5）清空当前页面
    （6）返回上一页
*/
Page({
    data: {
        tabs: [{
                id: 0,
                value: "体验问题",
                isActive: true
            },
            {
                id: 1,
                value: "商品/商家投诉",
                isActive: false
            }
        ],
        // 被选中的图片路径数组
        chooseImgs: [],
        // 文本域的内容
        textVal: ""
    },
    // 外网图片的路径数组
    UpLoadImgs: [],

    // 标题点击事件 从子组件传递过来的
    handleTabsItemChange(e) {
        // 1 获取被点击的标题索引
        const { index } = e.detail;
        // 2 修改原数组
        let { tabs } = this.data;
        tabs.forEach((v, i) => i === index ? v.isActive = true : v.isActive = false);
        // 3 赋值到data中
        this.setData({
            tabs: tabs
        })
    },
    // 点击“+”选择图片
    handleChooseImg() {
        // 调用小程序内置的选择图片api
        wx.chooseImage({
            // 同时选中的图片的数量
            count: 9,
            // 图片格式： 原图 压缩
            sizeType: ['original', 'compressed'],
            // 图片来源：相册 照相机
            sourceType: ['album', 'camera'],
            success: (result) => {
                this.setData({
                    // 图片数组 进行拼接
                    chooseImgs: [...this.data.chooseImgs, ...result.tempFilePaths]
                })
            }
        });

    },
    //  点击自定义图片组件
    handleRemoveImg(e) {
        // 获取被点击的组件的索引
        const { index } = e.currentTarget.dataset;
        // 获取data中的图片数组
        let { chooseImgs } = this.data;
        chooseImgs.splice(index, 1);
        this.setData({
            chooseImgs
        })

    },
    // 文本域的输入事件
    handleTextInput(e) {
        this.setData({
            textVal: e.detail.value
        })
    },
    // 提交按钮的点击事件
    handleFormSubmit() {
        // 1 获取文本域的内容 图片数组
        const { textVal, chooseImgs } = this.data;
        // 2 合法性验证
        if (!textVal.trim()) {
            // 不合法
            wx.showToast({
                title: '输入不合法',
                icon: 'none',
                mask: true,
            });
            return;
        }
        // 3 准备上传图片到专门的服务器
        // 上传文件的api 不支持多个文件同时上传  遍历数组，挨个上传
        // 显示正在等待
        wx.showLoading({
            title: "正在上传中",
            mask: true,
            success: (result) => {

            },
            fail: () => {},
            complete: () => {}
        });

        // 判断有没有需要上传的图片数组
        if (chooseImgs.length != 0) {
            chooseImgs.forEach((v, i) => {
                wx.uploadFile({
                    // 上传到哪里
                    url: 'https://img.coolcr.cn/api/upload',
                    // 上传文件路径
                    filePath: v,
                    // 上传文件名称  后台来获取文件
                    name: 'image',
                    // 顺带的文本信息
                    FormData: {},
                    success: (result) => {
                        let url = JSON.parse(result.data).url;
                        this.UpLoadImgs.push(url);

                        // 所有图片都上传才触发
                        if (i === chooseImgs.length - 1) {
                            // 关闭弹窗
                            wx.hideLoading();

                            console.log("把文本内容和外网的图片数组提交到后台中");
                            // 提交都成功了 重置页面
                            this.setData({
                                textVal: "",
                                chooseImgs: []
                            });
                            // 返回上一个页面
                            wx.navigateBack({
                                delta: 1
                            });

                        }

                    }
                })
            })
        } else {
            wx.hideLoading();
            console.log("只是提交文本");
            // 返回上一个页面
            wx.navigateBack({
                delta: 1
            });
        }
    }
})