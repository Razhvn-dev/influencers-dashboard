import prisma from "../db.server.js";

/**
 * Get or create shop record by shop domain
 */
async function ensureShop(shopDomain) {
  try {
    // Use shopDomain as id to upsert Shop record
    const shop = await prisma.shop.upsert({
      where: { id: shopDomain },
      update: {},
      create: { 
        id: shopDomain,
        name: shopDomain 
      },
    });
    return shop.id;
  } catch (error) {
    console.error('Shop upsert failed:', error.message);
    throw new Error(`Failed to create or get shop record: ${shopDomain}`);
  }
}

/**
 * Calculate total followers
 */
function calculateTotalFollowers(data) {
  return (data.youtubeFollowers || 0) + 
         (data.instagramFollowers || 0) + 
         (data.tiktokFollowers || 0) + 
         (data.facebookFollowers || 0);
}

/**
 * Determine Ambassador Level
 * Based on total followers and YouTube subscribers
 */
function calculateAmbassadorLevel(data) {
  const totalFollowers = calculateTotalFollowers(data);
  const youtubeFollowers = data.youtubeFollowers || 0;
  
  if (totalFollowers >= 100000 && youtubeFollowers >= 50000) {
    return 'AMBASSADOR_1';
  }
  if (totalFollowers >= 50000 && youtubeFollowers >= 20000) {
    return 'AMBASSADOR_2';
  }
  if (totalFollowers >= 10000 && youtubeFollowers >= 5000) {
    return 'AMBASSADOR_3';
  }
  return 'NONE';
}

/**
 * Get all influencers for current shop with calculated total followers and ambassador level
 */
export async function getInfluencers(shopDomain) {
  const shopId = await ensureShop(shopDomain);
  const influencers = await prisma.influencer.findMany({
    where: { shopId },
    select: {
      id: true,
      name: true,
      company: true,
      email: true,
      location: true,
      youtubeFollowers: true,
      instagramFollowers: true,
      tiktokFollowers: true,
      facebookFollowers: true,
      collaborationStatus: true,
      // Note: Do not select ambassadorLevel as we will recalculate it
      // Also do not select large fields like notes, contractStatus
    },
    orderBy: { createdAt: "desc" },
  });

  // Calculate total followers and ambassador level
  return influencers.map((inf) => ({
    ...inf,
    totalFollowers: calculateTotalFollowers(inf),
    ambassadorLevel: calculateAmbassadorLevel(inf),
  }));
}

/**
 * Get single influencer by ID
 */
export async function getInfluencer(id, shopDomain) {
  const shopId = await ensureShop(shopDomain);
  const influencer = await prisma.influencer.findFirst({
    where: { id, shopId },
  });
  
  if (!influencer) return null;

  return {
    ...influencer,
    totalFollowers: calculateTotalFollowers(influencer),
    ambassadorLevel: calculateAmbassadorLevel(influencer),
  };
}

/**
 * Create new influencer
 */
export async function createInfluencer(data) {
  // Form validation: name is required
  if (!data.name || data.name.trim() === "") {
    throw new Error("Name cannot be empty");
  }

  const shopId = await ensureShop(data.shopId);

  // Calculate total followers and ambassador level
  const totalFollowers = calculateTotalFollowers(data);
  const ambassadorLevel = calculateAmbassadorLevel(data);

  return prisma.influencer.create({
    data: {
      ...data,
      shopId,
      totalFollowers,
      ambassadorLevel,
      youtubeFollowers: data.youtubeFollowers || 0,
      instagramFollowers: data.instagramFollowers || 0,
      tiktokFollowers: data.tiktokFollowers || 0,
      facebookFollowers: data.facebookFollowers || 0,
    },
  });
}

/**
 * Update influencer information
 */
export async function updateInfluencer(id, shopDomain, data) {
  const shopId = await ensureShop(shopDomain);
  
  const existing = await prisma.influencer.findFirst({
    where: { id, shopId },
  });
  
  if (!existing) {
    throw new Error("Influencer not found or access denied");
  }

  if (data.name !== undefined && (!data.name || data.name.trim() === "")) {
    throw new Error("Name cannot be empty");
  }

  // Merge data to recalculate
  const updatedData = {
    ...existing,
    ...data,
    youtubeFollowers: data.youtubeFollowers !== undefined ? data.youtubeFollowers : existing.youtubeFollowers,
    instagramFollowers: data.instagramFollowers !== undefined ? data.instagramFollowers : existing.instagramFollowers,
    tiktokFollowers: data.tiktokFollowers !== undefined ? data.tiktokFollowers : existing.tiktokFollowers,
    facebookFollowers: data.facebookFollowers !== undefined ? data.facebookFollowers : existing.facebookFollowers,
  };

  // Recalculate total followers and ambassador level
  const totalFollowers = calculateTotalFollowers(updatedData);
  const ambassadorLevel = calculateAmbassadorLevel(updatedData);

  return prisma.influencer.update({
    where: { id },
    data: {
      ...data,
      totalFollowers,
      ambassadorLevel,
    },
  });
}

