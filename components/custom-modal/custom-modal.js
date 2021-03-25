// components/custom-modal/custom-modal.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    title:{
      type:String,
      default:"弹窗"
    },
    showCancel:{
      type:Boolean,
      default:true
    },
    confirmText:{
      type:String,
      default:"确定"
    },
    cancelText:{
      type:String,
      default:"取消"
    },
    show:{
      type:Boolean,
      default:false
    },
    bottom:{
      type:Boolean,
      default:false
    },
    marginBonttom:{
      type:Number,
      default:0
    },
    hidemodalauto:{
      type:Boolean,
      default:true
    }
  },

  /**
   * 组件配置
   */
  options:{
    addGlobalClass:true, //引入全局样式
    multipleSlots:true,// 多插槽
  },
 
  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 隐藏弹窗的事件
     */
    hidemodal:function(){
      let detail = {}, option = {};
      this.triggerEvent('hidemodal',detail,option);
    },
    /**
     * 确认弹窗的事件
     */
    confirm:function(){
      let detail = {}, option = {};
      if(this.data.hidemodalauto) this.hidemodal();//关闭弹窗
      this.triggerEvent('confirm',detail,option);
    }
  }
})
