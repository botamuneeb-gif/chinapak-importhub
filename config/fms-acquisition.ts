import { ROUTES, brand } from "@/config/brand";

export type FmsSeoFaq = {
  answer: string;
  question: string;
};

export type FmsSeoSection = {
  body: string[];
  bullets?: string[];
  title: string;
};

export type FmsSeoPage = {
  canonicalPath: string;
  description: string;
  eyebrow: string;
  faqs: FmsSeoFaq[];
  h1: string;
  intro: string;
  kind: "core" | "city" | "category";
  sections: FmsSeoSection[];
  title: string;
};

export type FmsSeoPageType = "hub" | "core" | "city" | "category" | "apply";

export const fmsAcquisitionKeywords = [
  "工厂对接专员",
  "中国采购代理兼职",
  "外贸采购兼职",
  "巴基斯坦买家对接",
  "中国工厂报价收集",
  "供应商资料收集兼职",
  "工厂验厂协助",
  "1688 采购协助",
  "阿里巴巴供应商对接",
  "中国供应链专员",
  "跨境贸易助理",
  "外贸自由职业",
] as const;

export const fmsApplicationSource = "public_fms_application" as const;

const defaultFaqs: FmsSeoFaq[] = [
  {
    question: "FMS 是否可以直接联系巴基斯坦进口商？",
    answer:
      "不可以。ChinaPak ImportHub 采用平台和管理员控制的工作流程，FMS 不会看到进口商的私人联系方式，也不能私下联系进口商。",
  },
  {
    question: "提交申请后会自动开通账号吗？",
    answer:
      "不会。/fms/apply 只是申请表，不是公开注册。管理员会人工审核候选人，只有通过审核后才会创建或激活 FMS 账号。",
  },
  {
    question: "平台是否保证收入？",
    answer:
      "不保证固定收入或订单数量。FMS 工作取决于项目需求、类别、地区、管理员审核和候选人的交付质量。",
  },
];

const sharedSections: FmsSeoSection[] = [
  {
    title: "FMS 在平台中的边界",
    body: [
      "Factory Match Specialist 的核心工作是根据已经分配的进口项目，在中国寻找合适的工厂、收集报价、照片、视频、产品资料和供应商背景信息，然后提交给 ChinaPak ImportHub 管理员审核。",
      "FMS 不直接服务进口商个人，也不私下收款。所有项目、文件、证据和状态都通过平台管理，管理员决定哪些内容可以整理成进口商可见的报告。",
    ],
  },
  {
    title: "适合申请的人",
    body: [
      "适合熟悉中国工厂、1688、阿里巴巴供应商、产业带、报价沟通、样品协调或基础验厂协助的人。候选人可以是采购助理、外贸自由职业者、跨境贸易助理、供应链从业者，或熟悉本地产业带的兼职采购代理。",
      "平台更重视清晰沟通、证据质量、保密意识和按要求提交结构化资料，而不是夸大资源或承诺一定可以拿到最低价格。",
    ],
  },
  {
    title: "管理员审核和保密规则",
    body: [
      "每一次工厂选项提交都会先进入管理员审核。FMS 不应在进口商可见字段中放入私人电话、微信、邮箱、银行账号、付款指令或未经批准的工厂联系方式。",
      "工厂联系方式和敏感资料属于平台内部资料，只有在未来明确批准的套餐或工作流中才可能释放。现阶段公开页面只收集候选人申请，不开放 FMS 自助注册。",
    ],
  },
];

