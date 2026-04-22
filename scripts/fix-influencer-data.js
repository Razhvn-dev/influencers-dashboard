import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 中文到英文枚举的映射
const STATUS_MAP = {
  '未申请': 'APPLIED',
  '已申请': 'APPLIED',
  '已联系': 'CONTACTED',
  '已安排通话': 'CALL_SCHEDULED',
  '审核中': 'UNDER_REVIEW',
  '已批准': 'APPROVED',
  '已拒绝': 'REJECTED',
  '在合作中': 'ACTIVE_AMBASSADOR',
  '活跃大使': 'ACTIVE_AMBASSADOR',
  '过去合作伙伴': 'PAST_PARTNER',
  '过往合作伙伴': 'PAST_PARTNER',
};

const LEVEL_MAP = {
  '未达标': 'NONE',
  '一级大使': 'AMBASSADOR_1',
  '二级大使': 'AMBASSADOR_2',
  '三级大使': 'AMBASSADOR_3',
};

async function fixInfluencerData() {
  try {
    console.log('开始修复 Influencer 数据...\n');

    // 获取所有 Influencer 记录
    const influencers = await prisma.influencer.findMany();
    
    console.log(`找到 ${influencers.length} 条记录\n`);

    let updatedCount = 0;

    for (const influencer of influencers) {
      const updates = {};

      // 修复 collaborationStatus
      if (influencer.collaborationStatus && STATUS_MAP[influencer.collaborationStatus]) {
        updates.collaborationStatus = STATUS_MAP[influencer.collaborationStatus];
        console.log(`记录 ${influencer.id}:`);
        console.log(`  collaborationStatus: "${influencer.collaborationStatus}" -> "${updates.collaborationStatus}"`);
      }

      // 修复 ambassadorLevel
      if (influencer.ambassadorLevel && LEVEL_MAP[influencer.ambassadorLevel]) {
        updates.ambassadorLevel = LEVEL_MAP[influencer.ambassadorLevel];
        console.log(`  ambassadorLevel: "${influencer.ambassadorLevel}" -> "${updates.ambassadorLevel}"`);
      }

      // 如果有需要更新的字段
      if (Object.keys(updates).length > 0) {
        await prisma.influencer.update({
          where: { id: influencer.id },
          data: updates,
        });
        updatedCount++;
        console.log('  ✅ 已更新\n');
      }
    }

    console.log(`\n修复完成！共更新 ${updatedCount} 条记录`);
  } catch (error) {
    console.error('修复失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixInfluencerData();
