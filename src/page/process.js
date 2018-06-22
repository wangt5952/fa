import config from '../config';
const knex = require('knex')(config.db)

import _ from 'lodash';
import moment from 'moment';

import XLSX from 'xlsx';

const system_table_config = [
  {name:'资产负债表', dataArea:[
    ..._.map(_.range(5, 69), o=>[`A${o}`,`C${o}`,`D${o}`]),
    ..._.map(_.range(5, 69), o=>[`E${o}`,`G${o}`,`H${o}`]),
  ], rename:{
    '预付账款':'预付款项',
    '固定资产账面价值':'固定资产净值',
    '实收资本（或股本）':'实收资本（股本）',
    '所有者权益（或股东权益）合计':'所有者权益合计',
    '负债和所有者权益\n（或股东权益）总计':'负债和所有者权益总计',
    '库存商品(产成品)':'库存商品',
    '预收账款':'预收款项',
    '减：累计折旧':'累计折旧',
    '资产合计':'资产总计',
    '负债和所有者权益合计':'负债和所有者权益总计',
    '减：固定资产减值准备':'固定资产减值准备',
    '减：库存股':'库存股'
  }},
  {name:'利润表', dataArea:(sheet)=>{

    const d4 = sheet['D4'];
    if(d4 && _.trim(d4.v) == '本年累计金额'){
      return [
        ..._.map(_.range(5,37), o=>[`A${o}`,`D${o}`,`E${o}`])
      ]
    }else{
      return [
        ..._.map(_.range(5, 32), o=>[`A${o}`,`C${o}`,`D${o}`]),
        ..._.map(_.range(5, 32), o=>[`E${o}`,`G${o}`,`H${o}`]),
      ];
    }

  }, rename:{
    '一、营业总收入':'营业总收入',
    '二、营业总成本':'营业总成本',
    '三、营业利润（亏损以“－”号填列）':'营业利润',
    '四、利润总额（亏损总额以“－”号填列）':'利润总额',
    '五、净利润（净亏损以“－”号填列）':'净利润',
    '六、其他综合收益的税后净额':'其他综合收益的税后净额',
    '七、综合收益总额':'综合收益总额',
    '八、每股收益：':'每股收益',


    '一、营业收入':'营业总收入',
    '二、营业利润（亏损以“-”号填列）':'营业利润',
    '三、利润总额（亏损总额以“-”号填列）':'利润总额',
    '四、净利润（净亏损以“-”号填列）':'净利润',


    '七、其他综合收益':'其他综合收益的税后净额',
    '八、综合收益总额':'综合收益总额',

    '\'其中：对联营企业和合营企业的投资收益':'其中：对联营企业和合营企业的投资收益',
    '营业税金及附加':'税金及附加',
    '其中：利息费用（收入以“-”号填列）':'其中：利息支出',
    '加：投资收益（亏损以“-”号填列）':'投资收益',
    '投资收益（损失以“-”号填列）':'投资收益',
    '其中：政府补助':'政府补助',
    '减：所得税费用':'所得税费用',
    '加：营业外收入':'营业外收入',
    '减：营业外支出':'营业外支出',
    '其中：营业成本':'营业成本',
    '其中：营业收入':'营业收入',
    '其中：非流动资产处置利得':'非流动资产处置利得',
    '其中：非流动资产处置损失':'非流动资产处置损失',
    '加：公允价值变动收益（损失以“-”号填列）':'公允价值变动收益',
    '汇兑收益（损失以“-”号填列）':'汇兑收益',
    '汇兑净损失（净收益以“-”号填列）':'汇兑净损失'
  }},

  {name:'现金流量表', dataArea:(sheet)=>{

    const d4 = sheet['D4'];

    if(d4 && d4.v == '上期金额'){
      return [
        ..._.map(_.range(5, 34), o=>[`A${o}`,`C${o}`,`D${o}`]),
        ..._.map(_.range(5, 34), o=>[`E${o}`,`G${o}`,`H${o}`]),
      ];
    }else if(d4 && d4.v == '本年累计金额'){
      return [
        ..._.map(_.range(5, 30), o=>[`A${o}`,`D${o}`,`E${o}`]),
      ];
    }else{
      return [
        ..._.map(_.range(5, 34), o=>[`A${o}`,`C${o}`]),
        ..._.map(_.range(5, 34), o=>[`D${o}`,`F${o}`]),
      ];
    }
  }, rename:{
    '销售产成品、商品、提供劳务收到的现金':'销售商品、提供劳务收到的现金',
    '收到的其他与经营活动有关的现金':'收到其他与经营活动有关的现金',
    '购买原材料、商品、接受劳务支付的现金':'购买商品、接收劳务支付的现金',
    '支付的职工薪酬':'支付给职工以及为职工支付的现金',
    '支付的税费':'支付的各项税费',
    '购建固定资产、无形资产和其他非流动资产支付的现金':'购建固定资产、无形资产和其他长期资产所支付的现金',
    '四、现金净增加额':'五、现金及现金等价物净增加额',
    '加：期初现金余额':'加：期初现金及现金等价物余额',
    '五、期末现金余额':'六、期末现金及现金等价物余额',
    '支付的其他与经营活动有关的现金':'支付其他与经营活动有关的现金',
    '取得借款收到的现金':'取得借款所收到的现金',
    '吸收投资者投资收到的现金':'吸收投资收到的现金',
    '偿还借款本金支付的现金':'偿还债务所支付的现金',
    '偿还借款利息、分配利润支付的现金':'分配股利、利润或偿付利息所支付的现金',
    '加：期初现金及现金等价物余额':'加：期初现金及现金等价物余额'

  }}
]
const musicList = [
  '483671599','492151018','489506275','474567580','480580003',
  '465920905','432506345','423849475','436514312','488256319',
  '471385043','496870798','489998494','439915614','2919622',
  '499274374','495220123','28285910','28193075','27646205',
  '25706282','4894227','32507038','28738227','1807865','34229976'
]