const corePages: FmsSeoPage[] = [
  {
    canonicalPath: "/fms/china-sourcing-jobs",
    description:
      "面向中国采购代理、外贸自由职业者和供应链助理的 FMS 机会说明，了解如何通过 ChinaPak ImportHub 服务巴基斯坦进口项目。",
    eyebrow: "中国采购代理兼职",
    h1: "中国采购代理兼职与工厂对接专员机会",
    intro:
      "ChinaPak ImportHub 正在建设面向巴基斯坦进口商的中国工厂对接网络。中国采购代理、外贸采购兼职、1688 采购协助人员和供应商资料收集兼职，可以申请成为 FMS 候选人。",
    kind: "core",
    title: "中国采购代理兼职 | ChinaPak ImportHub FMS",
    sections: [
      {
        title: "这不是公开账号注册",
        body: [
          "FMS 申请不是自动开通后台账号，也不是公开接单平台。候选人通过申请表提交背景、城市、产品类别和经验，管理员审核后才可能邀请进入 FMS 门户。",
          "这种人工审核机制保护进口商、FMS 和工厂资料，避免未经授权的直接联系、私下收款或敏感资料外泄。",
        ],
      },
      ...sharedSections,
      {
        title: "可能涉及的工作内容",
        body: [
          "根据项目需求，FMS 可能需要收集中国工厂报价、MOQ、生产周期、包装方式、样品情况、工厂照片、产品视频、供应商资料和风险说明。",
          "每个项目都以管理员分配为准。FMS 提交的资料先进入后台审核，只有经过整理和脱敏的内容才会进入进口商报告。",
        ],
        bullets: [
          "中国工厂报价收集",
          "供应商资料收集兼职",
          "1688 采购协助",
          "阿里巴巴供应商对接",
          "工厂验厂协助和照片视频收集",
        ],
      },
    ],
    faqs: defaultFaqs,
  },
  {
    canonicalPath: "/fms/factory-match-specialist",
    description:
      "了解 Factory Match Specialist 的职责、平台保密规则、管理员审核流程，以及如何申请成为 ChinaPak ImportHub FMS 候选人。",
    eyebrow: "Factory Match Specialist",
    h1: "什么是工厂对接专员 FMS？",
    intro:
      "FMS 是 ChinaPak ImportHub 的 Factory Match Specialist，负责帮助巴基斯坦进口项目在中国寻找合适工厂并提交管理员审核资料。",
    kind: "core",
    title: "工厂对接专员 FMS 职责 | ChinaPak ImportHub",
    sections: [
      {
        title: "FMS 的核心价值",
        body: [
          "很多巴基斯坦小型进口商、批发商和店主没有时间或预算亲自来中国寻找工厂。FMS 的价值是把本地产业带、采购沟通和证据收集能力转化为结构化项目资料。",
          "FMS 帮助平台减少无效中间层，但不会绕过平台直接与进口商交易。平台使用项目 ID、管理员审核、报告发布和文件权限来管理工作边界。",
        ],
      },
      ...sharedSections,
      {
        title: "交付质量要求",
        body: [
          "高质量 FMS 提交不仅是发几个工厂名字。更好的提交会说明产品匹配度、价格条件、MOQ、交期、包装、定制能力、质量风险、沟通记录摘要和证据来源。",
          "管理员会根据资料完整度、准确性、保密合规、响应速度和项目适配度来评估候选人后续是否适合更多任务。",
        ],
      },
    ],
    faqs: defaultFaqs,
  },
  {
    canonicalPath: "/fms/china-procurement-agent",
    description:
      "面向中国供应链专员、采购助理和外贸自由职业者的巴基斯坦买家对接机会说明。",
    eyebrow: "中国供应链专员",
    h1: "中国采购代理如何服务巴基斯坦买家对接",
    intro:
      "如果你熟悉中国供应链、工厂沟通或跨境贸易协助，可以申请成为 ChinaPak ImportHub 的 FMS 候选人，为巴基斯坦进口项目收集工厂资料。",
    kind: "core",
    title: "中国采购代理与巴基斯坦买家对接 | ChinaPak ImportHub",
    sections: [
      {
        title: "从私人对接到平台化流程",
        body: [
          "传统采购代理常常依靠私人关系、微信沟通和零散文件。ChinaPak ImportHub 的目标是把项目需求、工厂资料、证据、审核和进口商报告放在统一流程中。",
          "这种方式更适合服务第一次进口或中小型巴基斯坦买家，因为他们需要清楚、可追踪、经过管理员审核的工厂选项。",
        ],
      },
      ...sharedSections,
      {
        title: "适合的经验背景",
        body: [
          "有 1688 采购协助、阿里巴巴供应商对接、工厂报价收集、外贸跟单、样品沟通、产业带走访或基础验厂协助经验的人，通常更容易理解 FMS 工作要求。",
          "平台不会要求候选人公开个人私密资料给进口商。管理员会在后台审核候选人和项目交付。",
        ],
      },
    ],
    faqs: defaultFaqs,
  },
];

