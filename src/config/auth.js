const list = [
  {name:'应用管理', code:'app', children:[
    {name:'查询', code:'app.query'},
    {name:'添加', code:'app.add'},
    {name:'修改', code:'app.edit'},
    {name:'删除', code:'app.del'},
  ]},
  {name:'销售数据管理', code:'sale', children:[
    {name:'查询', code:'sale.query'},
    {name:'添加', code:'sale.add'},
    {name:'修改', code:'sale.edit'},
    {name:'删除', code:'sale.del'},
    {name:'审核1', code:'sale.review.1'},
    {name:'审核2', code:'sale.review.2'},
  ]},
  {name:'人员管理', code:'user', children:[
    {name:'查询', code:'user.query'},
    {name:'添加', code:'user.add'},
    {name:'修改', code:'user.edit'},
    {name:'删除', code:'user.del'},
    {name:'权限', code:'user.auth'},
  ]},
  {name:'产品管理', code:'product', children:[
    {name:'查询', code:'product.query'},
    {name:'添加', code:'product.add'},
    {name:'修改', code:'product.edit'},
    {name:'删除', code:'product.del'},
  ]},
  {name:'系统设置', code:'config'},
];

export default list;
