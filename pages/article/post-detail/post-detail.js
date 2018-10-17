// var postsData = require('../../../data/posts-data.js')
var app = getApp();
var WxParse = require('../../../wxParse/wxParse.js');

Page({
    data: {
        postData: null,
        articleComments: [],
        collected: 0
    },
    onLoad: function (option) {
        var postId = option.id;
        console.log(option);
        this.data.currentPostId = postId;
        
        var that = this;
        wx.request({
          url: 'https://api.it120.cc/' + app.globalData.subDomain +
          '/cms/news/detail?id=' + postId,
          success: function (res) {
            if (res.data.code == 0) {
              that.setData({
                postData: res.data.data
              })
            }
            WxParse.wxParse('article', 'html', res.data.data.content, that, 5);
          }
        });

        // get article comments
        wx.request({
          url: 'https://api.it120.cc/' + app.globalData.subDomain +
          '/comment/list/',
          data: {
            refId: postId,
            type: 3
          },
          success: (res) => {
            if (res.data.code == 0) {
              that.setData({
                articleComments: res.data.data
              })
            }
            console.log(that.data.articleComments)
          }
        });

        var postsCollected = wx.getStorageSync('posts_collected')
        if (postsCollected) {
            var postCollected = postsCollected[postId]
            this.setData({
                collected: postCollected
            })
        }
        else {
            var postsCollected = {};
            postsCollected[postId] = false;
            wx.setStorageSync('posts_collected', postsCollected);
        }
    },

    onColletionTap: function (event) {
        // this.getPostsCollectedSyc();
        this.getPostsCollectedAsy();
    },

    getPostsCollectedAsy: function () {
        var that = this;
        wx.getStorage({
            key: "posts_collected",
            success: function (res) {
                var postsCollected = res.data;
                var postCollected = postsCollected[that.data.currentPostId];
                // 收藏变成未收藏，未收藏变成收藏
                postCollected = !postCollected;
                postsCollected[that.data.currentPostId] = postCollected;
                that.showToast(postsCollected, postCollected);
            }
        })
    },

    getPostsCollectedSyc: function () {
        var postsCollected = wx.getStorageSync('posts_collected');
        var postCollected = postsCollected[this.data.currentPostId];
        // 收藏变成未收藏，未收藏变成收藏
        postCollected = !postCollected;
        postsCollected[this.data.currentPostId] = postCollected;
        this.showToast(postsCollected, postCollected);
    },

    showModal: function (postsCollected, postCollected) {
        var that = this;
        wx.showModal({
            title: "收藏",
            content: postCollected ? "收藏该文章？" : "取消收藏该文章？",
            showCancel: "true",
            cancelText: "取消",
            cancelColor: "#333",
            confirmText: "确认",
            confirmColor: "#405f80",
            success: function (res) {
                if (res.confirm) {
                    wx.setStorageSync('posts_collected', postsCollected);
                    // 更新数据绑定变量，从而实现切换图片
                    that.setData({
                        collected: postCollected
                    })
                }
            }
        })
    },

    showToast: function (postsCollected, postCollected) {
        // 更新文章是否的缓存值
        wx.setStorageSync('posts_collected', postsCollected);
        // 更新数据绑定变量，从而实现切换图片
        this.setData({
            collected: postCollected
        })
        wx.showToast({
            title: postCollected ? "收藏成功" : "取消成功",
            duration: 1000,
            icon: "success"
        })
    },

    onShareTap: function (event) {
        var itemList = [
            "分享给微信好友",
            "分享到朋友圈",
            "分享到QQ",
            "分享到微博"
        ];
        wx.showActionSheet({
            itemList: itemList,
            itemColor: "#405f80",
            success: function (res) {
                // res.cancel 用户是不是点击了取消按钮
                // res.tapIndex 数组元素的序号，从0开始
                wx.showModal({
                    title: "用户 " + itemList[res.tapIndex],
                    content: "用户是否取消？" + res.cancel + "现在无法实现分享功能，什么时候能支持呢"
                })
            }
        })
    },

    /*
    * 定义页面分享函数
    */
    onShareAppMessage: function (event) {
        return {
            title: '离思五首·其四',
            desc: '曾经沧海难为水，除却巫山不是云',
            path: '/pages/posts/post-detail/post-detail?id=0'
        }
    },
    submitComment: function (e) {
      var that = this;
      var postJsonString = {};
      postJsonString.token = wx.getStorageSync('token');
      postJsonString.refId = that.data.postData.id;
      postJsonString.type = 3; // type of CMS comment is 3
      postJsonString.content = e.detail.value["commentContent"];
      console.log(postJsonString);

      // commit comments
      wx.request({
        url: 'https://api.it120.cc/' + app.globalData.subDomain +
        '/comment/add',
        data: {
          refId: postJsonString.refId,
          type: postJsonString.type,
          content: postJsonString.content,
          token: postJsonString.token
        },
        success: (res) => {
          if (res.data.code == 0) {
            wx.showToast({
              title: '评论成功',
              duration: 1000,
              icon: "success"
            })
          }
        }
      })
    }
})