const cityTargets = [
  {
    city: "广州",
    focus: "服装、皮具、电子配件、美妆包装和日用百货",
    slug: "guangzhou",
  },
  {
    city: "深圳",
    focus: "电子产品、智能配件、消费电子、LED 和跨境供应链",
    slug: "shenzhen",
  },
  {
    city: "义乌",
    focus: "小商品、礼品、玩具、家居用品和低 MOQ 产品",
    slug: "yiwu",
  },
  {
    city: "佛山",
    focus: "家具、建材、卫浴、照明和家居用品",
    slug: "foshan",
  },
  {
    city: "宁波",
    focus: "五金、汽配、家电、出口制造和港口供应链",
    slug: "ningbo",
  },
  {
    city: "上海",
    focus: "综合贸易、品牌供应链、展会资源和质量沟通",
    slug: "shanghai",
  },
  {
    city: "青岛",
    focus: "机械、轮胎、汽配、包装材料和港口外贸",
    slug: "qingdao",
  },
  {
    city: "厦门",
    focus: "石材、礼品、鞋服、家居和外贸供应商资源",
    slug: "xiamen",
  },
] as const;

const categoryTargets = [
  {
    category: "电子产品",
    focus:
      "消费电子、手机配件、LED、小家电、智能产品和电子类供应商资料",
    slug: "electronics-sourcing",
  },
  {
    category: "纺织服装",
    focus: "服装、面料、家纺、帽子、鞋服辅料和包装定制",
    slug: "textile-garment-sourcing",
  },
  {
    category: "家居用品",
    focus: "日用百货、厨房用品、收纳、家具配件和家居装饰",
    slug: "home-goods-sourcing",
  },
  {
    category: "机械设备",
    focus: "小型机械、包装设备、食品设备、五金工具和工业配件",
    slug: "machinery-sourcing",
  },
  {
    category: "美妆包装",
    focus: "化妆品包装、瓶罐、纸盒、标签、私标包装和展示物料",
    slug: "beauty-packaging-sourcing",
  },
  {
    category: "汽车配件",
    focus: "汽配、摩托车配件、轮胎、灯具、电器配件和维修耗材",
    slug: "auto-parts-sourcing",
  },
  {
    category: "玩具礼品",
    focus: "玩具、节日礼品、文具、促销品、儿童用品和义乌小商品",
    slug: "toys-gifts-sourcing",
  },
] as const;

const cityPages: FmsSeoPage[] = cityTargets.map((target) => ({
  canonicalPath: `/fms/china/${target.slug}`,
  description: `${target.city} FMS 工厂对接专员机会，适合熟悉${target.focus}的中国采购代理和外贸自由职业者申请。`,
  eyebrow: `${target.city} FMS`,
  h1: `${target.city}工厂对接专员：服务巴基斯坦进口项目`,
  intro: `如果你在${target.city}或周边产业带熟悉${target.focus}，可以申请成为 ChinaPak ImportHub FMS 候选人，帮助巴基斯坦进口商收集工厂报价、照片、视频和供应商资料。`,
  kind: "city",
  title: `${target.city}工厂对接专员机会 | ChinaPak ImportHub`,
  sections: [
    {
      title: `为什么${target.city}适合 FMS 工作`,
      body: [
        `${target.city}拥有成熟的市场、展会资源、供应商网络和外贸服务基础。对巴基斯坦进口商来说，本地 FMS 可以更快理解工厂位置、常见 MOQ、报价方式和行业惯例。`,
        `熟悉${target.focus}的候选人，可以把本地经验转化为结构化的中国工厂报价收集、供应商资料收集兼职和工厂验厂协助。`,
      ],
    },
    ...sharedSections,
    {
      title: "申请时建议说明的能力",
      body: [
        "请在申请表中说明你熟悉的产品类别、可覆盖的工厂区域、语言能力、是否能收集照片视频和报价，以及是否能在管理员要求下进行线下工厂走访。",
        "申请不会自动成为付费任务，也不会开通 FMS 后台。管理员会根据城市、类别、经验和合规意识进行人工评估。",
      ],
    },
  ],
  faqs: defaultFaqs,
}));

