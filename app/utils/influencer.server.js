import prisma from "../db.server.js";
import { calculateAmbassadorLevel, calculateTotalFollowers } from "./calculations.js";

/**
 * 获取所有创作者
 */
export async function getAllInfluencers(shopId) {
  const influencers = await prisma.influencer.findMany({
    where: { shopId },
    orderBy: { createdAt: 'desc' }
  });
  
  // 更新 totalFollowers 和 ambassadorLevel
  return influencers.map(influencer => ({
    ...influencer,
    totalFollowers: calculateTotalFollowers(influencer),
    ambassadorLevel: calculateAmbassadorLevel(influencer)
  }));
}

/**
 * 根据 ID 获取单个创作者
 */
export async function getInfluencerById(id, shopId) {
  const influencer = await prisma.influencer.findFirst({
    where: { id, shopId }
  });
  
  if (!influencer) return null;
  
  return {
    ...influencer,
    totalFollowers: calculateTotalFollowers(influencer),
    ambassadorLevel: calculateAmbassadorLevel(influencer)
  };
}

/**
 * 创建新创作者
 */
export async function createInfluencer(data, shopId) {
  const influencer = await prisma.influencer.create({
    data: {
      ...data,
      shopId,
      totalFollowers: calculateTotalFollowers(data),
      ambassadorLevel: calculateAmbassadorLevel(data)
    }
  });
  
  return {
    ...influencer,
    totalFollowers: calculateTotalFollowers(influencer),
    ambassadorLevel: calculateAmbassadorLevel(influencer)
  };
}

/**
 * 更新创作者信息
 */
export async function updateInfluencer(id, data, shopId) {
  // 计算新的总粉丝数和等级
  const currentInfluencer = await prisma.influencer.findFirst({
    where: { id, shopId }
  });
  
  if (!currentInfluencer) return null;
  
  const updatedData = {
    ...data,
    totalFollowers: calculateTotalFollowers({ ...currentInfluencer, ...data }),
    ambassadorLevel: calculateAmbassadorLevel({ ...currentInfluencer, ...data })
  };
  
  const influencer = await prisma.influencer.update({
    where: { id },
    data: updatedData
  });
  
  return {
    ...influencer,
    totalFollowers: calculateTotalFollowers(influencer),
    ambassadorLevel: calculateAmbassadorLevel(influencer)
  };
}

/**
 * 删除创作者
 */
export async function deleteInfluencer(id, shopId) {
  return await prisma.influencer.deleteMany({
    where: { id, shopId }
  });
}

/**
 * 搜索创作者
 */
export async function searchInfluencers(query, shopId) {
  const influencers = await prisma.influencer.findMany({
    where: {
      shopId,
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { company: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } }
      ]
    }
  });
  
  return influencers.map(influencer => ({
    ...influencer,
    totalFollowers: calculateTotalFollowers(influencer),
    ambassadorLevel: calculateAmbassadorLevel(influencer)
  }));
}

/**
 * 按条件筛选创作者
 */
export async function filterInfluencers(filters, shopId) {
  const whereClause = { shopId };
  
  if (filters.status) {
    whereClause.collaborationStatus = filters.status;
  }
  
  if (filters.ambassadorLevel) {
    whereClause.ambassadorLevel = parseInt(filters.ambassadorLevel);
  }
  
  if (filters.location) {
    whereClause.location = { contains: filters.location, mode: 'insensitive' };
  }
  
  if (filters.minFollowers) {
    whereClause.totalFollowers = { gte: parseInt(filters.minFollowers) };
  }
  
  const influencers = await prisma.influencer.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' }
  });
  
  return influencers.map(influencer => ({
    ...influencer,
    totalFollowers: calculateTotalFollowers(influencer),
    ambassadorLevel: calculateAmbassadorLevel(influencer)
  }));
}
