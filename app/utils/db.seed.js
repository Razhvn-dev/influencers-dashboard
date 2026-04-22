import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seed() {
  let shop = await prisma.shop.findFirst({
    where: { name: 'Test Shop' }
  });

  if (!shop) {
    console.log('未找到 Shop 记录，正在创建...');
    shop = await prisma.shop.create({
      data: {
        id: 'test-shop-001',
        name: 'Test Shop',
        email: 'test@shop.com'
      }
    });
    console.log('✓ Shop 记录创建成功');
  }

  const sampleInfluencers = [
    {
      name: 'Sarah Johnson',
      company: 'Beauty & Lifestyle',
      email: 'sarah.johnson@example.com',
      location: 'Los Angeles, USA',
      youtubeUrl: 'https://youtube.com/@sarahjohnson',
      facebookUrl: 'https://facebook.com/sarahjohnsonbeauty',
      instagramUrl: 'https://instagram.com/sarahjohnson',
      tiktokUrl: 'https://tiktok.com/@sarahjohnson',
      youtubeFollowers: 250000,
      facebookFollowers: 180000,
      instagramFollowers: 520000,
      tiktokFollowers: 680000,
      collaborationStatus: 'ACTIVE_AMBASSADOR',
      notes: '顶级合作创作者，月均产出4条视频，转化率极高',
      contractStatus: '已签署',
      productsOffered: '全系列护肤产品',
      deliverables: '每月4条视频，8条Instagram Stories'
    },
    {
      name: 'Mike Chen',
      company: 'Tech Review Pro',
      email: 'mike.chen@example.com',
      location: 'San Francisco, USA',
      youtubeUrl: 'https://youtube.com/@mikechentech',
      instagramUrl: 'https://instagram.com/mikechentech',
      tiktokUrl: 'https://tiktok.com/@mikechentech',
      youtubeFollowers: 1200000,
      facebookFollowers: 350000,
      instagramFollowers: 890000,
      tiktokFollowers: 1500000,
      collaborationStatus: 'ACTIVE_AMBASSADOR',
      notes: '科技类头部创作者，粉丝质量高，适合高端产品线',
      contractStatus: '已签署',
      productsOffered: '科技配件系列产品',
      deliverables: '每月2条深度评测视频'
    },
    {
      name: 'Emma Williams',
      company: 'Fashion Forward',
      email: 'emma.williams@example.com',
      location: 'New York, USA',
      youtubeUrl: 'https://youtube.com/@emmawilliamsfashion',
      facebookUrl: 'https://facebook.com/emmawilliamsstyle',
      instagramUrl: 'https://instagram.com/emmawilliams',
      tiktokUrl: 'https://tiktok.com/@emmawilliams',
      youtubeFollowers: 450000,
      facebookFollowers: 280000,
      instagramFollowers: 720000,
      tiktokFollowers: 950000,
      collaborationStatus: 'APPROVED',
      notes: '时尚领域影响力强，待签署合同',
      contractStatus: '待签署',
      productsOffered: '春夏系列服装',
      deliverables: '每月3条穿搭视频，5篇图文'
    },
    {
      name: 'David Park',
      company: 'Fitness & Wellness',
      email: 'david.park@example.com',
      location: 'Miami, USA',
      youtubeUrl: 'https://youtube.com/@davidparkfitness',
      instagramUrl: 'https://instagram.com/davidparkfit',
      tiktokUrl: 'https://tiktok.com/@davidparkfit',
      youtubeFollowers: 380000,
      facebookFollowers: 150000,
      instagramFollowers: 560000,
      tiktokFollowers: 820000,
      collaborationStatus: 'UNDER_REVIEW',
      notes: '健身领域优质创作者，正在审核合作方案',
      contractStatus: '审核中',
      productsOffered: '运动营养品系列',
      deliverables: '每月2条训练视频，产品植入'
    },
    {
      name: 'Lisa Anderson',
      company: 'Home & Living',
      email: 'lisa.anderson@example.com',
      location: 'Chicago, USA',
      youtubeUrl: 'https://youtube.com/@lisaandersonhome',
      facebookUrl: 'https://facebook.com/lisaandersonliving',
      instagramUrl: 'https://instagram.com/lisaandersonhome',
      youtubeFollowers: 320000,
      facebookFollowers: 420000,
      instagramFollowers: 480000,
      tiktokFollowers: 290000,
      collaborationStatus: 'CONTACTED',
      notes: '已初次联系，等待回复合作意向',
      contractStatus: null,
      productsOffered: '家居装饰系列',
      deliverables: '待定'
    },
    {
      name: 'Alex Thompson',
      company: 'Gaming Central',
      email: 'alex.thompson@example.com',
      location: 'Seattle, USA',
      youtubeUrl: 'https://youtube.com/@alexthompsongaming',
      instagramUrl: 'https://instagram.com/alexthompsongaming',
      tiktokUrl: 'https://tiktok.com/@alexthompsongaming',
      youtubeFollowers: 850000,
      facebookFollowers: 320000,
      instagramFollowers: 650000,
      tiktokFollowers: 1100000,
      collaborationStatus: 'CALL_SCHEDULED',
      notes: '已安排视频通话，讨论合作细节',
      contractStatus: null,
      productsOffered: '游戏周边产品',
      deliverables: '每月4条游戏视频植入'
    },
    {
      name: 'Rachel Green',
      company: 'Food & Travel',
      email: 'rachel.green@example.com',
      location: 'Austin, USA',
      youtubeUrl: 'https://youtube.com/@rachelgreenfood',
      facebookUrl: 'https://facebook.com/rachelgreentravel',
      instagramUrl: 'https://instagram.com/rachelgreen',
      tiktokUrl: 'https://tiktok.com/@rachelgreenfood',
      youtubeFollowers: 520000,
      facebookFollowers: 380000,
      instagramFollowers: 780000,
      tiktokFollowers: 920000,
      collaborationStatus: 'ACTIVE_AMBASSADOR',
      notes: '美食旅游类头部创作者，合作效果优秀',
      contractStatus: '已签署',
      productsOffered: '厨房用品系列',
      deliverables: '每月3条美食制作视频'
    },
    {
      name: 'James Wilson',
      company: 'Automotive Reviews',
      email: 'james.wilson@example.com',
      location: 'Detroit, USA',
      youtubeUrl: 'https://youtube.com/@jameswilsonauto',
      facebookUrl: 'https://facebook.com/jameswilsonreviews',
      instagramUrl: 'https://instagram.com/jameswilsonauto',
      youtubeFollowers: 680000,
      facebookFollowers: 450000,
      instagramFollowers: 390000,
      tiktokFollowers: 520000,
      collaborationStatus: 'APPLIED',
      notes: '新申请者，汽车领域专业创作者',
      contractStatus: null,
      productsOffered: null,
      deliverables: null
    },
    {
      name: 'Sophie Martinez',
      company: 'Parenting & Family',
      email: 'sophie.martinez@example.com',
      location: 'Denver, USA',
      youtubeUrl: 'https://youtube.com/@sophiemartinezfamily',
      facebookUrl: 'https://facebook.com/sophiemartinezparenting',
      instagramUrl: 'https://instagram.com/sophiemartinez',
      tiktokUrl: 'https://tiktok.com/@sophiemartinez',
      youtubeFollowers: 290000,
      facebookFollowers: 520000,
      instagramFollowers: 410000,
      tiktokFollowers: 380000,
      collaborationStatus: 'REJECTED',
      notes: '内容定位与品牌不符，已拒绝',
      contractStatus: null,
      productsOffered: null,
      deliverables: null
    },
    {
      name: 'Tom Harris',
      company: 'DIY & Crafts',
      email: 'tom.harris@example.com',
      location: 'Portland, USA',
      youtubeUrl: 'https://youtube.com/@tomharrisdiy',
      instagramUrl: 'https://instagram.com/tomharrisdiy',
      tiktokUrl: 'https://tiktok.com/@tomharrisdiy',
      youtubeFollowers: 420000,
      facebookFollowers: 280000,
      instagramFollowers: 350000,
      tiktokFollowers: 680000,
      collaborationStatus: 'PAST_PARTNER',
      notes: '曾合作过2个季度，效果一般，暂未续约',
      contractStatus: '已到期',
      productsOffered: '手工工具套装',
      deliverables: '已完成约定内容'
    },
    {
      name: 'Nina Patel',
      company: 'Pet Lovers',
      email: 'nina.patel@example.com',
      location: 'Boston, USA',
      youtubeUrl: 'https://youtube.com/@ninapatelpets',
      facebookUrl: 'https://facebook.com/ninapatelpetlovers',
      instagramUrl: 'https://instagram.com/ninapatel',
      tiktokUrl: 'https://tiktok.com/@ninapatelpets',
      youtubeFollowers: 560000,
      facebookFollowers: 390000,
      instagramFollowers: 620000,
      tiktokFollowers: 890000,
      collaborationStatus: 'ACTIVE_AMBASSADOR',
      notes: '宠物领域顶级创作者，粉丝忠诚度极高',
      contractStatus: '已签署',
      productsOffered: '宠物食品及用品',
      deliverables: '每月5条宠物日常视频'
    },
    {
      name: 'Chris Lee',
      company: 'Music & Entertainment',
      email: 'chris.lee@example.com',
      location: 'Nashville, USA',
      youtubeUrl: 'https://youtube.com/@chrisleemusic',
      instagramUrl: 'https://instagram.com/chrisleemusic',
      tiktokUrl: 'https://tiktok.com/@chrisleemusic',
      youtubeFollowers: 780000,
      facebookFollowers: 420000,
      instagramFollowers: 950000,
      tiktokFollowers: 1300000,
      collaborationStatus: 'APPROVED',
      notes: '音乐娱乐类创作者，已批准合作',
      contractStatus: '待签署',
      productsOffered: '音频设备系列',
      deliverables: '每月2条音乐视频，产品植入'
    },
    {
      name: 'Jessica Brown',
      company: 'Education & Learning',
      email: 'jessica.brown@example.com',
      location: 'Washington DC, USA',
      youtubeUrl: 'https://youtube.com/@jessicabrownedu',
      facebookUrl: 'https://facebook.com/jessicabrownlearning',
      instagramUrl: 'https://instagram.com/jessicabrown',
      youtubeFollowers: 340000,
      facebookFollowers: 480000,
      instagramFollowers: 290000,
      tiktokFollowers: 150000,
      collaborationStatus: 'CONTACTED',
      notes: '教育领域专业创作者，已发送邮件',
      contractStatus: null,
      productsOffered: '学习工具套装',
      deliverables: '待定'
    },
    {
      name: 'Ryan Taylor',
      company: 'Outdoor Adventure',
      email: 'ryan.taylor@example.com',
      location: 'Boulder, USA',
      youtubeUrl: 'https://youtube.com/@ryantayloroutdoor',
      instagramUrl: 'https://instagram.com/ryantayloradventure',
      tiktokUrl: 'https://tiktok.com/@ryantayloroutdoor',
      youtubeFollowers: 490000,
      facebookFollowers: 210000,
      instagramFollowers: 580000,
      tiktokFollowers: 720000,
      collaborationStatus: 'UNDER_REVIEW',
      notes: '户外运动领域创作者，正在评估合作方案',
      contractStatus: '审核中',
      productsOffered: '户外装备系列',
      deliverables: '每月3条户外探险视频'
    },
    {
      name: 'Amanda White',
      company: 'Art & Design',
      email: 'amanda.white@example.com',
      location: 'San Diego, USA',
      youtubeUrl: 'https://youtube.com/@amandawhiteart',
      facebookUrl: 'https://facebook.com/amandawhitedesign',
      instagramUrl: 'https://instagram.com/amandawhiteart',
      tiktokUrl: 'https://tiktok.com/@amandawhiteart',
      youtubeFollowers: 380000,
      facebookFollowers: 320000,
      instagramFollowers: 690000,
      tiktokFollowers: 540000,
      collaborationStatus: 'APPLIED',
      notes: '艺术设计类创作者，新申请待审核',
      contractStatus: null,
      productsOffered: null,
      deliverables: null
    }
  ];

  let successCount = 0;
  let failCount = 0;

  for (const influencer of sampleInfluencers) {
    try {
      await prisma.influencer.create({
        data: {
          ...influencer,
          shopId: shop.id,
          totalFollowers:
            influencer.youtubeFollowers +
            influencer.facebookFollowers +
            influencer.instagramFollowers +
            influencer.tiktokFollowers
        }
      });
      console.log(`✓ 已创建创作者: ${influencer.name}`);
      successCount++;
    } catch (error) {
      console.log(`✗ 创建失败 ${influencer.name}: ${error.message}`);
      failCount++;
    }
  }

  console.log(`\n===== 种子数据创建完成 =====`);
  console.log(`成功: ${successCount} 条`);
  console.log(`失败: ${failCount} 条`);
  console.log(`总计: ${sampleInfluencers.length} 条`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