const table_check = [
  '资产负债表.短期投资 = 资产负债表.短期投资跌价准备+资产负债表.短期投资净额',
  '资产负债表.应收帐款净额 = 资产负债表.应收帐款+资产负债表.坏账准备',
  '资产负债表.存货净额=资产负债表.存货-资产负债表.存货跌价准备-资产负债表.存货变现损失',
  '资产负债表.长期投资=资产负债表.长期股权投资+资产负债表.长期债权投资',
  '资产负债表.长期投资净额=资产负债表.长期投资-资产负债表.长期投资减值准备-资产负债表.合并差价',
  '资产负债表.固定资产净值=资产负债表.固定资产原价-资产负债表.累计折旧',
  '资产负债表.固定资产净额=资产负债表.固定资产净值-资产负债表.固定资产减值准备',
  '资产负债表.实收资本（股本）=资产负债表.国有资本+资产负债表.集体资本+资产负债表.民营资本 +资产负债表.外商资本',
  '资产负债表.无形及递延资产合计=资产负债表.无形资产+资产负债表.递延所得税资产+资产负债表.长期待摊费用',
  '资产负债表.流动资产合计 = 资产负债表.货币资金+资金负债表.短期投资+资产负债表.应收票据+资产负债表.应收账款+资产负债表.预付款项+资产负债表.应收利息+资产负债表.应收股利+资产负债表.其他应收款+资产负债表.存货净额+资产负债表.一年内到期的非流动资产+资产负债表.其他流动资产',
  '资产负债表.非流动资产合计=资产负债表.可供出售金融资产+资产负债表.持有至到期投资+资产负债表.长期应收款+资产负债表.长期投资+资产负债表.投资性房地产+资产负债表.固定资产净额+资产负债表.在建工程+资产负债表.工程物资+资产负债表.固定资产清理+资产负债表.生产性生物资产+资产负债表.油气资产+资产负债表.无形资产+资产负债表.开发支出+资产负债表.商誉+资产负债表.长期待摊费用+资产负债表.递延所得税资产+资产负债表.其他非流动资产',
  '资产负债表.资产总计=资产负债表.流动资产合计+资产负债表.长期投资净额+资产负债表.无形及递延资产合计+资产负债表.非流动资产合计+资产负债表.递延税款借项+资产负债表.其他长期资产',
  '资产负债表.流动负债合计=资产负债表.短期借款+资产负债表.以公允价值计算且其变动计入当期损益的金融负债+资产负债表.交易性金融负债+资产负债表.应付票据+资产负债表.应付账款+资产负债表.预收款项+资产负债表.应付职工薪酬+资产负债表.应交税费+资产负债表.应付利息+资产负债表.应付股利+资产负债表.其他应付款+资产负债表.一年内到期的非流动负债+资产负债表.其他流动负债',
  '资产负债表.非流动负债合计=资产负债表.长期借款+资产负债表.应付债券+资产负债表.长期应付款+资产负债表.专项应付款+资产负债表.预计负债 +资产负债表.递延所得税负债 +资产负债表.其他非流动负债',
  '资产负债表.负债合计=资产负债表.流动负债合计+资产负债表.非流动负债合计+资产负债表.递延税款贷项',
  '资产负债表.所有者权益合计=资产负债表.实收资本（股本）+资产负债表.资本公积-资产负债表.库存股+资产负债表.其他综合收益+资产负债表.专项储备+资产负债表.盈余公积+资产负债表.未分配利润',
  '资产负债表.负债和所有者权益合计=资产负债表.负债合计+资产负债表.所有者权益合计+资产负债表.少数股东权益+资产负债表.外币报表折算差额',
  '资产负债表.负债和所有者权益合计=资产负债表.资产总计',
  '利润表.主营业务收入净额=利润表.主营业务收入-利润表.折扣与折让',
  '利润表.营业外收入=利润表.处置固定资产净收益+利润表.非货币性交易收益+利润表.出售无形资产收益+利润表.罚款净收入+利润表.政府补助',
  '利润表.营业外支出=利润表.处置固定资产净损失+利润表.债务重组损失+利润表.罚款支出+利润表.捐赠支出',
  '利润表.主营业务利润=利润表.主营业务收入净额-利润表.主营业务成本-利润表.主营业务税金及附加-利润表.经营费用-利润表.销售费用+利润表.管理费用+利润表.财务费用+利润表.递延收益+ 利润表.代购代销收入+利润表.营业外收入-利润表.营业外支出',
  '利润表.营业利润=利润表.主营业务利润+利润表.其他业务利润-利润表.经营费用-利润表.管理费用-利润表.财务费用-利润表.其他',
  '利润表.利润总额=利润表.营业利润+利润表.投资收益+利润表.期货收益+利润表.补贴收入+利润表.营业外收入+利润表.其他-利润表.营业外支出-利润表.其他支出+利润表.以前年度损益调整',
  '利润表.净利润=利润表.利润总额-利润表.所得税费用-利润表.少数股东损益+利润表.未确认投资损失',
  '利润表.当年可供分配利润=利润表.净利润+利润表.年初未分配利润+利润表.盈余公积补亏+利润表.其他调整因素',
  '利润表.可供投资者分配的利润=利润表.当年可供分配利润-利润表.单项留用的利润-利润表.补充流动资本-利润表.提取盈余公积-利润表.法定盈余公益金-利润表.提取职工奖励及福利基金-利润表.提取储备基金-利润表.提取企业发展基金-利润表.利润归还投资-利润表.其他',
  '利润表.未分配利润=利润表.可供投资者分配的利润-利润表.应付优先股股利-利润表.提取任意盈余公积-利润表.应付普通股股利-利润表.转作股本的普通股股利-利润表.其他',
  '现金流量表.经营活动现金流入小计=现金流量表.销售商品、提供劳务收到的现金+现金流量表.收取利息、手续费及佣金的现金+现金流量表.收到的税费返还+现金流量表.收到的其他与经营活动有关的现金',
  '现金流量表.经营活动现金流出小计=现金流量表.购买商品、接受劳务支付的现金+现金流量表.支付利息、手续费及佣金的现金+现金流量表.支付给职工以及为职工支付的现金+现金流量表.实际交纳的增值税款+现金流量表.支付的所得税款+现金流量表.支付的除增值税、所得税以外的其他税款+ 现金流量表.支付的其他与经营活动有关的现金',
  '现金流量表.经营活动产生的现金流量净额=现金流量表.经营活动现金流入小计-现金流量表.经营活动现金流出小计',
  '现金流量表.投资活动现金流入小计=现金流量表.收回投资收到的现金+现金流量表.分得股利或利润所收到的现金+现金流量表.取得债券利息收入所收到的现金+现金流量表.处置固定资产无形资产和其他长期资产所收回的现金净额+现金流量表.收到的其他与投资活动有关的现金',
  '现金流量表.投资活动现金流出小计=现金流量表.购建固定资产、无形资产和其他长期资产所支付的现金+现金流量表.权益性投资所支付的现金+现金流量表.债券性投资所支付的现金+现金流量表.支付的其他与投资活动有关的现金',
  '现金流量表.投资活动产生的现金流量净额=现金流量表.投资活动现金流入小计-现金流量表.投资活动现金流出小计',
  '现金流量表.筹资活动现金流入小计=现金流量表.吸收投资所收到的现金+现金流量表.子公司吸收少数股东权益性投资收到的现金+现金流量表.发行债权所收到的现金+现金流量表.取得借款所收到的现金+现金流量表.收到的其他与筹资活动有关的现金',
  '现金流量表.筹资活动现金流出小计=现金流量表.偿还债务所支付的现金+现金流量表.发生筹资费用所支付的现金+现金流量表.分配股利或利润所支付的现金+现金流量表.子公司支付少数股东的股利+现金流量表.偿付利息所支付的现金+现金流量表.融资租赁所支付的现金+现金流量表.子公司依法减资支付给少数股东的现金+现金流量表.减少注册资本所支付的现金+现金流量表.支付的其他与筹资活动有关的现金',
  '现金流量表.筹资活动产生的现金流量净额=现金流量表.筹资活动现金流入小计-现金流量表.筹资活动现金流出小计',
  '现金流量表.现金及现金等价物净增加额=现金流量表.经营活动产生的现金流量净额+现金流量表.投资活动产生的现金流量净额+现金流量表.筹资活动产生的现金流量净额+现金流量表.汇率变动对现金的影响',
  '现金流量表.经营活动产生的现金流量净额=现金流量表.净利润+现金流量表.计提的坏帐准备或转销的坏帐+现金流量表.固定资产折旧+现金流量表.无形资产摊销+现金流量表.开办费、长期待摊费用摊销+现金流量表.待摊费用的减少+现金流量表.预提费用的增加+现金流量表.处置固定资产、无形资产和其他长期资产的损失+现金流量表.固定资产报废损失+现金流量表.财务费用+现金流量表.投资损失+现金流量表.递延税款贷项+现金流量表.存货的减少+现金流量表.经营性应收项目的减少+现金流量表.经营性应收项目的增加+现金流量表.其他',
  '现金流量表.经营活动产生的现金资产=现金流量表.经营活动产生的所有者权益+现金流量表.经营活动产生的负债-现金流量表.经营活动产生的非现金资产',
  '现金流量表.现金及现金等价物净增加额=现金流量表.现金的期末余额-现金流量表.现金的期初余额+现金流量表.现金等价物的期末余额-现金流量表.现金等价物的期初余额',
  '利润表.净利润=资产负债表.负债和所有者权益合计（期末余额）-资产负债表.负债和所有者权益合计（年初余额）',
  '现金流量表.销售商品、提供劳务收到的现金=利润表.主营收入*1.17+利润表.其他收入+资产负债表.应收票据（年初余额-期末余额）+资产负债表.应收账款（年初余额-期末余额）+资产负债表.预收账款（期末余额-年初余额）+利润表.销售材料代购代销业务收到的现金+资产负债表.已核销的坏账损失-资产负债表.销售退回支付的现金-资产负债表.计提应收账款坏账准备期末余额',
  '现金流量表.现金及现金等价物净增加额=资产负债表.货币资金（期末余额）-资产负债表.货币资金（年初余额）+资产负债表.现金等价物（期末余额）-资产负债表.现金等价物（年初余额）',
  '资产负债表.货币资金=资产负债表.现金+资产负债表.银行存款+资产负债表.其他货币资金',
  '资产负债表.资产账面价值=资产负债表.资产原值-资产负债表.资产摊销/折旧-资产负债表.资产减值准备',
  '资产负债表.所得税费用=资产负债表.递延所得税费用+资产负债表.当期所得税费用',
  '资产负债表.固定资产的本期折旧额=资产负债表.本期计入管理费用+资产负债表.销售费用+资产负债表.制造费用+资产负债表.在建工程+资产负债表.开发支出',
  '利润表.营业利润=利润表.净利润+利润表.所得税费用+利润表.营业外收入-利润表.营业外支出-利润表.补贴收入-利润表.投资损益',
  '现金流量表.经营活动产生的现金资产=现金流量表.经营活动产生的所有者权益+现金流量表.经营活动产生的负债-现金流量表.经营活动产生的非现金资产',
  '现金流量表.经营活动产生的所有者权益=利润表.营业利润+利润表.无形资产摊销+利润表.长期待摊费用摊销-利润表.通过其他业务收入处理长期资产的损益+利润表.筹资产生的财务费用+利润表.计提的固定资产折旧',
  '现金流量表.经营活动产生的所有者权益=资产负债表.短期投资跌价准备+资产负债表.长期投资减值准备+资产负债表.委托贷款减值准备+资产负债表.固定资产减值准备+资产负债表.在建工程减值准备+资产负债表.无形资产减值准备'
];