const categoryPages: FmsSeoPage[] = categoryTargets.map((target) => ({
  canonicalPath: `/fms/categories/${target.slug}`,
  description: `${target.category}采购协助与工厂对接专员机会，面向熟悉${target.focus}的中国供应链人员。`,
  eyebrow: `${target.category} FMS`,
  h1: `${target.category}工厂对接专员申请说明`,
  intro: `ChinaPak ImportHub 需要熟悉${target.focus}的 FMS 候选人，为巴基斯坦买家对接合适中国工厂并收集管理员审核资料。`,
  kind: "category",
  title: `${target.category}采购协助 FMS | ChinaPak ImportHub`,
  sections: [
    {
      title: `${target.category}项目通常需要什么资料`,
      body: [
        `巴基斯坦进口商在${target.category}项目中通常需要了解产品匹配度、MOQ、价格区间、样品情况、生产周期、包装选择、定制能力和基本质量风险。`,
        "FMS 的任务不是向进口商直接销售产品，而是按平台项目要求收集、整理并提交管理员可审核的证据。",
      ],
    },
    ...sharedSections,
    {
      title: "类别经验如何帮助申请",
      body: [
        `如果你长期接触${target.focus}，请在申请中写清楚常见供应商地区、你会使用的平台或渠道、可收集的证据类型，以及你理解的风险点。`,
        "清楚、真实、可验证的经验比夸大资源更重要。平台会优先考虑能稳定提交结构化报告、遵守保密规则的候选人。",
      ],
    },
  ],
  faqs: defaultFaqs,
}));

export const fmsSeoPages: FmsSeoPage[] = [
  ...corePages,
  ...cityPages,
  ...categoryPages,
];

export const fmsPublicSitemapRoutes = [
  ROUTES.fms,
  ROUTES.fmsApply,
  ...fmsSeoPages.map((page) => page.canonicalPath),
] as const;

export function getFmsSeoPageBySlug(slugSegments: string[]) {
  const canonicalPath = `/fms/${slugSegments.join("/")}`;

  return fmsSeoPages.find((page) => page.canonicalPath === canonicalPath);
}

export function buildFmsPageUrl(path: string) {
  return `https://${brand.domain}${path}`;
}

export function buildFmsApplyTrackingHref({
  campaign,
  pageType,
  sourcePage,
}: {
  campaign?: string;
  pageType: FmsSeoPageType;
  sourcePage: string;
}) {
  const params = new URLSearchParams({
    fms_seo_page_type: pageType,
    source_page: sourcePage,
    source_page_slug: sourcePage.replace(/^\/+/, "").replaceAll("/", "-") || "fms",
    utm_campaign:
      campaign ??
      (pageType === "city"
        ? "fms_china_acquisition"
        : pageType === "category"
          ? "fms_category_acquisition"
          : pageType === "hub"
            ? "fms_hub_acquisition"
            : "fms_core_acquisition"),
    utm_medium: "organic_page",
    utm_source: "fms_seo",
  });

  return `${ROUTES.fmsApply}?${params.toString()}`;
}
