import { ShichenInfo } from "../types";

export const SHICHEN_DATA: ShichenInfo[] = [
  {
    name: "子时",
    timeRange: "23:00 - 01:00",
    organ: "胆经 (Gallbladder Meridian)",
    status: "胆汁新陈代谢，阴气最盛，渐生阳气",
    advice: "宜：熟睡静养，安神入眠",
    acupoint: {
      name: "涌泉穴",
      location: "足底前三分之一折痕凹陷处",
      benefits: "灌注肾经，引火归元，改善老年或职场高压失眠"
    },
    herbalTea: {
      name: "酸枣仁百合夜宁茶",
      ingredients: "炒酸枣仁9g、干百合6g、茯苓5g",
      effect: "养血安神，清心除烦，安眠助睡"
    },
    tips: [
      "子时是人体细胞新陈代谢、骨髓造血的关键时间。",
      "在此时间之前入睡，有助于胆经排毒，能避免面色萎黄、黑眼圈等。",
      "入睡前宜用温水泡脚，静心闭上双眼。"
    ]
  },
  {
    name: "丑时",
    timeRange: "01:00 - 03:00",
    organ: "肝经 (Liver Meridian)",
    status: "肝脏休整，藏血解毒，调和气机",
    advice: "宜：深睡眠，不宜熬夜或动怒",
    acupoint: {
      name: "太冲穴",
      location: "足背第一、二跖骨结合部之前的凹陷处",
      benefits: "疏肝理气，排毒解郁，平熄肝火，缓解视疲劳"
    },
    herbalTea: {
      name: "菊花枸杞明目饮",
      ingredients: "杭白菊3g、枸杞子6g、桑叶2g",
      effect: "清肝明目，疏散风热，适合长期看屏、眼睛干涩的职场人"
    },
    tips: [
      "丑时是人体肝脏藏血滤血、自我修复排毒的黄金期。",
      "不入睡会导致血液不能归肝，容易令人脾气暴躁、肝火上升。",
      "避免深夜看手机或处理工作，保持卧室环境绝对静谧。"
    ]
  },
  {
    name: "寅时",
    timeRange: "03:00 - 05:00",
    organ: "肺经 (Lung Meridian)",
    status: "肺气朝百脉，输布气血津液到全身",
    advice: "宜：熟眠、匀畅呼吸",
    acupoint: {
      name: "太渊穴",
      location: "腕掌侧横纹桡侧端，桡动脉搏动处",
      benefits: "宣肺平喘，扶正补气，益气通脉"
    },
    herbalTea: {
      name: "百合麦冬清肺饮",
      ingredients: "干百合5g、麦冬5g、玉竹3g",
      effect: "养阴润肺，生津化痰"
    },
    tips: [
      "寅时是人体气血从静至动转化的时刻，肺经在此刻将气血合理分配至全身。",
      "此时间段如果异常频繁易醒或剧烈咳嗽，可能代表肺气亏虚、运转不畅。",
      "适宜在房内放置加湿器，保持空气清新、温度适中。"
    ]
  },
  {
    name: "卯时",
    timeRange: "05:00 - 07:00",
    organ: "大肠经 (Large Intestine)",
    status: "大肠蠕动，排出蓄积毒素，阳气徐徐升起",
    advice: "宜：空腹温水，排泄通便",
    acupoint: {
      name: "合谷穴",
      location: "手背第一、二掌骨间，第二掌骨桡侧的中点处（虎口）",
      benefits: "清热排毒，宣通气血，能有效改善面部暗沉、暗疮及便秘"
    },
    herbalTea: {
      name: "蜂蜜玫瑰润肠饮",
      ingredients: "墨红玫瑰2朵、蜂蜜1勺（温水冲调）",
      effect: "疏肝理气，润肠通便，养人容颜"
    },
    tips: [
      "卯时日出，人体阳气开始升发，大肠开始强力蠕动。",
      "起床后空腹饮用200-300ml温开水，最有利于排毒清肠。",
      "若大便干结，可用腹部按摩：以肚脐为中心顺时针轻柔摩腹。"
    ]
  },
  {
    name: "辰时",
    timeRange: "07:00 - 09:00",
    organ: "胃经 (Stomach Meridian)",
    status: "胃纳百谷，是一天中消化能力最旺盛的时刻",
    advice: "宜：吃温热、高营养早餐",
    acupoint: {
      name: "足三里穴",
      location: "犊鼻穴（外膝眼）下3寸，胫骨前嵴外一横指处",
      benefits: "调理脾胃，大补元气，保健强壮第一要穴"
    },
    herbalTea: {
      name: "陈皮山药健脾粥",
      ingredients: "陈皮3g、干山药片10g、粳米（配膳）",
      effect: "健脾养胃，理气化湿，适合晨起胃口不佳者"
    },
    tips: [
      "不仅要吃早餐，而且要吃得温热、均衡，这是补充一整天能量的基石。",
      "不吃早餐会让胃酸空转磨损，引起胃寒，甚至促生胆结石。",
      "饭后宜慢步徐行，促进脾胃升清降浊。"
    ]
  },
  {
    name: "巳时",
    timeRange: "09:00 - 11:00",
    organ: "脾经 (Spleen Meridian)",
    status: "脾主运化，运送精微供全身思维活动与行动",
    advice: "宜：高效办公，适度喝水避免久坐",
    acupoint: {
      name: "三阴交穴",
      location: "内踝尖上直上3寸，胫骨内侧缘后方",
      benefits: "健脾益气，养血调经，妇科与男科日常保养要穴"
    },
    herbalTea: {
      name: "茯苓陈皮理气饮",
      ingredients: "白茯苓5g、新会陈皮3g、炙甘草2g",
      effect: "健脾燥湿，理气和中，消除职场久坐的肢体水肿"
    },
    tips: [
      "巳时脾脏运化水谷精微，将其化为气血供给大脑，是一天中大脑最清晰、工作效率最高的时间。",
      "不可久坐不动。在中医看来“久坐伤肉”，即久坐会损伤脾胃肌肉力量。",
      "每50分钟建议起身眺望、或者轻叩后脑，提振阳气。"
    ]
  },
  {
    name: "午时",
    timeRange: "11:00 - 13:00",
    organ: "心经 (Heart Meridian)",
    status: "心气充沛，气血会合，是阴阳交替转折期",
    advice: "宜：午休小憩二十分钟（子午觉）",
    acupoint: {
      name: "神门穴",
      location: "手腕掌侧横纹尺侧端，尺侧腕屈肌腱桡侧凹陷处",
      benefits: "安神定志，清心导赤，舒缓工作压力和突发心悸"
    },
    herbalTea: {
      name: "麦冬莲子清心茶",
      ingredients: "干麦冬5g、去芯莲子3g、甘草2g",
      effect: "养阴润燥，清心安神，适合夏日或暑湿及心中烦热者"
    },
    tips: [
      "午时阳气极盛而阴气始生，阴阳相交，必须小憩以养心气。",
      "午休不宜超过45分钟，一般15-30分钟最佳，亦可安静闭目养神（“闭目养心”）。",
      "避免在午时进行剧烈运动或大发脾气，以防心阳过亢。"
    ]
  },
  {
    name: "未时",
    timeRange: "13:00 - 15:00",
    organ: "小肠经 (Small Intestine)",
    status: "分清别浊，吸收水谷精微进入气血血液",
    advice: "宜：多喝水，有助于小肠稀释精微排毒",
    acupoint: {
      name: "后溪穴",
      location: "微握拳，第五指掌关节后尺侧的远侧掌横纹头赤白肉际处",
      benefits: "通督脉，醒脑明目，能有效调理颈椎酸痛、腰痛与鼠标手"
    },
    herbalTea: {
      name: "大麦荷叶消导饮",
      ingredients: "熟大麦6g、干荷叶2g、陈皮2g",
      effect: "消食化积，清热降脂，适合午饭过饱者"
    },
    tips: [
      "午饭营养的吸收由小肠在这个时辰完成负责分清别浊。",
      "这时饮水，能帮助稀释心血管内的血液，促进代谢毒素排除。",
      "可做几次耸肩扩胸运动，拉伸小肠经的循行路径。"
    ]
  },
  {
    name: "申时",
    timeRange: "15:00 - 17:00",
    organ: "膀胱经 (Bladder Meridian)",
    status: "膀胱主水，气化排泄。气血运行至脑部，迎来第二波高效",
    advice: "宜：温饮淡茶，运动或高效学习",
    acupoint: {
      name: "委中穴",
      location: "腘横纹中点，股二头肌腱与半腱肌腱中间",
      benefits: "舒筋活络，祛风湿，“腰背委中求”，缓解久坐腰痛"
    },
    herbalTea: {
      name: "山楂玉米须去湿茶",
      ingredients: "熟山楂4g、玉米须5g、炒薏米6g",
      effect: "利水消肿，醒脾消积，适合午后身体浮肿倦怠"
    },
    tips: [
      "膀胱经是人体最长的一条排毒通道，顶通脑部，下连足踝。",
      "此时是多喝水的绝佳时刻！多喝淡茶或温开水能帮助冲刷排尿，防沙石。",
      "这也是一天中最适合慢跑、拉伸或做八段锦的保养时段。"
    ]
  },
  {
    name: "酉时",
    timeRange: "17:00 - 19:00",
    organ: "肾经 (Kidney Meridian)",
    status: "肾脏封藏，储藏一天的水谷精微与精元",
    advice: "宜：温和饮食，不宜剧烈运动和咸食",
    acupoint: {
      name: "太溪穴",
      location: "足内侧，内踝尖与跟腱之间的凹陷处",
      benefits: "滋阴补肾，强腰健骨，降虚火，延缓精力衰老"
    },
    herbalTea: {
      name: "黑豆黑芝麻润肾糊",
      ingredients: "炒熟黑豆、熟黑芝麻、桑葚干、核桃（冲调或慢煮）",
      effect: "滋补肾阴，养血乌发，常食有益中老年及脑力透支者"
    },
    tips: [
      "肾是人体先天之本。在这个时令要将一天吸收的精华封藏进肾水。",
      "晚餐应当清淡，避免过多食用高盐、过咸的菜肴，以防加重肾脏负担。",
      "酉时可用双手掌心摩擦后腰部的“肾俞”区域发热，有助于温煦肾阳。"
    ]
  },
  {
    name: "戌时",
    timeRange: "19:00 - 21:00",
    organ: "心包经 (Pericardium Meridian)",
    status: "心包保护心肌。此时气血通畅，心气愉悦舒缓",
    advice: "宜：散步、夜间静心或陪伴家人、准备安神",
    acupoint: {
      name: "内关穴",
      location: "腕掌侧横纹上2寸，掌长肌腱与桡侧腕屈肌腱之间",
      benefits: "宽胸理气，宁心安神，调理胸闷、失眠、情绪低落和胃气上逆"
    },
    herbalTea: {
      name: "玫瑰百合解郁茶",
      ingredients: "干百合5g、法兰西玫瑰3g、合欢花2g",
      effect: "疏肝解郁，清心宁神。抚平职场一天的烦躁情绪"
    },
    tips: [
      "心包是心脏的卫士。在这个阶段，情绪应当从兴奋归于柔和、安宁。",
      "不宜进行激动人心的辩论及惊险的阅读，不宜剧烈大声疾呼。",
      "散步是一个极佳的选择，有助于将周身气血归于躯干。"
    ]
  },
  {
    name: "亥时",
    timeRange: "21:00 - 23:00",
    organ: "三焦经 (Triple Energizer)",
    status: "百脉休养，免疫系统与淋巴系统调和修复",
    advice: "宜：温水浴足、静心吐纳、安睡",
    acupoint: {
      name: "外关穴",
      location: "前臂背侧，腕背侧横纹上2寸，桡骨与尺骨之间",
      benefits: "联通诸阳，清热解表，通经活络，调理偏头痛和经络不畅"
    },
    herbalTea: {
      name: "温通足浴包（泡脚配方）",
      ingredients: "艾叶30g、红花10g、干姜10g（煮水泡脚）",
      effect: "温通经络，活血化瘀，驱除全身寒气，大幅改善失眠"
    },
    tips: [
      "三焦主持诸气，联通人体五脏六腑。在这个时间，百脉需要全面休养生息。",
      "泡脚水温宜控制在38-42℃，泡20分钟直到身体微微出汗即可（千万不可大汗淋漓伤气）。",
      "此时不宜多饮水，有利于清晨醒后面部不水肿。"
    ]
  }
];

export function getShichenByTime(date: Date = new Date()): ShichenInfo {
  const hours = date.getHours();
  
  if (hours >= 23 || hours < 1) return SHICHEN_DATA[0]; // 子时
  if (hours >= 1 && hours < 3) return SHICHEN_DATA[1];  // 丑时
  if (hours >= 3 && hours < 5) return SHICHEN_DATA[2];  // 寅时
  if (hours >= 5 && hours < 7) return SHICHEN_DATA[3];  // 卯时
  if (hours >= 7 && hours < 9) return SHICHEN_DATA[4];  // 辰时
  if (hours >= 9 && hours < 11) return SHICHEN_DATA[5]; // 巳时
  if (hours >= 11 && hours < 13) return SHICHEN_DATA[6]; // 午时
  if (hours >= 13 && hours < 15) return SHICHEN_DATA[7]; // 未时
  if (hours >= 15 && hours < 17) return SHICHEN_DATA[8]; // 申时
  if (hours >= 17 && hours < 19) return SHICHEN_DATA[9]; // 酉时
  if (hours >= 19 && hours < 21) return SHICHEN_DATA[10]; // 戌时
  return SHICHEN_DATA[11]; // 亥时 (21:00 - 23:00)
}