/**
 * Delete influencer
 */
export async function deleteInfluencer(id, shopDomain) {
  const shopId = await ensureShop(shopDomain);
  
  const existing = await prisma.influencer.findFirst({
    where: { id, shopId },
  });
  
  if (!existing) {
    throw new Error("Influencer not found or access denied");
  }

  return prisma.influencer.delete({
    where: { id },
  });
}

/**
 * Bulk delete influencers
 */
export async function deleteInfluencers(ids, shopDomain) {
  const shopId = await ensureShop(shopDomain);
  
  // Verify all IDs belong to this shop
  const existingInfluencers = await prisma.influencer.findMany({
    where: {
      id: { in: ids },
      shopId,
    },
  });
  
  if (existingInfluencers.length !== ids.length) {
    throw new Error("Some influencers not found or access denied");
  }

  // Bulk delete
  return prisma.influencer.deleteMany({
    where: {
      id: { in: ids },
      shopId,
    },
  });
}

/**
 * Add communication log
 */
export async function addCommunicationLog(influencerId, shopDomain, data) {
  const shopId = await ensureShop(shopDomain);
  
  const influencer = await prisma.influencer.findFirst({
    where: { id: influencerId, shopId },
  });
  
  if (!influencer) {
    throw new Error("Influencer not found or access denied");
  }

  return prisma.communicationLog.create({
    data: {
      shopId,
      influencerId,
      type: data.type || 'OTHER',
      subject: data.subject,
      content: data.content,
      date: data.date || new Date(),
    },
  });
}

/**
 * Get communication logs
 */
export async function getCommunicationLogs(influencerId, shopDomain) {
  const shopId = await ensureShop(shopDomain);
  
  const influencer = await prisma.influencer.findFirst({
    where: { id: influencerId, shopId },
  });
  
  if (!influencer) {
    throw new Error("Influencer not found or access denied");
  }

  return prisma.communicationLog.findMany({
    where: { influencerId },
    orderBy: { date: 'desc' },
  });
}

/**
 * Get shop influencer statistics
 */
export async function getShopStats(shopDomain) {
  const shopId = await ensureShop(shopDomain);

  // Run multiple aggregate queries in parallel for better performance
  const [
    totalCount,
    followerSum,
    appliedCount,
    activeAmbassadorCount,
    levelGroups,
  ] = await Promise.all([
    // Total creators count
    prisma.influencer.count({ where: { shopId } }),
    // Sum of followers across platforms
    prisma.influencer.aggregate({
      where: { shopId },
      _sum: {
        youtubeFollowers: true,
        instagramFollowers: true,
        tiktokFollowers: true,
        facebookFollowers: true,
      },
    }),
    // Pending (APPLIED) count
    prisma.influencer.count({
      where: { shopId, collaborationStatus: "APPLIED" },
    }),
    // Active ambassadors (ACTIVE_AMBASSADOR) count
    prisma.influencer.count({
      where: { shopId, collaborationStatus: "ACTIVE_AMBASSADOR" },
    }),
    // Group by ambassador level
    prisma.influencer.groupBy({
      where: { shopId },
      by: ["ambassadorLevel"],
      _count: true,
    }),
  ]);

  // Calculate total followers
  const totalFollowers =
    (followerSum._sum.youtubeFollowers || 0) +
    (followerSum._sum.instagramFollowers || 0) +
    (followerSum._sum.tiktokFollowers || 0) +
    (followerSum._sum.facebookFollowers || 0);

  // Convert level groups to object
  const ambassadorLevelCounts = {
    AMBASSADOR_1: 0,
    AMBASSADOR_2: 0,
    AMBASSADOR_3: 0,
    NONE: 0,
  };
  levelGroups.forEach((group) => {
    ambassadorLevelCounts[group.ambassadorLevel] = group._count;
  });

  return {
    totalInfluencers: totalCount,
    totalFollowers,
    pendingCount: appliedCount,
    activeAmbassadors: activeAmbassadorCount,
    ambassadorLevelCounts,
  };
}