module.exports = {
  'create.get': async (req, res, next) => {

    let { ...session } = req.session;

    let { user_id } = session;
    let processList;

    if(user_id){
      processList = await knex('fa_process').where({user_id}).orderBy('create_time', 'desc').limit(10);
    }

    res.render('template/process/create.html', {processList, session});
  },
  'create.post': async (req, res, next) => {

    let { file_id } = req.body;
    let { user_id, unknow_process=[] } = req.session;

    let id = await knex('fa_process')
      .returning('id')
      .insert({file_id, user_id});
    id = id[0]

    if(!user_id){

      unknow_process.push(id);
      req.session.unknow_process = unknow_process;
      await req.session.save();
    }

    res.json({data:{id}})
  },
  'extract_data.get': async (req, res, next) => {
    let { id, template_id } = req.query;

    let item = await knex('fa_process').where({id}).first();

    if(item.template_id != template_id){

      let table_config
      if(template_id == -1){
        table_config = system_table_config;
      }else{
        let template = await knex('fa_template').where({id:template_id}).first();
        table_config = JSON.parse(template.table_config)
      }


      let file = await knex('sys_file').where({id:item.file_id}).first();

      let xfile = XLSX.readFile(file.path);

      let table_value = _.mapValues(xfile.Sheets, (o,k) => {
        let tc = _.find(table_config, {name:k});

        let data;
        if(tc){
          let dataArea = tc.dataArea;
          let rename = tc.rename || {};
          let dataAreaRename = tc.dataAreaRename || [];
          if(_.isFunction(dataArea)) dataArea = dataArea(o);
          data = _.map(dataArea, (p,i)=>_.map(p, (q,j)=>{
            if(!q) return '';
            if(j == 0){
              if(dataAreaRename.length > i && dataAreaRename[i]){
                return dataAreaRename[i]
              }
            }
            if(!o[q]) return '';
            const c = o[q];
            if(c.t == 'n'){
              return c.v.toFixed(2);
            }
            else return _.trim(c.v).replace(/[ ]/g, '')
          }))
          data = _.mapKeys(data, p=>rename[p[0]] || p[0]);
          data = _.mapValues(data, ([idx1, ...p])=>p);
        }
        console.log(data);
        return data;
      })

      await knex('fa_process').where({id}).update({template_id, table_value:JSON.stringify(table_value)});
    }
    res.redirect(`select_table?id=${id}`);

  },
  'select_table.get': async (req, res, next) => {
    let { id, template_id } = req.query;
    let { ...session } = req.session;
    let { user_id } = session;

    let item = await knex('fa_process').where({id}).first();

    let templateList = user_id ? await knex('fa_template').where({user_id}): [];

    templateList = [
      {id:-1, name:'内置报表模版'},
      ...templateList
    ]

    template_id = template_id || item.template_id || templateList[0].id;

    if(item.template_id != template_id){
      res.redirect(`extract_data?id=${id}&template_id=${template_id}`);
      return
    }

    if(item.table_value) item.table_value = JSON.parse(item.table_value);
    res.render('template/process/select_table.html', { item, templateList, session });
  },
  'set_param.get': async (req, res, next) => {
    let { id } = req.query;
    let item = id ? (await knex('fa_process').where({id}).first()) : {};

    let examineList = await knex('fa_examine');

    examineList = _.map(examineList, o=>({
      ...o,
      name: o.name || o.default_name
    }))
    res.render('template/process/set_param.html', { item, examineList});
  },
  'finish.get': async (req, res, next) => {
    let { id } = req.query;
    let { ...session } = req.session;

    let item = id ? (await knex('fa_process').where({id}).first()) : {};

    let examine_id = item.examine_id ? JSON.parse(item.examine_id) : [];

    let table_check = [];
    if(examine_id.length){
      table_check = await knex('fa_examine').whereIn('id', examine_id);
    }else{
      table_check = await knex('fa_examine');
    }


    let data = JSON.parse(item.table_value)
    item.table_value = data;

    let errList = _.map(table_check, o=>{
      let emptyList = [];
      let exp = _.trim(o.content).replace('100%', '1').replace(/([^\/\*=+\-\(\)]+)/g, word=>{
        if(_.isNaN(parseFloat(word))){

          let idx = '[0]';
          if(_.endsWith(word, '.年初余额')){
            word = word.replace('.年初余额', '');
            idx = '[1]';
          }

          let v = _.get(data, _.trim(word) + idx);

          //console.log(v)
          if(v){
            if(v.charAt(0) == '-') return '('+v+')';
            return v;
          }else{
            emptyList.push(word);
            return '0';
          }
        }
        return word;
      }).replace('=','==');


      let retList = _.map(exp.split('=='), o=>{
        let v = eval(o)
        if(Math.abs(v) == Infinity || !v) v = 0;
        return v.toFixed(2);
      })

      let ret
      let is_zero = false;
      let deviation = 0;
      let sort = 1
      if(retList.length >= 2){
        ret = retList[0] == retList[1] ? 'true' : 'false';

        if(ret == 'true'){
          is_zero = retList[0] == 0;
          sort = 3;
        }else{
          deviation = (retList[0] - retList[1]) / (retList[0] || retList[1]);
          sort = 1 - deviation;
          deviation = (deviation * 100).toFixed(0) + '%'
        }
      }else{
        ret = retList[0]
        sort = 2;
      }

      return {
        id: o.id,
        result : ret,
        name: o.name || o.default_name,
        info: exp,
        emptyList,
        is_zero,
        deviation,
        sort,
        exp: _.trim(o.default_name)
      }
    })

    const music_id = musicList[_.random(musicList.length - 1)];

    errList = _.sortBy(errList, 'sort')
    res.render('template/process/finish.html', { item, errList, session, music_id});
  },
  'feedback.post': async (req, res, next) => {
    let { process_id, content } = req.body;

    await knex('fa_process_feedback').insert({
      process_id, content
    })
    res.json({});
  },

  'keyword': async (req, res, next) => {

    let item = await knex('sys_config').where('name', 'fa_table_field').first() || {};


    let config = _.filter(_.map(item.value.split('\r\n\r\n'), o=>_.compact(o.split('\r\n'))), o=>_.size(o));
    config = _.mapKeys(config, o=>o[0]);
    config = _.mapValues(config, ([idx0, ...values])=>values);

    res.send('var fa_keyword = ' + JSON.stringify(config));
  },

  'edit.get': async (req, res, next) => {

    let { id } = req.query;

    let item = await knex('fa_process').where({id}).first();

    let yearList = _.range(2013, moment().year() + 1)
    let monthList = _.range(1,13);
    res.render('template/process/edit.html', { item, yearList, monthList });
  },

  'edit.post': async (req, res, next) => {
    let data = req.body;
    let { id, act } = req.query;

    if(id){
      if(act == 'del'){
        await knex('fa_process').where({id}).delete();
      }else{
        if(data.examine_id) data.examine_id = JSON.stringify(data.examine_id);

        await knex('fa_process').where({id}).update(data);
      }
    }else{
      await knex('fa_process').insert(data);
    }
    res.json({})
  },

  'list.get': async (req, res, next) => {

    let { user_id } = req.session;

    let { company_name, stage_start, stage_end, display_type = 'list' } = req.query;

    console.log(req.xhr)
    if(req.xhr){
      let { draw, columns, order, start, length, search, _:ts } = req.query;
      let dao = knex('v_fa_process').where({user_id});
      let daoCount = knex('fa_process').where({user_id});

      if(company_name == 'unset'){
        dao.whereNull('company_name')
        daoCount.whereNull('company_name')
      }else if(company_name){
        dao.where({company_name})
        daoCount.where({company_name})
      }

      if(stage_start){
        let args = stage_start.split('-');
        if(args.length == 2){
          _.forEach([dao, daoCount], dao=>{
            dao.where(d=>{
              d.where('year', '>', args[0])
                .orWhere(d1=>{
                  d1.where('year', args[0]).where('month', '>=', args[1])
                })
            })
          })
        }
      }

      if(stage_end){
        let args = stage_end.split('-');
        if(args.length == 2){
          _.forEach([dao, daoCount], dao=>{
            dao.where(d=>{
              d.where('year', '<', args[0])
                .orWhere(d1=>{
                  d1.where('year', args[0]).where('month', '<=', args[1])
                })
            })
          })
        }
      }

      if(order.length){
        const { column, dir } = order[0];
        dao.orderBy(columns[column].data, dir);
      }

      dao.offset(Math.max(0, start)).limit(Math.max(10, length));

      let list = await dao;
      list = _.map(list, o=>({
        ...o,
        create_time: moment(o.create_time).format('lll')
      }))
      let total = (await daoCount.count('* as cnt'))[0].cnt;

      res.json({
        recordsTotal:total,
        recordsFiltered:total,
        data:list
      })
    }else{

      let renderOption = {};
      let list = await knex('fa_process').where({user_id});
      let companyList = _.compact(_.uniq(_.map(list, 'company_name')));
      companyList = _.map(companyList, o=>({key:o,value:o}))

      companyList = [
        {key:'', value:'[全部]'},
        ...companyList,
        {key:'unset', value:'[未设定]'}
      ]

      if(!company_name){
        company_name = companyList[0].key;
      }

      if(display_type == 'chart'){
        if(!company_name || company_name == 'unset'){
          display_type = 'list';
        }
      }

      renderOption.companyList = companyList;
      renderOption.company_name = company_name;
      renderOption.stage_start = stage_start;
      renderOption.stage_end = stage_end;
      renderOption.display_type = display_type;



      if(display_type == 'chart'){
        let {k1, k2} = req.query;

        let item = await knex('sys_config').where('name', 'fa_table_field').first() || {};


        let config = _.filter(_.map(item.value.split('\r\n\r\n'), o=>_.compact(o.split('\r\n'))), o=>_.size(o));
        config = _.mapKeys(config, o=>o[0]);
        config = _.mapValues(config, ([idx0, ...values])=>values);

        let examineList = await knex('fa_examine').whereNot('content', 'like', '%=%');
        config['勾稽关系'] = _.map(examineList, o=>`${o.id}:${o.name}`)

        let k1List = _.keys(config);

        if(!k1) k1 = k1List[0];

        let k2List = _.values(config[k1]);
        if(!k2 || !~k2List.indexOf(k2)) k2 = k2List[0];




        let dao = knex('v_fa_process').where({user_id, company_name});

        if(stage_start){
          let args = stage_start.split('-');
          if(args.length == 2){
            dao.where(d=>{
              d.where('year', '>', args[0])
                .orWhere(d1=>{
                  d1.where('year', args[0]).where('month', '>=', args[1])
                })
            })
          }
        }

        if(stage_end){
          let args = stage_end.split('-');
          if(args.length == 2){
            dao.where(d=>{
              d.where('year', '<', args[0])
                .orWhere(d1=>{
                  d1.where('year', args[0]).where('month', '<=', args[1])
                })
            })
          }
        }

        let list = await dao;
        list = _.orderBy(list, ['year', 'month']);

        if(k1 != '勾稽关系'){
          let dataPath = `${k1}.${k2}[0]`;
          list = _.map(list, ({year, month, table_value})=>{
            let data = JSON.parse(table_value);
            let value = _.get(data, dataPath);
            return {
              stage: `${year}-${month}`,
              value
            }
          })
        }else{

          let examine_id = k2.split(':')[0];

          let table_check = await knex('fa_examine').whereIn('id', [examine_id]);


          list = _.map(list, ({year, month, table_value})=>{

            let data = JSON.parse(table_value);

            let errList = _.map(table_check, o=>{
              let emptyList = [];
              let exp = _.trim(o.content).replace('100%', '1').replace(/([^\/\*=+\-\(\)]+)/g, word=>{
                if(_.isNaN(parseFloat(word))){

                  let idx = '[0]';
                  if(_.endsWith(word, '.年初余额')){
                    word = word.replace('.年初余额', '');
                    idx = '[1]';
                  }

                  let v = _.get(data, _.trim(word) + idx);

                  //console.log(v)
                  if(v){
                    if(v.charAt(0) == '-') return '('+v+')';
                    return v;
                  }else{
                    emptyList.push(word);
                    return '0';
                  }
                }
                return word;
              }).replace('=','==');


              let retList = _.map(exp.split('=='), o=>{
                let v = eval(o)
                if(Math.abs(v) == Infinity || !v) v = 0;
                return v.toFixed(2);
              })

              let ret
              let is_zero = false;
              if(retList.length >= 2){
                ret = retList[0] == retList[1] ? 'true' : 'false';

                if(ret == 'true'){
                  is_zero = retList[0] == 0;
                }
              }else{
                ret = retList[0]
              }

              return {
                id: o.id,
                result : ret,
                name: o.name || o.default_name,
                info: exp,
                emptyList,
                is_zero
              }
            })
            console.log(errList[0]);

            let value = errList[0].result;
            return {
              stage: `${year}-${month}`,
              value
            }
          })
        }


        renderOption.list = list;
        renderOption.k1List = k1List;
        renderOption.k2List = k2List;
        renderOption.k1 = k1;
        renderOption.k2 = k2;

      }

      res.render('template/process/list.html', renderOption);
    }
  },

}
