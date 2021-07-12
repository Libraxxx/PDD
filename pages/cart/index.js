/*
  1 获取用户的收货地址
    (1)绑定点击事件
    (2)调用小程序内置api 获取用户的收货地址
  2 获取用户对小程序所授予获取地址的权限状态 scope
    (1)假设用户点击获取收货地址的提升框  确定 authSetting scope.address
        scope值 true--- 直接调用 获取收货地址
    (2)假设用户从来没有调用过 收货地址的api
        scope undefined--- 直接调用 获取收货地址
    (3)假设用户点击获取收货地址的提升框  取消
        scope值 false
          i 诱导用户自己打开授权设置页面(wx.openSetting),当用户重新给与获取地址权限时
          ii 获取收货地址 
    (4)把获取到的地址 存入到 本地存储中
  3 页面加载完毕
    0 onLoad onShow
    (1)获取本地存储中的地址数据
    (2)把数据设置给data中的一个变量
  4 onShow
    (0) 回到商品详情页面，第一次添加商品的时候，手动添加了属性
        i num=1
        ii checked = true
    (1)获取缓存中的购物车数组
   （2）把购物车数据填充到data中
  5 全选的实现 数据的展示
    （1）onShow里面获取缓存中的购物车数据
    （2）根据购物车中的商品数据 所有的商品都被选中checked=true，全选被选中
  6 总价格和总数量
    （1）都需要商品被选中，我们才拿来计算
    （2）获取购物车的数据
    （3）遍历
    （4）判断商品是否被选中
    （5）总价格+=商品的单价*商品的数量
    （6）总数量+=商品的数量
    （7）把计算后的价格和数量 设置回data中
  7 商品的选中
    （1）绑定change事件
    （2）获取到被修改的商品对象
    （3）商品对象的选中状态 取反
    （4）重新填充回data中和缓存中
    （5）重新计算全选。总价格和总数量
  8 全选-反选
    （1）全返复选框绑定事件 change
    （2）获取data中的全选变量 allChecked
     (3) 直接取反allChecked=!allChecked
    （4）遍历购物车数组，让里面的商品的选中状态跟随allChecked改变
    （5）把购物车数组和选中状态重新设置回data中，重新设置回缓存中
  9 商品数量的编辑功能
    (1)+ - 按钮绑定同一个点击事件 区分的关键:自定义属性
    (2)传递被点击的商品id  goods_id
    (3)获取到data中的购物车数组,来获取需要被修改的商品对象
        当购物车的数量=1,同时用户点击 "-"
        弹窗提示(showModal) 询问用户是否删除
            确定---直接执行删除
            取消---什么都不干
    (4)修改商品对象的数量属性 num
    (5)把cart数组重新设置回data和缓存中-----this.setCart()
  10 点击结算
    (1)先判断有没有收货地址
    (2)判断有没有商品
    (3)经过以上验证,跳转到支付页面
*/
import { getSetting, chooseAddress, openSetting, showModal, showToast } from "../../utils/asyncWX.js";
import regeneratorRuntime from '../../lib/runtime/runtime';
Page({
    data: {
        address: {},
        cart: [],
        allChecked: false,
        totalPrice: 0,
        totalNum: 0
    },
    onShow() {
        // 1 获取缓存中的收货地址信息
        const address = wx.getStorageSync("address");
        // 获取缓存中的购物车数据
        const cart = wx.getStorageSync("cart") || [];
        this.setData({ address });
        this.setCart(cart);
    },
    //点击收获地址
    async handleChooseAddress() {

        //优化之前代码:
        // // 1 获取权限状态
        // wx.getSetting({
        //     success: (result) => {
        //         // 2 获取权限状态 只要发现属性名怪异,都要用[]获取属性值
        //         const scopeAddress = result.authSetting["scope.address"];
        //         if (scopeAddress === true || scopeAddress === undefined) {
        //             wx.chooseAddress({
        //                 success: (result1) => {
        //                     console.log(result1);
        //                 }
        //             });
        //         } else {
        //             //3 用户拒绝过授予权限 先诱导用户自己打开授权设置页面
        //             wx.openSetting({
        //                 success: (result2) => {
        //                     // 4 调用获取收货地址代码
        //                     wx.chooseAddress({
        //                         success: (result3) => {
        //                             console.log(result3);
        //                         }
        //                     });
        //                 }
        //             });

        //         }
        //     },
        //     fail: () => {},
        //     complete: () => {}
        // });


        try {
            //优化之后代码:
            // 1 获取权限状态
            const res1 = await getSetting();
            const scopeAddress = res1.authSetting["scope.address"];
            // 2 获取权限状态 只要发现属性名怪异,都要用[]获取属性值
            if (scopeAddress === false) {
                // 4 用户拒绝过授予权限 先诱导用户自己打开授权设置页面
                await openSetting();
            }
            // 调用 获取收货地址api
            let address = await chooseAddress();
            address.all = address.provinceName + address.cityName + address.countryName + address.detailInfo;
            // 5 存入缓存中
            wx.setStorageSync("address", address);

        } catch (error) {
            console.log(error);
        }

    },
    // 商品的选中
    handleItemChange(e) {
        // 1 获取被修改商品的id
        const goods_id = e.currentTarget.dataset.id;
        // 2 获取购物车数组
        let { cart } = this.data;
        //3 找到被修改的商品对象
        let index = cart.findIndex(v => v.goods_id === goods_id);
        // 4 选中状态取反
        cart[index].checked = !cart[index].checked;
        this.setCart(cart);
    },
    // 设置购物车状态 重新计算 底部工具栏的数据 全选 总价格 购买数量
    setCart(cart) {
        let allChecked = true;
        // 总价格 总数量
        let totalPrice = 0;
        let totalNum = 0;
        cart.forEach(v => {
            if (v.checked) {
                totalPrice += v.num * v.goods_price;
                totalNum += v.num;
            } else {
                allChecked = false;
            }
        });
        //判断数组是否为空
        allChecked = cart.length != 0 ? allChecked : false;
        this.setData({
            cart,
            totalPrice,
            totalNum,
            allChecked
        });
        wx.setStorageSync("cart", cart);
    },
    // 商品的全选功能
    handleItemAllCheck() {
        // 1 获取data中的数据
        let { cart, allChecked } = this.data;
        // 2 修改值
        allChecked = !allChecked;
        // 3 循环修改cart数组中的商品选中状态
        cart.forEach(v => v.checked = allChecked);
        // 4 把修改后的值都设置回data中或者缓存中
        this.setCart(cart);
    },
    // 商品数量的编辑功能
    async handleItemNumEdit(e) {
        // 1 获取事件传递过来的参数
        const { operation, id } = e.currentTarget.dataset;
        // 2 获取购物车数组
        let { cart } = this.data;
        // 3 找到需要修改的商品的索引
        const index = cart.findIndex(v => v.goods_id === id);
        // 判断是否执行删除
        if (cart[index].num === 1 && operation === -1) {
            // 弹窗提示
            const res = await showModal({ content: "您是否要删除?" });
            if (res.confirm) {
                cart.splice(index, 1);
                this.setCart(cart);
            }
        } else {
            // 4 进行修改数量
            cart[index].num += operation;
            // 5 设置回data和缓存中
            this.setCart(cart);
        }
    },
    //点击结算功能
    async handlePay() {
        // 1 判断收货地址
        const { address, totalNum } = this.data;
        if (!address.userName) {
            await showToast({ title: "您还没添加收货地址" });
            return;
        }
        // 2 判断用户有没有选购商品 
        if (totalNum === 0) {
            await showToast({ title: "您还没选购商品" });
            return;
        }
        // 跳转到支付页面
        wx.navigateTo({
            url: '/pages/pay/index'
        });
    }
})